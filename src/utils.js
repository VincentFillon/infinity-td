import { Particle } from './entities/Particules.js';
import { gameState } from './state.js';

export function drawPolygon(ctx, x, y, radius, sides, angleOffset = 0) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        let a = angleOffset + (i * 2 * Math.PI / sides);
        ctx.lineTo(x + radius * Math.cos(a), y + radius * Math.sin(a));
    }
    ctx.closePath();
}

export function createParticle(x, y, color, count = 5, size = 3) {
    for (let i = 0; i < count; i++) {
        gameState.particles.push(new Particle(x, y, color, 3, size));
    }
}

export function triggerShake(amount) {
    gameState.screenShake.amount = Math.max(gameState.screenShake.amount, amount);
}
