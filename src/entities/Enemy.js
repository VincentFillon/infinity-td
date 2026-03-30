import { fullPath } from '../config.js';
import { gameState, globalTime } from '../state.js';
import { createParticle, drawPolygon } from '../utils.js';
import { TextParticle } from './Particules.js';

export class Enemy {
    constructor(typeData, hpMult, speedMult, onEndReached) {
        this.x = fullPath[0].x; this.y = fullPath[0].y; this.pathIndex = 0;
        this.name = typeData.name; this.color = typeData.color; this.radius = typeData.radius;
        this.maxHp = typeData.hp * hpMult; this.hp = this.maxHp;
        this.baseSpeed = typeData.speed * speedMult; this.speed = this.baseSpeed;
        this.armor = typeData.armor || 0; this.magicResist = typeData.magicResist || 0;
        this.gold = typeData.gold; this.isBoss = typeData.isBoss || false; this.isHealer = typeData.isHealer || false;
        this.isFlying = typeData.isFlying || false; this.isStealth = typeData.isStealth || false;
        this.maxShield = typeData.shield || 0; this.shield = this.maxShield;
        this.effects = []; this.healTimer = 0; this.angle = 0; this.timeOffset = Math.random() * 10;
        this.hitFlashTimer = 0; this.timeSinceLastHit = 0;
        this.onEndReached = onEndReached;
    }
    update(dt) {
        if (this.hitFlashTimer > 0) this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
        this.speed = this.baseSpeed;
        for (let i = this.effects.length - 1; i >= 0; i--) {
            let eff = this.effects[i]; eff.duration -= dt;
            if (eff.duration <= 0) this.effects.splice(i, 1);
            else if (eff.type === 'slow') { this.speed *= (1 - eff.value); createParticle(this.x, this.y, "#93c5fd", 1, 0.5); }
        }
        if (this.isHealer && this.hp > 0) {
            this.healTimer += dt;
            if (this.healTimer >= 2) {
                this.healTimer = 0; createParticle(this.x, this.y, "#4ade80", 20, 2);
                gameState.enemies.forEach(e => {
                    if (e !== this && Math.hypot(e.x - this.x, e.y - this.y) < 150) {
                        e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.1); createParticle(e.x, e.y, "#4ade80", 5);
                    }
                });
            }
        }
        this.timeSinceLastHit += dt;
        if (this.timeSinceLastHit > 3 && this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + this.maxShield * 0.2 * dt); // 20% regen per sec after 3s
        }

        if (this.pathIndex < fullPath.length - 1) {
            // Les volants suivent le chemin mais à 1.4x la vitesse (immunité aux canons + rapidité)
            let speedMult = this.isFlying ? 1.4 : 1.0;
            let target = fullPath[this.pathIndex + 1];
            let dx = target.x - this.x; let dy = target.y - this.y;
            this.angle = Math.atan2(dy, dx);
            let dist = Math.hypot(dx, dy); let moveDist = this.speed * dt * 60 * speedMult;
            if (dist <= moveDist) { this.x = target.x; this.y = target.y; this.pathIndex++; }
            else { this.x += (dx / dist) * moveDist; this.y += (dy / dist) * moveDist; }
        } else { this.hp = 0; if (this.onEndReached) this.onEndReached(this.isBoss ? 5 : 1); }
    }
    draw(ctx) {
        let wobble = Math.sin((globalTime + this.timeOffset) * this.speed * 15) * 3;
        let scale = this.isBoss ? 1.5 : 1;
        ctx.save(); ctx.translate(this.x, this.y + (this.isFlying ? wobble - 10 : wobble)); ctx.rotate(this.angle); ctx.scale(scale, scale);
        
        let alpha = 1.0;
        if (this.isStealth) {
            let isRevealed = (this.pathIndex > fullPath.length / 2) || gameState.towers.some(tw => tw.typeId === 'mage' && Math.hypot(tw.x - this.x, tw.y - this.y) <= tw.range);
            if (!isRevealed) alpha = 0.3;
        }
        ctx.globalAlpha = alpha;

        if (!this.isFlying) {
            ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.ellipse(0, 5, this.radius, this.radius * 0.8, 0, 0, Math.PI * 2); ctx.fill();
        }

        ctx.fillStyle = this.hitFlashTimer > 0 ? "white" : this.color; 
        ctx.strokeStyle = this.hitFlashTimer > 0 ? "white" : "#0f172a"; 
        ctx.lineWidth = 2;

        if (this.isFlying) {
            ctx.beginPath(); ctx.moveTo(this.radius, 0); ctx.lineTo(-this.radius, -this.radius); ctx.lineTo(-this.radius * 0.5, 0); ctx.lineTo(-this.radius, this.radius); ctx.closePath();
        } else if (this.name === "Golem") { drawPolygon(ctx, 0, 0, this.radius, 6); }
        else if (this.name === "Orc" || this.isBoss) { drawPolygon(ctx, 0, 0, this.radius, 4, Math.PI / 4); }
        else { ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI * 2); }
        ctx.fill(); ctx.stroke();
        
        if (this.armor > 0) { ctx.fillStyle = "#64748b"; drawPolygon(ctx, 0, 0, this.radius * 0.6, 4); ctx.fill(); }
        if (this.isHealer) { ctx.fillStyle = "#2dd4bf"; ctx.beginPath(); ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2); ctx.fill(); }
        
        // Eyes
        ctx.fillStyle = this.isBoss ? "#ef4444" : "#fbbf24";
        if (!this.isFlying) {
            ctx.beginPath(); ctx.arc(this.radius * 0.4, -this.radius * 0.3, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(this.radius * 0.4, this.radius * 0.3, 3, 0, Math.PI * 2); ctx.fill();
        }

        // Shield UI
        if (this.shield > 0) {
            ctx.strokeStyle = "rgba(56, 189, 248, 0.8)"; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2); ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
        ctx.restore();
        
        let hpY = this.y - (this.radius * scale) - (this.isFlying ? 25 : 15);
        ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(this.x - 20, hpY, 40, 6);
        ctx.fillStyle = this.isBoss ? "#ef4444" : "#22c55e"; ctx.fillRect(this.x - 20, hpY, 40 * (Math.max(0, this.hp) / this.maxHp), 6);
        if (this.maxShield > 0) {
            ctx.fillStyle = "#38bdf8"; ctx.fillRect(this.x - 20, hpY - 3, 40 * (Math.max(0, this.shield) / this.maxShield), 3);
        }
    }
    takeDamage(amount, type, isCrit = false) {
        let actualDamage = amount;
        if (type === 'phys') actualDamage = amount * (100 / (100 + this.armor));
        else if (type === 'magic') actualDamage = amount * (100 / (100 + this.magicResist));
        
        if (isCrit) actualDamage *= 2;
        
        this.timeSinceLastHit = 0;
        this.hitFlashTimer = 0.1;

        if (this.shield > 0) {
            if (actualDamage <= this.shield) {
                this.shield -= actualDamage;
                actualDamage = 0;
            } else {
                actualDamage -= this.shield;
                this.shield = 0;
            }
        }

        if (actualDamage > 0) {
            this.hp -= actualDamage;
        }

        // Floating Damage Number
        let dmgColor = isCrit ? "#ef4444" : (this.shield > 0 && actualDamage === 0 ? "#38bdf8" : "white");
        let dmgPrefix = isCrit ? "CRIT " : "";
        gameState.particles.push(new TextParticle(this.x, this.y - this.radius, dmgPrefix + actualDamage.toFixed(0), dmgColor));
    }
}