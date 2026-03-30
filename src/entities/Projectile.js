import { gameState } from '../state.js';
import { Particle, LineParticle } from './Particules.js';
import { createParticle, triggerShake } from '../utils.js';
import { playHit, playCritHit, playExplosion } from '../audio.js';

export class Projectile {
    constructor(x, y, target, tower, angle, isCrit = false, pierceCount = 0) {
        this.x = x; this.y = y; this.target = target;
        this.tower = tower; this.color = tower.baseData.color;
        this.trail = []; this.angle = angle; this.isCrit = isCrit;
        this.pierceCount = pierceCount; this.hitTargets = new Set();
        if (tower.typeId === 'archer') this.speed = 800; else if (tower.typeId === 'cannon') this.speed = 400; else this.speed = 500;
    }
    update(dt) {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();
        
        if (!this.target || this.target.hp <= 0 || this.hitTargets.has(this.target)) {
            // Find a new target if piercing
            if (this.pierceCount > 0) {
                let bestE = null; let bestD = Infinity;
                for (let e of gameState.enemies) {
                    if (e.hp > 0 && !this.hitTargets.has(e)) {
                        let d = Math.hypot(e.x - this.x, e.y - this.y);
                        if (d < bestD && d < 200) { bestD = d; bestE = e; }
                    }
                }
                if (bestE) this.target = bestE; else return true;
            } else if (this.tower.typeId !== 'cannon') return true;
        }

        let dx = this.target.x - this.x; let dy = this.target.y - this.y;
        let dist = Math.hypot(dx, dy); let moveDist = this.speed * dt;
        if (dist > 1) this.angle = Math.atan2(dy, dx);
        if (dist <= moveDist || dist === 0) { 
            this.hit(this.target); 
            if (this.pierceCount > 0 && this.tower.typeId === 'archer') {
                this.pierceCount--; return false;
            }
            return true; 
        }
        else { this.x += (dx / dist) * moveDist; this.y += (dy / dist) * moveDist; return false; }
    }
    hit(target) {
        this.hitTargets.add(target);
        if (this.tower.aoe > 0) {
            playExplosion();
            triggerShake(4);
            createParticle(this.x, this.y, "#f97316", Math.floor(this.tower.aoe / 2), this.tower.aoe / 10);
            gameState.particles.push(new Particle(this.x, this.y, "rgba(239, 68, 68, 0.4)", 1, this.tower.aoe));
            gameState.enemies.forEach(e => {
                if (e.hp > 0 && Math.hypot(e.x - this.x, e.y - this.y) <= this.tower.aoe) { 
                    e.takeDamage(this.tower.damage, this.tower.baseData.dmgType, this.isCrit); 
                }
            });
        } else {
            if (this.isCrit) playCritHit(); else playHit();
            target.takeDamage(this.tower.damage, this.tower.baseData.dmgType, this.isCrit);
            createParticle(target.x, target.y, this.color, 15, 5);
        }

        if (this.tower.special === 'slow') {
            let existing = target.effects.find(e => e.type === 'slow');
            if (existing) existing.duration = 2; else target.effects.push({ type: 'slow', duration: 2, value: 0.5 });
        }
        if (this.tower.special === 'chain') {
            for (let e of gameState.enemies) {
                if (e !== target && e.hp > 0 && Math.hypot(e.x - target.x, e.y - target.y) < 150) {
                    e.takeDamage(this.tower.damage * 0.5, this.tower.baseData.dmgType, this.isCrit);
                    createParticle(e.x, e.y, "#38bdf8", 10); gameState.particles.push(new LineParticle(target.x, target.y, e.x, e.y, "#38bdf8")); break;
                }
            }
        }
    }
    draw(ctx) {
        if (this.trail.length > 1) {
            ctx.beginPath(); ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) ctx.lineTo(this.trail[i].x, this.trail[i].y);
            ctx.strokeStyle = this.color; ctx.lineWidth = this.tower.typeId === 'cannon' ? 5 : 3;
            ctx.lineCap = "round"; ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1.0;
        }
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
        if (this.tower.typeId === 'archer') {
            ctx.fillStyle = "#cbd5e1"; ctx.fillRect(-10, -1, 20, 2);
            ctx.fillStyle = this.color; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(5, -3); ctx.lineTo(5, 3); ctx.fill();
        } else if (this.tower.typeId === 'cannon') {
            ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#f87171"; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.shadowBlur = 10; ctx.shadowColor = this.color; ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        }
        ctx.restore();
    }
}