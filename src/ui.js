import { TOWER_TYPES, LAB_UPGRADES, PREMIUM_UPGRADES, ENEMY_BESTIARY } from './config.js';
import { gameState, userData } from './state.js';
import { drawPolygon } from './utils.js';

// DOM Elements
const el = {
    hud: document.getElementById('hud'),
    hp: document.getElementById('hpDisplay'),
    gold: document.getElementById('goldDisplay'),
    stars: document.getElementById('starsDisplay'),
    wave: document.getElementById('waveDisplay'),
    btnNextWave: document.getElementById('btnNextWave'),
    btnSpeed: document.getElementById('btnSpeed'),
    btnQuit: document.getElementById('btnQuit'),
    btnPause: document.getElementById('btnPause'),

    skillsBar: document.getElementById('skillsBar'),
    btnMeteor: document.getElementById('btnSkillMeteor'),
    cdMeteor: document.getElementById('cdMeteor'),
    btnHeal: document.getElementById('btnSkillHeal'),
    cdHeal: document.getElementById('cdHeal'),

    floatingUI: document.getElementById('floatingUI'),

    menuMain: document.getElementById('menuMain'),
    btnPlay: document.getElementById('btnPlay'),
    btnResume: document.getElementById('btnResume'),
    btnUpgrades: document.getElementById('btnUpgrades'),
    btnPremiumLab: document.getElementById('btnPremiumLab'),
    btnPrestige: document.getElementById('btnPrestige'),
    gemsDisplay: document.getElementById('gemsDisplay'),
    authStatus: document.getElementById('authStatus'),

    menuPremium: document.getElementById('menuPremium'),
    btnClosePremium: document.getElementById('btnClosePremium'),
    premiumGems: document.getElementById('premiumGems'),
    premiumList: document.getElementById('premiumList'),

    menuRoguelite: document.getElementById('menuRoguelite'),
    rogueliteChoices: document.getElementById('rogueliteChoices'),

    menuTower: document.getElementById('menuTower'),
    towerMenuTitle: document.getElementById('towerMenuTitle'),
    btnCloseTowerMenu: document.getElementById('btnCloseTowerMenu'),
    buildOptions: document.getElementById('buildOptions'),
    upgradeOptions: document.getElementById('upgradeOptions'),

    menuLab: document.getElementById('menuLab'),
    btnCloseLab: document.getElementById('btnCloseLab'),
    labStars: document.getElementById('labStars'),
    labList: document.getElementById('labList'),

    menuBestiary: document.getElementById('menuBestiary'),
    btnBestiary: document.getElementById('btnBestiary'),
    btnCloseBestiary: document.getElementById('btnCloseBestiary'),
    bestiaryList: document.getElementById('bestiaryList'),

    menuGameOver: document.getElementById('menuGameOver'),
    goWave: document.getElementById('goWave'),
    goStars: document.getElementById('goStars'),
    btnReturnMain: document.getElementById('btnReturnMain'),

    btnLeaderboard: document.getElementById('btnLeaderboard'),
    btnSettings: document.getElementById('btnSettings'),
    menuLeaderboard: document.getElementById('menuLeaderboard'),
    btnCloseLeaderboard: document.getElementById('btnCloseLeaderboard'),
    leaderboardList: document.getElementById('leaderboardList'),
    menuSettings: document.getElementById('menuSettings'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    toggleSfx: document.getElementById('toggleSfx'),
    toggleMusic: document.getElementById('toggleMusic')
};

let callbacks = {};

export function initUI(providedCallbacks) {
    callbacks = providedCallbacks;

    // Listeners simple
    el.btnPlay.onclick = () => callbacks.onStartGame(false);
    el.btnResume.onclick = () => callbacks.onStartGame(true);
    el.btnNextWave.onclick = () => callbacks.onStartWave();
    el.btnSpeed.onclick = () => callbacks.onToggleSpeed();
    el.btnPause.onclick = () => callbacks.onTogglePause();
    el.btnQuit.onclick = () => callbacks.onQuit();
    el.btnUpgrades.onclick = () => {
        el.menuLab.classList.remove('hidden');
        renderLab();
    };
    el.btnCloseLab.onclick = () => el.menuLab.classList.add('hidden');

    el.btnPremiumLab.onclick = () => {
        el.menuPremium.classList.remove('hidden');
        renderPremium();
    };
    el.btnClosePremium.onclick = () => el.menuPremium.classList.add('hidden');

    el.btnPrestige.onclick = () => callbacks.onPrestige();

    el.btnBestiary.onclick = () => {
        callbacks.onOpenBestiary();
    };
    el.btnCloseBestiary.onclick = () => {
        el.menuBestiary.style.display = 'none';
        callbacks.onCloseBestiary();
    };

    el.btnLeaderboard.onclick = () => {
        el.menuLeaderboard.classList.remove('hidden');
        callbacks.onOpenLeaderboard();
    };
    el.btnCloseLeaderboard.onclick = () => el.menuLeaderboard.classList.add('hidden');

    el.btnSettings.onclick = () => el.menuSettings.classList.remove('hidden');
    el.btnCloseSettings.onclick = () => el.menuSettings.classList.add('hidden');

    el.toggleSfx.onchange = () => callbacks.onSettingsChange(el.toggleSfx.checked, el.toggleMusic.checked);
    el.toggleMusic.onchange = () => callbacks.onSettingsChange(el.toggleSfx.checked, el.toggleMusic.checked);

    el.btnCloseTowerMenu.onclick = () => {
        el.menuTower.classList.add('hidden');
        callbacks.onCancelAction();
    };
    el.btnReturnMain.onclick = () => callbacks.onReturnToMenu();

    el.btnMeteor.onclick = () => callbacks.onUseSkill('meteor');
    el.btnHeal.onclick = () => callbacks.onUseSkill('heal');

    // Backdrop clicks
    document.querySelectorAll('.modal-bg').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (modal.id === 'menuTower' && !gameState.previewAction) {
                    modal.classList.add('hidden');
                    callbacks.onCloseTowerMenu();
                } else if (modal.id === 'menuLab' || modal.id === 'menuPremium' || modal.id === 'menuLeaderboard' || modal.id === 'menuSettings') {
                    modal.classList.add('hidden');
                }
            }
        });
    });
}

