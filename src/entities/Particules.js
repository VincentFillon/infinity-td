export class Particle {
    constructor(x, y, color, speed, size = 3) {
        this.x = x; this.y = y; this.color = color; this.size = size;
        let angle = Math.random() * Math.PI * 2; let vel = Math.random() * speed;
        this.vx = Math.cos(angle) * vel; this.vy = Math.sin(angle) * vel;
        this.life = 1.0; this.decay = Math.random() * 2 + 1;
    }
    update(dt) { this.x += this.vx * dt * 60; this.y += this.vy * dt * 60; this.life -= dt * this.decay; return this.life <= 0; }
    draw(ctx) { ctx.fillStyle = this.color; ctx.globalAlpha = Math.max(0, this.life); ctx.globalCompositeOperation = "lighter"; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1.0; }
}

export class LineParticle {
    constructor(x1, y1, x2, y2, color) { this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2; this.color = color; this.life = 1.0; }
    update(dt) { this.life -= dt * 5; return this.life <= 0; }
    draw(ctx) { ctx.strokeStyle = this.color; ctx.lineWidth = 4; ctx.globalAlpha = Math.max(0, this.life); ctx.shadowBlur = 10; ctx.shadowColor = this.color; ctx.beginPath(); ctx.moveTo(this.x1, this.y1); ctx.lineTo(this.x2, this.y2); ctx.stroke(); ctx.shadowBlur = 0; ctx.globalAlpha = 1.0; }
}

export class TextParticle {
    constructor(x, y, text, color) { this.x = x; this.y = y; this.text = text; this.color = color; this.life = 1.0; this.vy = -50; }
    update(dt) { this.y += this.vy * dt; this.life -= dt; return this.life <= 0; }
    draw(ctx) { ctx.fillStyle = this.color; ctx.globalAlpha = Math.max(0, this.life); ctx.font = "bold 24px Arial"; ctx.textAlign = "center"; ctx.shadowColor = "black"; ctx.shadowBlur = 4; ctx.fillText(this.text, this.x, this.y); ctx.shadowBlur = 0; ctx.globalAlpha = 1.0; }
}