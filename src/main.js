import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, MAP_PADDING, fullPath, buildSpots, TOWER_TYPES, LAB_UPGRADES } from './config.js';
import { gameState, userData, currentScale, setCurrentScale, camera, globalTime, setGlobalTime } from './state.js';
import { initAuth, saveProgress, saveCurrentRun, getTopPlayers } from './firebase.js';
import { Particle, TextParticle } from './entities/Particules.js';
import { Tower } from './entities/Tower.js';
import { Enemy } from './entities/Enemy.js';
import { initInput, enforceCameraBounds } from './input.js';
import { initUI, updateHUD, updateSkillsUI, updateSkillsCD, updateFloatingUI, syncFloatingUI, showGameOver, showMenu, hideMenu, setSpeedText, updateAuthStatus, openTowerMenuFromSpot, showRogueliteModal, renderLeaderboard, renderBestiary } from './ui.js';
import { drawPolygon, createParticle, triggerShake } from './utils.js';
import { initAudio, resumeAudio, playExplosion, playError, setConfig } from './audio.js';
import { PREMIUM_UPGRADES } from './config.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let cdMeteorTimer = 0;
let cdHealTimer = 0;

// Initialization
initAuth();
initInput(canvas, {
  onTap: (x, y) => { resumeAudio(); handleTap(x, y); },
  onCameraMove: () => syncFloatingUI(camera, currentScale)
});

initUI({
  onStartGame: startGame,
  onStartWave: startWave,
  onToggleSpeed: toggleSpeed,
  onTogglePause: togglePause,
  onQuit: quitGame,
  onReturnToMenu: returnToMenu,
  onUseSkill: useSkill,
  onConfirmAction: confirmAction,
  onPreviewAction: previewAction,
  onBuyUpgrade: buyUpgrade,
  onBuyPremium: buyPremium,
  onPrestige: handlePrestige,
  onOpenLeaderboard: async () => {
    let players = await getTopPlayers();
    renderLeaderboard(players);
  },
  onOpenBestiary: () => {
    if (gameState.mode === 'playing') {
      gameState.mode = 'paused';
      renderBestiary();
      document.getElementById('menuBestiary').style.display = 'flex';
    }
  },
  onCloseBestiary: () => {
    if (gameState.mode === 'paused') {
      gameState.mode = 'playing';
      gameState.lastTime = performance.now();
      requestAnimationFrame(gameLoop);
    }
  },
  onSettingsChange: (sfxOn, musicOn) => {
    setConfig(sfxOn, musicOn);
  },
  onCloseTowerMenu: () => { gameState.selectedSpot = null; updateFloatingUI(camera, currentScale); }
});

initAudio();

function startGame(resume = false) {
  gameState.mode = 'playing';
  gameState.enemies = []; gameState.projectiles = []; gameState.particles = []; gameState.towers = [];
  buildSpots.forEach(s => s.tower = null); 
  gameState.waveInProgress = false; 
  gameState.spawnQueue = [];
  gameState.selectedSpot = null; 
  gameState.previewAction = null; 
  updateFloatingUI(camera, currentScale);
  
  gameState.gameSpeed = 1; 
  setSpeedText(1);
  gameState.runModifiers = { attackSpeed: 1, pierce: 0, globalDmg: 1, goldMult: 1 };

  if (resume && userData.currentRun) {
    gameState.wave = userData.currentRun.wave;
    gameState.gold = userData.currentRun.gold;
    gameState.hp = userData.currentRun.hp;
    gameState.maxHp = 20 + ((userData.upgrades.baseHp || 0) * 5);
    userData.currentRun.towers.forEach(tData => {
      let spot = buildSpots[tData.index];
      let t = new Tower(spot, tData.typeId);
      t.level = tData.level; t.ultimate = tData.ultimate; t.stars = tData.stars || 0;
      t.updateStats(); spot.tower = t; gameState.towers.push(t);
    });
  } else {
    gameState.wave = 1;
    gameState.gold = 150 + ((userData.upgrades.goldStart || 0) * 25);
    gameState.maxHp = 20 + ((userData.upgrades.baseHp || 0) * 5); 
    gameState.hp = gameState.maxHp;
    userData.currentRun = null; 
    saveProgress();
  }

  camera.x = (VIRTUAL_WIDTH - canvas.width / currentScale) / 2; 
  camera.y = (VIRTUAL_HEIGHT - canvas.height / currentScale) / 2; 
  enforceCameraBounds();

  hideMenu();
  updateHUD(); 
  updateSkillsUI(); 
  gameState.lastTime = performance.now(); 
  requestAnimationFrame(gameLoop);
}