export function updateHUD() {
    el.hp.innerText = Math.max(0, gameState.hp);
    el.gold.innerText = Math.floor(gameState.gold);
    el.wave.innerText = gameState.wave;
    el.stars.innerText = userData.stars;
    
    if (gameState.waveInProgress) el.btnNextWave.classList.add('hidden');
    else el.btnNextWave.classList.remove('hidden');
}

export function updateSkillsUI() {
    if (userData.skills.meteor) el.btnMeteor.classList.remove('hidden');
    if (userData.skills.heal) el.btnHeal.classList.remove('hidden');
}

export function updateSkillsCD(dt, timers) {
    const { cdMeteorTimer, cdHealTimer } = timers;
    
    if (cdMeteorTimer > 0) {
        el.cdMeteor.classList.remove('hidden');
        el.cdMeteor.innerText = Math.ceil(cdMeteorTimer);
        el.btnMeteor.disabled = true;
    } else {
        el.cdMeteor.classList.add('hidden');
        el.btnMeteor.disabled = false;
    }

    if (cdHealTimer > 0) {
        el.cdHeal.classList.remove('hidden');
        el.cdHeal.innerText = Math.ceil(cdHealTimer);
        el.btnHeal.disabled = true;
    } else {
        el.cdHeal.classList.add('hidden');
        el.btnHeal.disabled = false;
    }
}

export function updateFloatingUI(camera, currentScale) {
    if (gameState.selectedSpot) {
        el.floatingUI.classList.remove('hidden');
        if (gameState.previewAction) {
            el.floatingUI.innerHTML = `
                <button id="btnConfirmAction" class="bg-emerald-600 hover:bg-emerald-500 rounded-full w-14 h-14 text-2xl shadow-[0_0_20px_rgba(16,185,129,0.8)] border-2 border-emerald-300 active:scale-95 transition-all">✔️</button>
                <button id="btnCancelAction" class="bg-rose-600 hover:bg-rose-500 rounded-full w-14 h-14 text-2xl shadow-[0_0_20px_rgba(225,29,72,0.8)] border-2 border-rose-300 active:scale-95 transition-all">❌</button>
            `;
            document.getElementById('btnConfirmAction').onclick = callbacks.onConfirmAction;
            document.getElementById('btnCancelAction').onclick = callbacks.onCancelAction;
        } else {
            let icon = gameState.selectedSpot.tower ? "⬆️" : "➕";
            let color = gameState.selectedSpot.tower ? "indigo" : "emerald";
            el.floatingUI.innerHTML = `
                <button id="btnOpenMenu" class="bg-${color}-600 hover:bg-${color}-500 rounded-full w-14 h-14 text-2xl shadow-[0_0_20px_var(--tw-shadow-color)] shadow-${color}-500/80 border-2 border-${color}-300 active:scale-95 transition-all">${icon}</button>
            `;
            document.getElementById('btnOpenMenu').onclick = openTowerMenuFromSpot;
        }
        syncFloatingUI(camera, currentScale);
    } else {
        el.floatingUI.classList.add('hidden');
    }
}

