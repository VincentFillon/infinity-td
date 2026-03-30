export const VIRTUAL_WIDTH = 1000;
export const VIRTUAL_HEIGHT = 1600;
export const MAP_PADDING = 300;

export const fullPath = [
    { x: 200, y: -50 }, { x: 200, y: 250 }, { x: 800, y: 250 },
    { x: 800, y: 600 }, { x: 500, y: 600 }, { x: 500, y: 450 },
    { x: 350, y: 450 }, { x: 350, y: 850 }, { x: 800, y: 850 },
    { x: 800, y: 1150 }, { x: 200, y: 1150 }, { x: 200, y: 1450 },
    { x: 500, y: 1450 }, { x: 500, y: 1550 }
];

export const buildSpots = [
    { x: 100, y: 100, tower: null }, { x: 350, y: 150, tower: null },
    { x: 650, y: 150, tower: null }, { x: 900, y: 400, tower: null },
    { x: 650, y: 400, tower: null }, { x: 425, y: 525, tower: null }, // Au centre parfait de la boucle
    { x: 220, y: 600, tower: null }, { x: 550, y: 730, tower: null },
    { x: 900, y: 950, tower: null }, { x: 550, y: 1000, tower: null },
    { x: 350, y: 1000, tower: null }, { x: 220, y: 1000, tower: null },
    { x: 100, y: 1300, tower: null }, { x: 350, y: 1300, tower: null },
    { x: 650, y: 1300, tower: null }, { x: 500, y: 1330, tower: null },
    { x: 600, y: 1450, tower: null }, { x: 250, y: 400, tower: null }
];

export const TOWER_TYPES = {
    archer: {
        name: "Baliste", icon: "🏹", color: "#fbbf24", colorDark: "#b45309", cost: 50, dmgType: "phys",
        desc: "Arbalète montée sur pivot. Tire rapidement des carréaux précis. Idéale contre les unités rapides et légères. Peut perçer plusieurs ennemis (bonus Roguelite).",
        levels: [{ dmg: 10, range: 180, cd: 0.8, cost: 0, desc: "Tire rapidement." }, { dmg: 18, range: 200, cd: 0.7, cost: 40, desc: "+Dégâts, +Portée, +Vitesse" }, { dmg: 30, range: 220, cd: 0.6, cost: 80, desc: "+Dégâts, +Portée, +Vitesse" }],
        ultimates: [{ id: "sniper", name: "Canon Lourd", icon: "🎯", dmg: 120, range: 400, cd: 2.5, cost: 150, desc: "Portée immense." }, { id: "ranger", name: "Gatling", icon: "🔫", dmg: 20, range: 200, cd: 0.25, cost: 150, desc: "Tir ultra rapide." }]
    },
    mage: {
        name: "Cristal Magique", icon: "🔮", color: "#c084fc", colorDark: "#7e22ce", cost: 75, dmgType: "magic",
        desc: "Cristal focus amplifié. Les dégâts magiques ignorent l'armure physique. Revèle les Ninjas furtifs dans sa zone de portée. Peut électrifier ou ralentir (Ultimates).",
        levels: [{ dmg: 25, range: 200, cd: 1.5, cost: 0, desc: "Ignore l'armure." }, { dmg: 45, range: 220, cd: 1.4, cost: 60, desc: "+Dégâts" }, { dmg: 80, range: 240, cd: 1.3, cost: 120, desc: "+Dégâts massifs" }],
        ultimates: [{ id: "archmage", name: "Tour Tesla", icon: "⚡", dmg: 100, range: 250, cd: 1.2, cost: 200, desc: "Foudre en chaîne.", special: "chain" }, { id: "frost", name: "Oeil de Givre", icon: "❄️", dmg: 50, range: 220, cd: 1.0, cost: 200, desc: "Ralentit fortement.", special: "slow" }]
    },
    cannon: {
        name: "Canon", icon: "💣", color: "#f87171", colorDark: "#991b1b", cost: 100, dmgType: "phys",
        desc: "Canon à poudre noire. Inflige des dégâts massifs de zone. Ne peut pas cibler les unités volantes (Harpies). Idéal contre les groupes denses.",
        levels: [{ dmg: 40, range: 160, cd: 2.0, aoe: 50, cost: 0, desc: "Dégâts de zone." }, { dmg: 70, range: 170, cd: 1.8, aoe: 60, cost: 70, desc: "+Dégâts, +Zone" }, { dmg: 120, range: 180, cd: 1.6, aoe: 75, cost: 140, desc: "+Dégâts, +Zone" }],
        ultimates: [{ id: "mortar", name: "Mortier", icon: "🌋", dmg: 250, range: 350, cd: 3.5, aoe: 120, cost: 250, desc: "Portée et zone immenses." }, { id: "vulcan", name: "Obusier", icon: "💥", dmg: 80, range: 160, cd: 0.9, aoe: 45, cost: 200, desc: "Tirs explosifs rapides." }]
    }
};