function startWave() {
  if (gameState.waveInProgress) return;
  gameState.waveInProgress = true; 
  updateHUD(); // Mask next wave button

  let numEnemies = 5 + Math.floor(gameState.wave * 1.5);
  let hpMult = Math.pow(1.15, gameState.wave - 1); 
  let speedMult = Math.min(2.0, 1 + (gameState.wave * 0.02));
  
  let enemyTypes = [
    { name: "Gobelin", color: "#84cc16", hp: 15, speed: 1.5, radius: 10, gold: 5 },
    { name: "Orc", color: "#d97706", hp: 35, speed: 1.0, radius: 15, gold: 8, armor: 50 },
    { name: "Golem", color: "#cbd5e1", hp: 60, speed: 0.7, radius: 18, gold: 12, magicResist: 50 },
    { name: "Chevalier", color: "#fcd34d", hp: 40, shield: 30, speed: 0.8, radius: 15, gold: 15 }
  ];
  let specialTypes = [
    { name: "Chaman", color: "#2dd4bf", hp: 25, speed: 1.2, radius: 12, gold: 15, isHealer: true },
    { name: "Harpie", color: "#c084fc", hp: 20, speed: 1.2, radius: 12, gold: 10, isFlying: true },
    { name: "Ninja", color: "#334155", hp: 25, speed: 1.6, radius: 10, gold: 12, isStealth: true }
  ];

  for (let i = 0; i < numEnemies; i++) {
    let typePool = (gameState.wave >= 3 && Math.random() < 0.3) ? specialTypes : enemyTypes;
    gameState.spawnQueue.push({ type: typePool[Math.floor(Math.random() * typePool.length)], hpMult, speedMult });
  }
  if (gameState.wave % 5 === 0) {
      gameState.spawnQueue.push({ type: { name: "Roi Orc", color: "#ef4444", hp: 150, speed: 0.8, radius: 25, gold: 50, armor: 30, isBoss: true }, hpMult, speedMult });
  }
  gameState.spawnTimer = 0;
}

function takeDamage(amt) {
  gameState.hp -= amt; 
  createParticle(fullPath[fullPath.length - 1].x, fullPath[fullPath.length - 1].y, "#ef4444", 30, 5); 
  updateHUD();
  
  if (gameState.hp <= 0 && gameState.mode !== 'gameover') {
    gameState.mode = 'gameover'; 
    let starsEarned = Math.floor(gameState.wave * 1.5); 
    if (gameState.wave > userData.maxWave) userData.maxWave = gameState.wave;
    userData.stars += starsEarned;
    userData.currentRun = null; 
    saveProgress();
    showGameOver(gameState.wave, starsEarned);
  }
}

function checkWaveEnd() {
  if (gameState.spawnQueue.length === 0 && gameState.enemies.length === 0 && gameState.waveInProgress) {
    gameState.waveInProgress = false; 
    gameState.wave++; 
    userData.stars += 1; 
    gameState.gold += 50 + (gameState.wave * 5);
    updateHUD(); 
    saveCurrentRun();

    // Roguelite Choice
    if ((gameState.wave - 1) % 5 === 0 && (gameState.wave - 1) > 0) {
        gameState.mode = 'paused';
        // Forcer la fermeture du menu de tour si ouvert
        gameState.selectedSpot = null;
        gameState.previewAction = null;

        let choices = [
            { id: 'attackSpeed', name: "Frénésie", icon: "⚡", desc: "+10% Vit. d'attaque globale", action: () => gameState.runModifiers.attackSpeed *= 0.9 },
            { id: 'pierce', name: "Perce-Blindage", icon: "🏹", desc: "Tirs perçants (Archer)", action: () => gameState.runModifiers.pierce += 1 },
            { id: 'globalDmg', name: "Force Brute", icon: "💪", desc: "+15% Dégâts globaux", action: () => gameState.runModifiers.globalDmg *= 1.15 },
            { id: 'goldMult', name: "Midas", icon: "💰", desc: "+20% Or par ennemi", action: () => gameState.runModifiers.goldMult *= 1.2 },
            { id: 'baseHeal', name: "Régénération", icon: "💚", desc: "Soigne la base de 10 PV", action: () => { gameState.hp = Math.min(gameState.maxHp, gameState.hp + 10); updateHUD(); } }
        ];
        choices.sort(() => 0.5 - Math.random());
        let selectedChoices = choices.slice(0, 3);
        
        showRogueliteModal(selectedChoices, (choice) => {
            choice.action();
            // Appliquer les modificateurs directement aux tours existantes
            gameState.towers.forEach(t => t.updateStats());
            gameState.mode = 'playing';
            gameState.lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        });
    }
  }
}