export function syncFloatingUI(camera, currentScale) {
    if (!gameState.selectedSpot) return;
    el.floatingUI.style.left = ((gameState.selectedSpot.x - camera.x) * currentScale) + 'px';
    el.floatingUI.style.top = ((gameState.selectedSpot.y - camera.y) * currentScale) + 'px';
}

function openTowerMenuFromSpot() {
    el.menuTower.classList.remove('hidden');
    const buildOpts = el.buildOptions;
    const upOpts = el.upgradeOptions;
    const title = el.towerMenuTitle;
    
    buildOpts.innerHTML = '';
    upOpts.innerHTML = '';
    let spot = gameState.selectedSpot;

    if (!spot.tower) {
        title.innerText = "Construire une Tour";
        buildOpts.classList.remove('hidden');
        upOpts.classList.add('hidden');
        for (let [id, data] of Object.entries(TOWER_TYPES)) {
            let canAfford = gameState.gold >= data.cost;
            let lvl0 = data.levels[0];
            let atkPerSec = (lvl0.dmg / lvl0.cd).toFixed(1);
            let dmgTypeLabel = data.dmgType === 'magic' ? '✨ Magique' : '⚔️ Physique';
            let critPct = '10%';
            let aoeText = lvl0.aoe ? `<div class="stat-chip" style="border-color:#f87171;">💥 Zone ${lvl0.aoe}</div>` : '';

            let card = document.createElement('div');
            card.style.cssText = `border-radius:1rem; border:1px solid ${canAfford ? data.color + '66' : '#475569'}; background: ${canAfford ? 'linear-gradient(135deg,#1e293b,#0f172a)' : '#111827'}; padding:0; overflow:hidden; opacity:${canAfford ? 1 : 0.55};`;
            card.innerHTML = `
              <div style="display:flex; align-items:stretch; gap:0;">
                <div style="display:flex; align-items:center; justify-content:center; padding:0.75rem; background:rgba(0,0,0,0.3); min-width:70px;">
                  <canvas class="tower-mini-canvas" data-type="${id}" width="54" height="54" style="border-radius:0.5rem;"></canvas>
                </div>
                <div style="flex:1; padding:0.75rem 0.75rem 0.75rem 0;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
                    <div style="font-weight:700; font-size:1rem; color:${data.color};">${data.icon} ${data.name}</div>
                    <div style="font-weight:700; color:#facc15; background:rgba(0,0,0,0.4); padding:0.15rem 0.6rem; border-radius:999px; font-size:0.85rem;">💰 ${data.cost}</div>
                  </div>
                  <div style="font-size:0.72rem; color:#94a3b8; margin-bottom:0.5rem; line-height:1.4;">${data.desc}</div>
                  <div style="display:flex; flex-wrap:wrap; gap:0.3rem;">
                    <div class="stat-chip" style="border-color:${data.color};">⚔️ ${lvl0.dmg} dmg</div>
                    <div class="stat-chip" style="border-color:#60a5fa;">⚡ ${atkPerSec}/s</div>
                    <div class="stat-chip" style="border-color:${data.dmgType === 'magic' ? '#c084fc' : '#fbbf24'};">${dmgTypeLabel}</div>
                    <div class="stat-chip" style="border-color:#f87171;">🎯 Crit 10%</div>
                    ${aoeText}
                  </div>
                </div>
              </div>
            `;
            if (canAfford) {
                card.style.cursor = 'pointer';
                card.onclick = () => {
                    el.menuTower.classList.add('hidden');
                    callbacks.onPreviewAction({ type: 'build', cost: data.cost, towerId: id, range: data.levels[0].range });
                };
            }
            buildOpts.appendChild(card);
            // Draw mini tower preview
            requestAnimationFrame(() => {
                let c = card.querySelector('.tower-mini-canvas');
                if (c) drawMiniTower(c, id, data);
            });
        }
    } else {
        let t = spot.tower;
        title.innerText = "Tour " + t.baseData.name;
        buildOpts.classList.add('hidden');
        upOpts.classList.remove('hidden');

        // Bloc d'infos de la tour actuelle
        let infoBlock = document.createElement('div');
        infoBlock.style.cssText = "margin-bottom:1rem; background:rgba(0,0,0,0.4); border-radius:1rem; padding:1rem; border:1px solid rgba(255,255,255,0.1);";
        
        let atkPerSec = (t.damage / t.cd).toFixed(1);
        let dmgTypeLabel = t.baseData.dmgType === 'magic' ? '✨ Magique' : '⚔️ Physique';
        let starStr = "★".repeat(t.stars);
        
        infoBlock.innerHTML = `
            <div style="display:flex; gap:1rem; align-items:center; margin-bottom:0.75rem;">
                <div style="background:rgba(0,0,0,0.5); padding:0.5rem; border-radius:0.75rem;">
                    <canvas id="towerInfoCanvas" width="60" height="60"></canvas>
                </div>
                <div style="flex:1;">
                    <div style="font-weight:800; font-size:1.1rem; color:${t.baseData.color};">${t.baseData.icon} ${t.baseData.name} ${t.level > 0 ? '(Niv.'+(t.level+1)+')' : ''}</div>
                    <div style="color:#facc15; font-size:0.9rem;">${starStr}</div>
                </div>
            </div>
            <div style="font-size:0.75rem; color:#94a3b8; margin-bottom:0.75rem; line-height:1.4;">${t.baseData.desc}</div>
            <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                <div class="stat-chip" style="border-color:${t.baseData.color};">⚔️ ${Math.floor(t.damage)} dmg</div>
                <div class="stat-chip" style="border-color:#60a5fa;">⚡ ${atkPerSec}/s</div>
                <div class="stat-chip" style="border-color:#fbbf24;">📏 ${t.range} port.</div>
                <div class="stat-chip" style="border-color:${t.baseData.dmgType === 'magic' ? '#c084fc' : '#fbbf24'};">${dmgTypeLabel}</div>
                <div class="stat-chip" style="border-color:#f87171;">🎯 Crit ${Math.floor(t.critChance*100)}%</div>
                ${t.aoe > 0 ? `<div class="stat-chip" style="border-color:#f87171;">💥 Zone ${Math.floor(t.aoe)}</div>` : ''}
            </div>
        `;
        upOpts.appendChild(infoBlock);
        
        requestAnimationFrame(() => {
            let c = document.getElementById('towerInfoCanvas');
            if (c) drawMiniTower(c, t.typeId, t.baseData);
        });

        let targetBtn = document.createElement('button');
        let tLabels = { 'first': 'Premier', 'close': 'Proche', 'strong': 'Plus Fort', 'weak': 'Plus Faible' };
        targetBtn.className = "mb-4 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl border border-slate-600 transition-all text-sm shadow-md";
        targetBtn.innerHTML = `🎯 Cible: <span class="text-cyan-400">${tLabels[t.targetingPriority]}</span>`;
        targetBtn.onclick = () => {
            if (t.targetingPriority === 'first') t.targetingPriority = 'close';
            else if (t.targetingPriority === 'close') t.targetingPriority = 'strong';
            else if (t.targetingPriority === 'strong') t.targetingPriority = 'weak';
            else t.targetingPriority = 'first';
            targetBtn.innerHTML = `🎯 Cible: <span class="text-cyan-400">${tLabels[t.targetingPriority]}</span>`;
            t.target = null; // force retarget
        };
        upOpts.appendChild(targetBtn);
        
        if (!t.ultimate) {
            let nextLevel = t.level + 1;
            if (nextLevel < t.baseData.levels.length) {
                let nextData = t.baseData.levels[nextLevel];
                let canAfford = gameState.gold >= nextData.cost;
                let btn = document.createElement('button');
                btn.className = `flex justify-between items-center p-4 rounded-2xl border border-indigo-500/50 ${canAfford ? 'bg-gradient-to-r from-indigo-900/80 to-slate-800 hover:from-indigo-800 hover:to-slate-700 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-slate-800/50 opacity-50'} text-left active:scale-95 transition-all`;
                btn.innerHTML = `<div><div class="font-bold text-white text-lg">Niveau ${nextLevel + 1}</div><div class="text-xs text-indigo-200 mt-1">${nextData.desc}</div></div><div class="font-bold text-yellow-400 bg-black/30 px-3 py-1 rounded-full">💰 ${nextData.cost}</div>`;
                if (canAfford) btn.onclick = () => {
                    el.menuTower.classList.add('hidden');
                    callbacks.onPreviewAction({ type: 'upgrade', cost: nextData.cost, level: nextLevel, range: nextData.range });
                };
                upOpts.appendChild(btn);
            } else {
                let titleUlt = document.createElement('div');
                titleUlt.className = "text-center font-bold text-purple-400 mt-2 tracking-widest text-sm uppercase";
                titleUlt.innerText = "Spécialisation Ultime";
                upOpts.appendChild(titleUlt);
                t.baseData.ultimates.forEach(u => {
                    let canAfford = gameState.gold >= u.cost;
                    let btn = document.createElement('button');
                    btn.className = `flex justify-between items-center p-4 rounded-2xl border border-purple-500/50 ${canAfford ? 'bg-gradient-to-r from-purple-900/80 to-slate-800 hover:from-purple-800 hover:to-slate-700 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-slate-800/50 opacity-50'} text-left active:scale-95 transition-all`;
                    btn.innerHTML = `<div><div class="font-bold text-white text-lg">${u.icon} ${u.name}</div><div class="text-xs text-purple-200 mt-1 w-48">${u.desc}</div></div><div class="font-bold text-yellow-400 bg-black/30 px-3 py-1 rounded-full">💰 ${u.cost}</div>`;
                    if (canAfford) btn.onclick = () => {
                        el.menuTower.classList.add('hidden');
                        callbacks.onPreviewAction({ type: 'ultimate', cost: u.cost, ultimateId: u.id, range: u.range });
                    };
                    upOpts.appendChild(btn);
                });
            }
        } else if (t.stars < 5) {
            let starCost = 500 * (t.stars + 1) * (t.baseData.cost / 50);
            let titleStar = document.createElement('div');
            titleStar.className = "text-center font-bold text-yellow-400 mt-2 tracking-widest text-sm uppercase";
            titleStar.innerText = "Évolution Étoile " + (t.stars + 1);
            upOpts.appendChild(titleStar);

            let canAfford = gameState.gold >= starCost;
            let btn = document.createElement('button');
            let desc = t.stars === 4 ? "Débloque le mode SUPER !" : "+50% Dégâts, + Vitesse";
            btn.className = `flex justify-between items-center p-4 rounded-2xl border border-yellow-500/50 ${canAfford ? 'bg-gradient-to-r from-yellow-900/80 to-slate-800 hover:from-yellow-800 hover:to-slate-700 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-slate-800/50 opacity-50'} text-left active:scale-95 transition-all`;
            btn.innerHTML = `<div><div class="font-bold text-white text-lg">⭐ Ajouter une étoile</div><div class="text-xs text-yellow-200 mt-1 w-48">${desc}</div></div><div class="font-bold text-yellow-400 bg-black/30 px-3 py-1 rounded-full">💰 ${starCost}</div>`;
            if (canAfford) btn.onclick = () => {
                el.menuTower.classList.add('hidden');
                callbacks.onPreviewAction({ type: 'star', cost: starCost, range: t.range });
            };
            upOpts.appendChild(btn);
        } else {
            let maxTxt = document.createElement('div');
            maxTxt.className = "text-center font-bold text-emerald-400 py-4 bg-emerald-900/20 rounded-xl border border-emerald-500/30";
            maxTxt.innerText = "✨ Niveau MAX Atteint ✨";
            upOpts.appendChild(maxTxt);
        }

        let sellValue = Math.floor((t.baseData.cost + (t.level * 50)) * 0.5);
        let btnSell = document.createElement('button');
        btnSell.className = "mt-4 bg-rose-900/80 hover:bg-rose-800 text-white font-bold py-3 rounded-xl border border-rose-500/50 flex justify-between px-6 active:scale-95 transition-all shadow-[0_0_10px_rgba(225,29,72,0.3)]";
        btnSell.innerHTML = `<span>Vendre la tour</span> <span class="text-yellow-400">+💰${sellValue}</span>`;
        btnSell.onclick = () => {
            el.menuTower.classList.add('hidden');
            callbacks.onPreviewAction({ type: 'sell', cost: -sellValue, range: 0 });
        };
        upOpts.appendChild(btnSell);
    }
}