export const LAB_UPGRADES = {
    archerDmg: { name: "Dégâts Balistes +10%", cost: 5, maxLevel: 10, icon: "🏹" },
    mageDmg: { name: "Dégâts Cristaux +10%", cost: 5, maxLevel: 10, icon: "🔮" },
    cannonDmg: { name: "Dégâts Canons +10%", cost: 5, maxLevel: 10, icon: "💣" },
    baseHp: { name: "Points de Vie Base +5", cost: 10, maxLevel: 5, icon: "❤️" },
    goldStart: { name: "Or de départ +25", cost: 15, maxLevel: 4, icon: "💰" },
    skillMeteor: { name: "Pluie de Météores", cost: 50, maxLevel: 1, icon: "☄️" },
    skillHeal: { name: "Soin de Base", cost: 50, maxLevel: 1, icon: "💖" }
};

export const ENEMY_BESTIARY = [
    {
        name: "Gobelin", color: "#84cc16", radius: 10, shape: "circle",
        desc: "La chair à canon classique. Rapide et fragile, il n'a aucune résistance. Sa vitesse le rend dangereux lorsqu'il est nombreux.",
        hp: 15, speed: 1.5, armor: 0, magicResist: 0, gold: 5,
        tags: []
    },
    {
        name: "Orc", color: "#d97706", radius: 15, shape: "square",
        desc: "Guerrier blindé. Son armure lourde réduit fortement les dégâts physiques. Privilégiez les Cristaux Magiques pour l'éliminer efficacement.",
        hp: 35, speed: 1.0, armor: 50, magicResist: 0, gold: 8,
        tags: ["🛡️ Armure"]
    },
    {
        name: "Golem", color: "#cbd5e1", radius: 18, shape: "hex",
        desc: "Colosse de pierre. Sa résistance magique le rend difficile à toucher avec des sorts. Lent mais très résistant. Aucune immunité physique.",
        hp: 60, speed: 0.7, armor: 0, magicResist: 50, gold: 12,
        tags: ["✨ Résist. Magique"]
    },
    {
        name: "Chevalier", color: "#fcd34d", radius: 15, shape: "square",
        desc: "Paladin en armure lourde. Son bouclier absorbe les premiers dégâts reçus. Le bouclier se régènère à 20%/s après 3 secondes sans être touché.",
        hp: 40, speed: 0.8, armor: 0, magicResist: 0, shield: 30, gold: 15,
        tags: ["🔵 Bouclier"]
    },
    {
        name: "Chaman", color: "#2dd4bf", radius: 12, shape: "circle",
        desc: "Soigneur de troupe. Toutes les 2 secondes, il regénère 10% des PV max des alliés dans un rayon de 150. Éliminez-le en priorité absolue !",
        hp: 25, speed: 1.2, armor: 0, magicResist: 0, gold: 15,
        tags: ["💚 Soigneur"]
    },
    {
        name: "Harpie", color: "#c084fc", radius: 12, shape: "flying",
        desc: "Créature ailée. Elle suit le chemin à 1.4x la vitesse normale. Immunisée aux Canons. Seules les Balistes et les Cristaux peuvent l'attaquer.",
        hp: 20, speed: 1.4, armor: 0, magicResist: 0, gold: 10,
        tags: ["🦅 Volant", "💣 Immunisée aux Canons"]
    },
    {
        name: "Ninja", color: "#334155", radius: 10, shape: "circle",
        desc: "Assassin furtif. Semi-invisible pour la plupart des tours. Révélé par les Cristaux Magiques à portée, ou lorsqu'il a parcouru plus de la moitié du chemin.",
        hp: 25, speed: 1.6, armor: 0, magicResist: 0, gold: 12,
        tags: ["👁️ Furtif", "🔮 Révélé par Cristaux"]
    },
    {
        name: "Boss", color: "#ef4444", radius: 18, shape: "square",
        desc: "Ennemi élite. Apparaît toutes les 5 vagues. Beaucoup plus résistant et inflige 5× plus de dégâts à la base lorsqu'il l'atteint.",
        hp: 200, speed: 0.8, armor: 30, magicResist: 30, gold: 50,
        tags: ["💀 Boss", "⚠️ ×5 dégâts à la base"]
    }
];

export const PREMIUM_UPGRADES = {
    startingLevel: { name: "Niveau de départ des tours", cost: 50, maxLevel: 2, icon: "⬆️", desc: "Les nouvelles tours commencent avec un niveau supplémentaire (+1 par rang)." },
    globalCrit: { name: "Chance de Critique Globale", cost: 30, maxLevel: 5, icon: "🎯", desc: "+5% de chance de critique sur toutes les tours par rang." },
    globalIncome: { name: "Bonus de rendement", cost: 40, maxLevel: 5, icon: "🤑", desc: "L'or reçu lors de l'élimination des ennemis augmente de 10% par rang." }
};