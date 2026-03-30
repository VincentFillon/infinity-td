import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, MAP_PADDING } from './config.js';
import { gameState, camera, drag, pinch } from './state.js';

let canvasRef = null;
let callbacks = {
    onTap: () => { },
    onCameraMove: () => { }
};

// Accesseur pour récupérer la valeur de currentScale depuis state (qui est un export let)
// Comme c'est un export let, on peut l'importer et l'assigner directement si on importe tout de state.js
import * as state from './state.js';

export function initInput(canvas, providedCallbacks) {
    canvasRef = canvas;
    callbacks = { ...callbacks, ...providedCallbacks };

    canvas.addEventListener('mousedown', dragStart);
    canvas.addEventListener('mousemove', dragMove);
    canvas.addEventListener('mouseup', dragEnd);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); dragStart(e); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); dragMove(e); }, { passive: false });
    canvas.addEventListener('touchend', dragEnd);

    canvas.addEventListener('wheel', (e) => {
        if (gameState.mode !== 'playing') return;
        e.preventDefault();
        const pos = getPointerPos(e);
        const vX = (pos.x / state.currentScale) + camera.x;
        const vY = (pos.y / state.currentScale) + camera.y;
        let delta = e.deltaY < 0 ? 1.1 : 0.9;
        let newScale = Math.max(0.3, Math.min(state.currentScale * delta, 3.0));

        camera.x = vX - (pos.x / newScale);
        camera.y = vY - (pos.y / newScale);
        state.setCurrentScale(newScale); // On aura besoin d'un setter ou de modifier state directement
        enforceCameraBounds();
        callbacks.onCameraMove();
    }, { passive: false });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

export function enforceCameraBounds() {
    let minCamX = -MAP_PADDING;
    let maxCamX = VIRTUAL_WIDTH + MAP_PADDING - (canvasRef.width / state.currentScale);
    if (maxCamX < minCamX) camera.x = minCamX + (maxCamX - minCamX) / 2;
    else camera.x = Math.max(minCamX, Math.min(camera.x, maxCamX));

    let minCamY = -MAP_PADDING;
    let maxCamY = VIRTUAL_HEIGHT + MAP_PADDING - (canvasRef.height / state.currentScale);
    if (maxCamY < minCamY) camera.y = minCamY + (maxCamY - minCamY) / 2;
    else camera.y = Math.max(minCamY, Math.min(camera.y, maxCamY));
}

function resizeCanvas() {
    canvasRef.width = window.innerWidth;
    canvasRef.height = window.innerHeight;
    if (gameState.mode === 'menu') {
        state.setCurrentScale(Math.max(canvasRef.width / VIRTUAL_WIDTH, canvasRef.height / VIRTUAL_HEIGHT) * 1.0);
    }
    enforceCameraBounds();
}

function getPointerPos(e) {
    if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
}

function getPinchDist(t1, t2) {
    return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
}

function dragStart(e) {
    if (gameState.mode !== 'playing') return;
    if (e.touches && e.touches.length === 2) {
        pinch.active = true;
        drag.active = false;
        pinch.initialDist = getPinchDist(e.touches[0], e.touches[1]);
        pinch.initialScale = state.currentScale;
        let midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        let midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        pinch.vX = (midX / state.currentScale) + camera.x;
        pinch.vY = (midY / state.currentScale) + camera.y;
    } else {
        let pos = getPointerPos(e);
        drag.active = true;
        drag.hasMoved = false;
        pinch.active = false;
        drag.startX = pos.x;
        drag.startY = pos.y;
        drag.camStartX = camera.x;
        drag.camStartY = camera.y;
    }
}

function dragMove(e) {
    if (gameState.mode !== 'playing') return;
    if (e.touches && e.touches.length === 2 && pinch.active) {
        let currentDist = getPinchDist(e.touches[0], e.touches[1]);
        let newScale = Math.max(0.3, Math.min(pinch.initialScale * (currentDist / pinch.initialDist), 3.0));
        let newMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        let newMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        camera.x = pinch.vX - (newMidX / newScale);
        camera.y = pinch.vY - (newMidY / newScale);
        state.setCurrentScale(newScale);
        enforceCameraBounds();
        callbacks.onCameraMove();
    } else if (drag.active) {
        let pos = getPointerPos(e);
        let dx = pos.x - drag.startX;
        let dy = pos.y - drag.startY;
        if (Math.hypot(dx, dy) > 10) drag.hasMoved = true;
        camera.x = drag.camStartX - (dx / state.currentScale);
        camera.y = drag.camStartY - (dy / state.currentScale);
        enforceCameraBounds();
        callbacks.onCameraMove();
    }
}

function dragEnd(e) {
    if (gameState.mode !== 'playing') return;
    if (pinch.active && (!e.touches || e.touches.length < 2)) pinch.active = false;
    if (drag.active) {
        drag.active = false;
        if (!drag.hasMoved) {
            let pos = getPointerPos(e);
            let vX = (pos.x / state.currentScale) + camera.x;
            let vY = (pos.y / state.currentScale) + camera.y;
            callbacks.onTap(vX, vY);
        }
    }
}