export function renderLab() {
    el.labStars.innerText = userData.stars + " ⭐";
    const list = el.labList;
    list.innerHTML = '';
    for (let [key, def] of Object.entries(LAB_UPGRADES)) {
        let isSkill = key.startsWith('skill');
        let currentLevel = isSkill ? (userData.skills[key.replace('skill', '').toLowerCase()] ? 1 : 0) : (userData.upgrades[key] || 0);
        let isMax = currentLevel >= def.maxLevel;
        let canAfford = userData.stars >= def.cost && !isMax;
        
        let btn = document.createElement('div');
        btn.className = "flex justify-between items-center p-3 rounded-xl bg-slate-700 border border-slate-600";
        
        let actionPart = '';
        if (isMax) {
            actionPart = `<span class="text-emerald-400 font-bold">MAX</span>`;
        } else {
            const buttonId = `buy-${key}`;
            actionPart = `<button id="${buttonId}" class="px-4 py-2 rounded font-bold shadow active:scale-95 transition-transform ${canAfford ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}">${def.cost} ⭐</button>`;
        }
        
        btn.innerHTML = `<div class="flex items-center gap-3"><div class="text-2xl">${def.icon}</div><div><div class="font-bold text-white text-sm sm:text-base">${def.name}</div><div class="text-xs text-cyan-300">Niveau: ${currentLevel} / ${def.maxLevel}</div></div></div><div>${actionPart}</div>`;
        list.appendChild(btn);
        
        if (!isMax) {
            const btnAction = document.getElementById(`buy-${key}`);
            if (canAfford) {
                btnAction.onclick = () => {
                    callbacks.onBuyUpgrade(key);
                    renderLab(); // Refresh
                };
            }
        }
    }
}

