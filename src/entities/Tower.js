import { TOWER_TYPES, fullPath } from '../config.js';
import { gameState, userData, globalTime } from '../state.js';
import { Projectile } from './Projectile.js';
import { drawPolygon } from '../utils.js';
import { playShoot } from '../audio.js';

export class Tower {
    constructor(spot, typeId) {
        this.spot = spot; this.x = spot.x; this.y = spot.y;
        this.typeId = typeId; this.baseData = TOWER_TYPES[typeId];
        this.level = 0; this.ultimate = null; this.stars = 0;
        this.timer = 0; this.target = null; this.angle = 0; this.recoil = 0;
        this.targetingPriority = 'first'; // 'first', 'close', 'strong', 'weak'
        this.updateStats();
    }
    updateStats() {
        let stats = this.ultimate ? this.baseData.ultimates.find(u => u.id === this.ultimate) : this.baseData.levels[this.level];
        this.range = stats.range;
        this.aoe = stats.aoe || 0;

        let dmgMult = 1;
        if (this.typeId === 'archer') dmgMult += (userData.upgrades.archerDmg || 0) * 0.1;
        if (this.typeId === 'mage') dmgMult += (userData.upgrades.mageDmg || 0) * 0.1;
        if (this.typeId === 'cannon') dmgMult += (userData.upgrades.cannonDmg || 0) * 0.1;

        // Bonus Système Étoiles
        let starDmgMult = 1 + (this.stars * 0.5); // +50% dégâts par étoile
        let starCdMult = 1 - (this.stars * 0.05); // -5% cooldown par étoile
        if (this.stars === 5) {
            starDmgMult += 1; // Bonus Super 5 étoiles
            this.range *= 1.25;
            if (this.aoe > 0) this.aoe *= 1.25;
        }

        let globalDmgMod = gameState.runModifiers ? gameState.runModifiers.globalDmg : 1;
        let globalSpeedMod = gameState.runModifiers ? gameState.runModifiers.attackSpeed : 1;
        let globalCritMod = (userData.premium && userData.premium.globalCrit) ? userData.premium.globalCrit * 0.05 : 0;

        this.damage = stats.dmg * dmgMult * starDmgMult * globalDmgMod;
        this.cd = Math.max(0.05, stats.cd * starCdMult * globalSpeedMod);
        this.critChance = 0.10 + (this.stars * 0.10) + globalCritMod; // 10% base + 10% per star
        this.special = stats.special || null;
    }
    update(dt) {
        this.timer += dt;
        this.recoil = Math.max(0, this.recoil - dt * 5);
        if (this.target && (this.target.hp <= 0 || Math.hypot(this.target.x - this.x, this.target.y - this.y) > this.range)) this.target = null;
        if (!this.target) {
            let bestEnemy = null; let bestScore = -Infinity;
            for (let e of gameState.enemies) {
                if (e.hp > 0 && Math.hypot(e.x - this.x, e.y - this.y) <= this.range) {
                    // Les canons ignorent les volants
                    if (this.typeId === 'cannon' && e.isFlying) continue;
                    
                    // Gestion de la furtivité
                    if (e.isStealth) {
                        let isRevealed = (e.pathIndex > fullPath.length / 2);
                        if (!isRevealed) {
                            // Révélé par un tour de Mage à proximité
                            isRevealed = gameState.towers.some(tw => tw.typeId === 'mage' && Math.hypot(tw.x - e.x, tw.y - e.y) <= tw.range);
                        }
                        if (!isRevealed) continue; // Toujours invisible
                    }

                    let score = 0;
                    if (this.targetingPriority === 'first') {
                        let nextIdx = Math.min(e.pathIndex + 1, fullPath.length - 1);
                        score = e.pathIndex * 1000 - Math.hypot(fullPath[nextIdx].x - e.x, fullPath[nextIdx].y - e.y);
                    } else if (this.targetingPriority === 'close') {
                        score = -Math.hypot(e.x - this.x, e.y - this.y);
                    } else if (this.targetingPriority === 'strong') {
                        score = e.hp;
                    } else if (this.targetingPriority === 'weak') {
                        score = -e.hp;
                    }

                    if (score > bestScore) { bestScore = score; bestEnemy = e; }
                }
            }
            this.target = bestEnemy;
        }
        if (this.target) {
            let targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            this.angle = targetAngle;
            let safetyLimiter = 0;
            while (this.target && this.timer >= this.cd && safetyLimiter < 5) {
                this.timer -= this.cd; this.recoil = 1;
                let isCrit = Math.random() < this.critChance;
                let pierceCount = (this.typeId === 'archer' && gameState.runModifiers) ? gameState.runModifiers.pierce : 0;
                if (safetyLimiter === 0) playShoot(this.typeId);
                gameState.projectiles.push(new Projectile(this.x, this.y, this.target, this, this.angle, isCrit, pierceCount));
                safetyLimiter++;
            }
            if (safetyLimiter >= 5) this.timer = 0;
        } else { this.angle += dt * 0.5; }
    }
    draw(ctx) {
        ctx.save(); ctx.translate(this.x, this.y);
        // Si 5 étoiles (Super), lueur dorée
        if (this.stars === 5) {
            ctx.shadowBlur = 15; ctx.shadowColor = "#fbbf24";
        }

        ctx.fillStyle = "#1e293b"; ctx.strokeStyle = "#334155"; ctx.lineWidth = 4;
        drawPolygon(ctx, 0, 0, 25, 6, Math.PI / 2); ctx.fill(); ctx.stroke();

        ctx.shadowBlur = 0; // reset
        ctx.strokeStyle = this.baseData.colorDark; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 15 + (this.level * 2), 0, Math.PI * 2); ctx.stroke();