function handleTap(vX, vY) {
  if (gameState.activeSkill === 'meteor') {
    if (cdMeteorTimer <= 0) {
      cdMeteorTimer = 30; 
      createParticle(vX, vY, "#ef4444", 80, 8); 
      triggerShake(15);
      playExplosion();
      gameState.particles.push(new TextParticle(vX, vY - 20, "MÉTÉORE !", "#ef4444"));
      gameState.enemies.forEach(en => { 
          if (Math.hypot(en.x - vX, en.y - vY) < 150) en.takeDamage(200 * Math.pow(1.1, gameState.wave), 'magic'); 
      });
      gameState.activeSkill = null;
    } else {
        playError();
    }
    return;
  }
  
  let tappedSpot = buildSpots.find(s => Math.hypot(s.x - vX, s.y - vY) < 40);
  if (tappedSpot) { 
      if (gameState.selectedSpot !== tappedSpot) { 
          gameState.selectedSpot = tappedSpot; 
          gameState.previewAction = null; 
      } 
  } else { 
      gameState.selectedSpot = null; 
      gameState.previewAction = null; 
  }
  updateFloatingUI(camera, currentScale);
}

function toggleSpeed() {
    if (gameState.gameSpeed === 1) gameState.gameSpeed = 2;
    else if (gameState.gameSpeed === 2) gameState.gameSpeed = 4;
    else gameState.gameSpeed = 1;
    setSpeedText(gameState.gameSpeed);
}