export function renderPremium() {
    el.premiumGems.innerText = userData.gems + " 💎";
    el.gemsDisplay.innerText = userData.gems;
    const list = el.premiumList;
    list.innerHTML = '';
    
    for (let [key, def] of Object.entries(PREMIUM_UPGRADES)) {
        let currentLevel = userData.premium[key] || 0;
        let isMax = currentLevel >= def.maxLevel;
        let cost = def.cost * (currentLevel + 1); // Cost increases per level
        let canAfford = userData.gems >= cost && !isMax;
        
        let btn = document.createElement('div');
        btn.className = "flex justify-between items-center p-3 rounded-xl bg-indigo-900/50 border border-fuchsia-600/50 shadow-md";
        
        let actionPart = '';
        if (isMax) {
            actionPart = `<span class="text-fuchsia-400 font-bold tracking-widest text-sm">MAX</span>`;
        } else {
            const buttonId = `buy-prem-${key}`;
            actionPart = `<button id="${buttonId}" class="px-4 py-2 rounded font-bold shadow active:scale-95 transition-transform ${canAfford ? 'bg-fuchsia-700 hover:bg-fuchsia-600 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}">${cost} 💎</button>`;
        }
        
        btn.innerHTML = `<div class="flex items-center gap-3"><div class="text-3xl">${def.icon}</div><div><div class="font-bold text-fuchsia-100">${def.name}</div><div class="text-xs text-indigo-300 w-48">${def.desc}</div><div class="text-xs text-fuchsia-300 mt-1">Rang: ${currentLevel} / ${def.maxLevel}</div></div></div><div>${actionPart}</div>`;
        list.appendChild(btn);
        
        if (!isMax && canAfford) {
            document.getElementById(`buy-prem-${key}`).onclick = () => {
                callbacks.onBuyPremium(key, cost);
                renderPremium();
            };
        }
    }
}