        ctx.rotate(this.angle);
        if (this.typeId === 'archer') {
            ctx.translate(-this.recoil * 8, 0);
            ctx.fillStyle = this.baseData.color; ctx.fillRect(-10, -5, 25, 10);
            ctx.fillStyle = "#94a3b8";
            ctx.beginPath(); ctx.moveTo(10, -20); ctx.quadraticCurveTo(0, 0, 10, 20); ctx.lineWidth = 4; ctx.stroke();
            if (this.timer > this.cd * 0.5) {
                ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(10, -20); ctx.lineTo(-5, 0); ctx.lineTo(10, 20); ctx.stroke();
            }
        } else if (this.typeId === 'mage') {
            let floatY = Math.sin(globalTime * 5) * 3;
            ctx.translate(-this.recoil * 5, floatY);
            ctx.shadowBlur = 15; ctx.shadowColor = this.baseData.color; ctx.fillStyle = this.baseData.color;
            if (this.ultimate === 'archmage') drawPolygon(ctx, 0, 0, 18, 4);
            else if (this.ultimate === 'frost') drawPolygon(ctx, 0, 0, 15, 8);
            else drawPolygon(ctx, 0, 0, 15 + this.level * 2, 3);
            ctx.fill(); ctx.shadowBlur = 0;
            ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        } else if (this.typeId === 'cannon') {
            ctx.translate(-this.recoil * 10, 0);
            ctx.fillStyle = this.baseData.colorDark;
            ctx.beginPath(); ctx.arc(0, 0, 12 + (this.level), 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = this.baseData.color;
            ctx.fillRect(0, -8 - (this.level), 20 + (this.level * 2), 16 + (this.level * 2));
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(16 + (this.level * 2), -6 - (this.level), 4, 12 + (this.level * 2));
        }
        ctx.restore();

        // Dessin des étoiles en dessous
        if (this.stars > 0) {
            ctx.fillStyle = "#fbbf24"; ctx.font = "14px Arial"; ctx.textAlign = "center";
            let starStr = "★".repeat(this.stars);
            ctx.fillText(starStr, this.x, this.y + 35);
        }
    }
}