function togglePause() {
    if (gameState.mode === 'playing') gameState.mode = 'paused';
    else if (gameState.mode === 'paused') {
        gameState.mode = 'playing';
        gameState.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

function quitGame() {
    saveCurrentRun();
    returnToMenu();
}

function returnToMenu() {
    gameState.mode = 'menu';
    showMenu(userData.currentRun !== null);
}

function useSkill(skillId) {
    if (skillId === 'meteor') {
        if (cdMeteorTimer > 0) return;
        gameState.activeSkill = 'meteor';
        gameState.selectedSpot = null;
        updateFloatingUI(camera, currentScale);
        gameState.particles.push(new TextParticle((VIRTUAL_WIDTH / 2), (VIRTUAL_HEIGHT / 2), "Tapez pour lancer", "#ef4444"));
    } else if (skillId === 'heal') {
        if (cdHealTimer > 0 || gameState.hp >= gameState.maxHp) return;
        cdHealTimer = 45;
        gameState.hp = Math.min(gameState.maxHp, gameState.hp + Math.floor(gameState.maxHp * 0.5));
        createParticle(fullPath[fullPath.length - 1].x, fullPath[fullPath.length - 1].y, "#22c55e", 50, 4);
        updateHUD();
        saveCurrentRun();
    }
}

function confirmAction() {
  let pa = gameState.previewAction; 
  let spot = gameState.selectedSpot;
  if (!pa || !spot || (pa.cost > 0 && gameState.gold < pa.cost)) return cancelAction();
  
  gameState.gold -= pa.cost;
  let shouldReopen = true;

  if (pa.type === 'build') { 
      spot.tower = new Tower(spot, pa.towerId); 
      // Apply Starting Level from Premium
      spot.tower.level = Math.min((userData.premium.startingLevel || 0), spot.tower.baseData.levels.length - 1);
      spot.tower.updateStats();
      gameState.towers.push(spot.tower); 
  }
  else if (pa.type === 'upgrade') { spot.tower.level = pa.level; spot.tower.updateStats(); }
  else if (pa.type === 'ultimate') { spot.tower.ultimate = pa.ultimateId; spot.tower.updateStats(); }
  else if (pa.type === 'star') { spot.tower.stars++; spot.tower.updateStats(); }
  else if (pa.type === 'sell') {
    gameState.towers = gameState.towers.filter(tw => tw !== spot.tower);
    spot.tower = null;
    shouldReopen = false;
    gameState.selectedSpot = null;
  }

  gameState.previewAction = null;
  updateHUD();
  updateFloatingUI(camera, currentScale);
  saveCurrentRun();

  if (shouldReopen) {
    openTowerMenuFromSpot();
  }
}

function cancelAction() {
  gameState.previewAction = null;
  updateFloatingUI(camera, currentScale);
  if (gameState.selectedSpot) openTowerMenuFromSpot();
}

function previewAction(pa) {
    gameState.previewAction = pa;
    updateFloatingUI(camera, currentScale);
}

function buyUpgrade(key) {
  let def = LAB_UPGRADES[key]; 
  let isSkill = key.startsWith('skill');
  let currentLevel = isSkill ? (userData.skills[key.replace('skill', '').toLowerCase()] ? 1 : 0) : (userData.upgrades[key] || 0);
  
  if (currentLevel < def.maxLevel && userData.stars >= def.cost) {
    userData.stars -= def.cost;
    if (isSkill) userData.skills[key.replace('skill', '').toLowerCase()] = true; 
    else userData.upgrades[key] = currentLevel + 1;
    saveProgress();
  }
}

function handlePrestige() {
  if (userData.maxWave > 10) {
      if (!confirm("Voulez-vous réinitialiser votre progression contre des Gemmes ? Vos étoiles et améliorations de labo seront perdues.")) return;
      let gemsGained = Math.floor(userData.maxWave / 5);
      userData.gems += gemsGained;
      userData.stars = 0;
      userData.maxWave = 0;
      userData.upgrades = { archerDmg: 0, mageDmg: 0, cannonDmg: 0, baseHp: 0, goldStart: 0 };
      userData.skills = { meteor: false, heal: false };
      userData.currentRun = null;
      saveProgress();
      showMenu(false);
  }
}

function buyPremium(key, cost) {
  let def = PREMIUM_UPGRADES[key];
  if (userData.gems >= cost && (userData.premium[key] || 0) < def.maxLevel) {
      userData.gems -= cost;
      userData.premium[key] = (userData.premium[key] || 0) + 1;
      saveProgress();
  }
}

function drawBackground(ctx) {
  ctx.fillStyle = "#0f172a"; 
  ctx.fillRect(-MAP_PADDING, -MAP_PADDING, VIRTUAL_WIDTH + MAP_PADDING * 2, VIRTUAL_HEIGHT + MAP_PADDING * 2);
  
  ctx.strokeStyle = "rgba(56, 189, 248, 0.1)"; ctx.lineWidth = 1; ctx.beginPath();
  for (let i = 0; i < VIRTUAL_WIDTH; i += 50) { ctx.moveTo(i, 0); ctx.lineTo(i, VIRTUAL_HEIGHT); }
  for (let i = 0; i < VIRTUAL_HEIGHT; i += 50) { ctx.moveTo(0, i); ctx.lineTo(VIRTUAL_WIDTH, i); }
  ctx.stroke();

  ctx.shadowBlur = 20; ctx.shadowColor = "#3b82f6";
  ctx.strokeStyle = "#1e3a8a"; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 64;
  ctx.beginPath(); ctx.moveTo(fullPath[0].x, fullPath[0].y); for (let i = 1; i < fullPath.length; i++) ctx.lineTo(fullPath[i].x, fullPath[i].y); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "#60a5fa"; ctx.lineWidth = 50; ctx.setLineDash([20, 10]); ctx.lineDashOffset = -globalTime * 20;
  ctx.beginPath(); ctx.moveTo(fullPath[0].x, fullPath[0].y); for (let i = 1; i < fullPath.length; i++) ctx.lineTo(fullPath[i].x, fullPath[i].y); ctx.stroke(); ctx.setLineDash([]);

  let end = fullPath[fullPath.length - 1];
  ctx.shadowBlur = 30; ctx.shadowColor = "#3b82f6";
  ctx.fillStyle = "#1e3a8a"; drawPolygon(ctx, end.x, end.y, 50, 6, globalTime); ctx.fill();
  ctx.fillStyle = "#60a5fa"; drawPolygon(ctx, end.x, end.y, 30, 6, -globalTime); ctx.fill(); ctx.shadowBlur = 0;

  buildSpots.forEach(s => {
    ctx.fillStyle = "rgba(30, 41, 59, 0.8)"; drawPolygon(ctx, s.x, s.y, 30, 6, Math.PI / 2); ctx.fill();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.5)"; ctx.lineWidth = 2; ctx.stroke();
  });
}

function gameLoop(time) {
  if (gameState.mode !== 'playing') return;
  
  let baseDt = (time - gameState.lastTime) / 1000; 
  if (baseDt > 0.1) baseDt = 0.1;
  gameState.lastTime = time; 
  
  let dt = baseDt * gameState.gameSpeed; 
  setGlobalTime(globalTime + dt);

  if (gameState.waveInProgress) {
    if (gameState.spawnQueue.length > 0) {
      gameState.spawnTimer += dt; 
      let spawnRate = Math.max(0.5, 1.5 - (gameState.wave * 0.05));
      let safetySpawn = 0;
      while (gameState.spawnQueue.length > 0 && gameState.spawnTimer >= spawnRate && safetySpawn < 50) {
        gameState.spawnTimer -= spawnRate;
        let next = gameState.spawnQueue.shift();
        gameState.enemies.push(new Enemy(next.type, next.hpMult, next.speedMult, takeDamage));
        safetySpawn++;
      }
    }
    
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
      let e = gameState.enemies[i]; e.update(dt);
      if (e.hp <= 0) { 
          if (e.gold) { 
              let actualGold = e.gold * gameState.runModifiers.goldMult * (1 + (userData.premium.globalIncome || 0) * 0.1);
              gameState.gold += actualGold; 
              gameState.particles.push(new TextParticle(e.x, e.y, "+" + Math.floor(actualGold), "#fbbf24")); 
          } 
          gameState.enemies.splice(i, 1); 
          updateHUD(); 
      }
    }
    
    gameState.towers.forEach(t => t.update(dt));
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) { 
        if (gameState.projectiles[i].update(dt)) gameState.projectiles.splice(i, 1); 
    }
    checkWaveEnd();
  }

  for (let i = gameState.particles.length - 1; i >= 0; i--) { 
      if (gameState.particles[i].update(dt)) gameState.particles.splice(i, 1); 
  }
  
  // Update UI Timers
  if (cdMeteorTimer > 0) cdMeteorTimer = Math.max(0, cdMeteorTimer - dt);
  if (cdHealTimer > 0) cdHealTimer = Math.max(0, cdHealTimer - dt);
  updateSkillsCD(dt, { cdMeteorTimer, cdHealTimer });
  
  syncFloatingUI(camera, currentScale);

  // Screen Shake update
  let shakeX = 0; let shakeY = 0;
  if (gameState.screenShake.amount > 0) {
      shakeX = (Math.random() - 0.5) * gameState.screenShake.amount;
      shakeY = (Math.random() - 0.5) * gameState.screenShake.amount;
      gameState.screenShake.amount -= gameState.screenShake.decay * dt;
      if (gameState.screenShake.amount < 0) gameState.screenShake.amount = 0;
  }

  ctx.save(); 
  ctx.fillStyle = "black"; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(currentScale, currentScale); 
  ctx.translate(-camera.x + shakeX, -camera.y + shakeY);

  drawBackground(ctx);
  gameState.enemies.forEach(e => e.draw(ctx)); 
  gameState.towers.forEach(t => t.draw(ctx));

  if (gameState.selectedSpot) {
    let spot = gameState.selectedSpot;
    if (gameState.previewAction && gameState.previewAction.range > 0) {
      ctx.fillStyle = "rgba(14, 165, 233, 0.15)"; ctx.strokeStyle = "rgba(14, 165, 233, 0.8)";
      ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(spot.x, spot.y, gameState.previewAction.range, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (spot.tower) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"; ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(spot.x, spot.y, spot.tower.range, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
  }

  gameState.projectiles.forEach(p => p.draw(ctx)); 
  gameState.particles.forEach(p => p.draw(ctx));
  
  if (gameState.activeSkill === 'meteor') { 
      ctx.fillStyle = "rgba(239, 68, 68, 0.1)"; 
      ctx.fillRect(camera.x, camera.y, canvas.width / currentScale, canvas.height / currentScale); 
  }

  ctx.restore(); 
  requestAnimationFrame(gameLoop);
}