export function showRogueliteModal(choices, callback) {
    // Fermer tous les menus ouverts pour éviter les conflits de z-index
    document.querySelectorAll('[id^="menu"]').forEach(m => {
        if (m.id !== 'menuRoguelite') {
            m.classList.add('hidden');
            m.style.display = '';
        }
    });

    // Afficher le modal (utilise display:flex car il est en position:fixed hors de #ui)
    el.menuRoguelite.style.display = 'flex';
    el.rogueliteChoices.innerHTML = '';
    
    choices.forEach(c => {
        let card = document.createElement('button');
        card.style.cssText = 'display:flex; flex-direction:column; align-items:center; padding:1.5rem; background:#1e293b; border:2px solid rgba(234,179,8,0.5); border-radius:1rem; cursor:pointer; flex:1; min-width:220px; max-width:280px; transition:transform 0.15s, box-shadow 0.15s; pointer-events:auto;';
        card.innerHTML = `<div style="font-size:3rem; margin-bottom:1rem;">${c.icon}</div><div style="font-weight:700; color:white; font-size:1.2rem; margin-bottom:0.5rem;">${c.name}</div><div style="color:#94a3b8; text-align:center; font-size:0.9rem;">${c.desc}</div>`;
        card.onmouseover = () => { card.style.transform = 'scale(1.05)'; card.style.boxShadow = '0 0 30px rgba(234,179,8,0.5)'; };
        card.onmouseout = () => { card.style.transform = ''; card.style.boxShadow = ''; };
        card.onclick = () => {
            el.menuRoguelite.style.display = 'none';
            callback(c);
        };
        el.rogueliteChoices.appendChild(card);
    });
}

