export let currentUser = null;
export function setCurrentUser(val) { currentUser = val; }
export let globalTime = 0;
export function setGlobalTime(val) { globalTime = val; }

export let gameState = {
    mode: 'menu', wave: 1, gold: 150, hp: 20, maxHp: 20,
    enemies: [], projectiles: [], particles: [], towers: [], spawnQueue: [],
    lastTime: 0, waveInProgress: false, spawnTimer: 0,
    selectedSpot: null, previewAction: null, activeSkill: null, gameSpeed: 1,
    screenShake: { amount: 0, decay: 10 },
    runModifiers: { attackSpeed: 1, pierce: 0, globalDmg: 1, goldMult: 1 }
};

export let currentScale = 1; 
export function setCurrentScale(val) { currentScale = val; }
export let camera = { x: 0, y: 0 };
export let drag = { active: false, startX: 0, startY: 0, camStartX: 0, camStartY: 0, hasMoved: false };
export let pinch = { active: false, initialDist: 0, initialScale: 1, vX: 0, vY: 0 };

export let userData = {
    stars: 0, maxWave: 0, gems: 0,
    upgrades: { archerDmg: 0, mageDmg: 0, cannonDmg: 0, baseHp: 0, goldStart: 0 },
    skills: { meteor: false, heal: false },
    premium: { startingLevel: 0, globalCrit: 0, globalIncome: 0 },
    currentRun: null // {wave, gold, hp, towers: [...]}
};