export function showGameOver(wave, stars) {
    el.hud.classList.add('hidden');
    el.skillsBar.classList.add('hidden');
    el.floatingUI.classList.add('hidden');
    el.menuTower.classList.add('hidden');
    el.menuGameOver.classList.remove('hidden');
    el.goWave.innerText = wave;
    el.goStars.innerText = stars;
}

export function showMenu(showResume) {
    // Cacher tous les écrans de jeu qui pourraient bloquer
    el.menuGameOver.classList.add('hidden');
    el.menuTower.classList.add('hidden');
    el.menuRoguelite.style.display = 'none';
    el.hud.classList.add('hidden');
    el.skillsBar.classList.add('hidden');
    el.floatingUI.classList.add('hidden');

    el.menuMain.classList.remove('hidden');
    if (showResume) el.btnResume.classList.remove('hidden');
    else el.btnResume.classList.add('hidden');
    
    el.gemsDisplay.innerText = userData.gems || 0;
    
    // Manage Prestige Button presence
    if (userData.maxWave > 10) {
        el.btnPrestige.classList.remove('opacity-50', 'cursor-not-allowed');
        el.btnPrestige.title = `Prestige possible: gagner ${Math.floor(userData.maxWave / 5)} gemmes.`;
    } else {
        el.btnPrestige.classList.add('opacity-50', 'cursor-not-allowed');
        el.btnPrestige.title = "Atteignez la vague 11 pour activer le prestige.";
    }
}

export function hideMenu() {
    el.menuMain.classList.add('hidden');
    el.menuGameOver.classList.add('hidden');
    el.hud.classList.remove('hidden');
    el.skillsBar.classList.remove('hidden');
}

export function setSpeedText(speed) {
    el.btnSpeed.innerText = `⏩ x${speed}`;
}

export function updateAuthStatus(text) {
    el.authStatus.innerText = text;
}

export function renderLeaderboard(players) {
    el.leaderboardList.innerHTML = '';
    if (players.length === 0) {
        el.leaderboardList.innerHTML = '<div class="text-center text-slate-400 py-10">Aucune donnée trouvée.</div>';
        return;
    }
    
    players.forEach((p, index) => {
        let rankColor = "text-slate-300";
        let rankIcon = `#${index + 1}`;
        if (index === 0) { rankColor = "text-yellow-400 font-extrabold text-xl"; rankIcon = "🥇"; }
        else if (index === 1) { rankColor = "text-slate-300 font-bold text-lg"; rankIcon = "🥈"; }
        else if (index === 2) { rankColor = "text-amber-600 font-bold text-lg"; rankIcon = "🥉"; }

        let row = document.createElement('div');
        row.className = "flex justify-between items-center p-3 rounded-lg bg-indigo-900/40 border border-indigo-500/30";
        row.innerHTML = `<div class="flex items-center gap-3"><div class="w-8 text-center ${rankColor}">${rankIcon}</div><div class="font-bold text-indigo-100">${p.name || "Anonyme"}</div></div><div class="font-bold text-cyan-400">Vague ${p.maxWave}</div>`;
        el.leaderboardList.appendChild(row);
    });
}

export function renderBestiary() {
    el.bestiaryList.innerHTML = '';
    ENEMY_BESTIARY.forEach(e => {
        let card = document.createElement('div');
        card.className = "bestiary-card";
        card.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center; padding:0.75rem; background:rgba(0,0,0,0.3); min-width:80px; border-radius:1rem;">
                <canvas class="enemy-mini-canvas" data-name="${e.name}" width="60" height="60"></canvas>
            </div>
            <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <div style="font-weight:700; font-size:1.2rem; color:${e.color};">${e.name}</div>
                    <div style="display:flex; gap:0.5rem;">
                        ${e.tags.map(t => `<div class="stat-chip" style="border-color:#475569;">${t}</div>`).join('')}
                    </div>
                </div>
                <div style="font-size:0.85rem; color:#cbd5e1; margin-bottom:0.75rem; line-height:1.4;">${e.desc}</div>
                <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                    <div class="stat-chip" style="border-color:#22c55e;">❤️ ${e.hp} PV</div>
                    <div class="stat-chip" style="border-color:#60a5fa;">🏃 ${e.speed.toFixed(1)} vit</div>
                    ${e.armor > 0 ? `<div class="stat-chip" style="border-color:#94a3b8;">🛡️ ${e.armor} arm.</div>` : ''}
                    ${e.magicResist > 0 ? `<div class="stat-chip" style="border-color:#c084fc;">✨ ${e.magicResist} rés.</div>` : ''}
                    ${e.shield ? `<div class="stat-chip" style="border-color:#38bdf8;">🔵 ${e.shield} boucl.</div>` : ''}
                    <div class="stat-chip" style="border-color:#facc15;">💰 ${e.gold} or</div>
                </div>
            </div>
        `;
        el.bestiaryList.appendChild(card);
        
        requestAnimationFrame(() => {
            let c = card.querySelector('.enemy-mini-canvas');
            if (c) drawMiniEnemy(c, e);
        });
    });
}

function drawMiniTower(canvas, typeId, data) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    ctx.save();
    ctx.translate(cx, cy);
    
    // Base
    ctx.fillStyle = "#1e293b"; ctx.strokeStyle = "#334155"; ctx.lineWidth = 2;
    drawPolygon(ctx, 0, 0, 18, 6, Math.PI / 2); ctx.fill(); ctx.stroke();
    
    // Head/Weapon
    ctx.rotate(-Math.PI / 4);
    if (typeId === 'archer') {
        ctx.fillStyle = data.color; ctx.fillRect(-6, -4, 18, 8);
        ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(8, -12); ctx.quadraticCurveTo(0, 0, 8, 12); ctx.stroke();
    } else if (typeId === 'mage') {
        ctx.shadowBlur = 10; ctx.shadowColor = data.color; ctx.fillStyle = data.color;
        drawPolygon(ctx, 0, 0, 12, 3); ctx.fill();
    } else if (typeId === 'cannon') {
        ctx.fillStyle = data.colorDark; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = data.color; ctx.fillRect(0, -6, 14, 12);
    }
    ctx.restore();
}

function drawMiniEnemy(canvas, data) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    ctx.save();
    ctx.translate(cx, cy);
    
    ctx.fillStyle = data.color;
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    
    if (data.shape === 'flying') {
        ctx.beginPath(); ctx.moveTo(data.radius, 0); ctx.lineTo(-data.radius, -data.radius); ctx.lineTo(-data.radius * 0.5, 0); ctx.lineTo(-data.radius, data.radius); ctx.closePath();
    } else if (data.shape === 'square') { 
        drawPolygon(ctx, 0, 0, data.radius, 4, Math.PI / 4);
    } else if (data.shape === 'hex') {
        drawPolygon(ctx, 0, 0, data.radius, 6);
    } else {
        ctx.beginPath(); ctx.arc(0, 0, data.radius, 0, Math.PI * 2);
    }
    ctx.fill(); ctx.stroke();
    
    // Eyes
    ctx.fillStyle = data.name === "Boss" ? "#ef4444" : "#fbbf24";
    if (data.shape !== 'flying') {
        ctx.beginPath(); ctx.arc(data.radius * 0.3, -2, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(data.radius * 0.3, 2, 2, 0, Math.PI * 2); ctx.fill();
    }
    
    if (data.shield) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.8)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, data.radius + 3, 0, Math.PI * 2); ctx.stroke();
    }
    
    ctx.restore();
}

export { openTowerMenuFromSpot };
