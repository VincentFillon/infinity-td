import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import { gameState, userData, currentUser, setCurrentUser } from './state.js';
import { buildSpots } from './config.js';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'infinity-td';
const isFirebaseEnabled = !!firebaseConfig.apiKey;

let auth, db;

if (isFirebaseEnabled) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    onAuthStateChanged(auth, user => { 
        setCurrentUser(user); 
        if (user) { 
            document.getElementById('authStatus').innerText = "Connecté."; 
            loadProgress(); 
        } 
    });
}

export async function initAuth() {
    if (!isFirebaseEnabled) {
        document.getElementById('authStatus').innerText = "Mode local (sans Firebase).";
        setCurrentUser({ uid: 'local-user' });
        loadProgress();
        return;
    }
    try { 
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); 
        else await signInAnonymously(auth); 
    }
    catch (e) { document.getElementById('authStatus').innerText = "Erreur locale."; }
}

export async function loadProgress() {
    if (!currentUser) return;
    
    if (!isFirebaseEnabled) {
        const savedData = localStorage.getItem(`${appId}-save-data`);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                applyLoadedData(data);
            } catch (e) { console.error("Error loading local data", e); }
        }
        return;
    }

    try {
        const docSnap = await getDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'saveData', 'progress'));
        if (docSnap.exists()) {
            applyLoadedData(docSnap.data());
        }
    } catch (e) { }
}

function applyLoadedData(data) {
    userData.stars = data.stars || 0; 
    userData.maxWave = data.maxWave || 0;
    userData.gems = data.gems || 0;
    if (data.upgrades) Object.assign(userData.upgrades, data.upgrades);
    if (data.skills) Object.assign(userData.skills, data.skills);
    if (data.premium) Object.assign(userData.premium, data.premium);
    if (data.currentRun) {
        userData.currentRun = data.currentRun;
        document.getElementById('btnResume').classList.remove('hidden');
    }
}

export async function saveProgress() { 
    if (!currentUser) return; 
    
    if (!isFirebaseEnabled) {
        localStorage.setItem(`${appId}-save-data`, JSON.stringify(userData));
        return;
    }

    try { 
        await setDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'saveData', 'progress'), userData); 
        await setDoc(doc(db, 'infinity_leaderboard', currentUser.uid), { name: currentUser.uid.substring(0, 8), maxWave: userData.maxWave });
    } 
    catch (e) { } 
}

export async function getTopPlayers() {
    if (!isFirebaseEnabled) {
        return [
            { name: "LocalBot_A", maxWave: 42 },
            { name: "LocalBot_B", maxWave: 35 },
            { name: "You (Local)", maxWave: userData.maxWave }
        ].sort((a,b) => b.maxWave - a.maxWave);
    }
    
    try {
        const q = query(collection(db, 'infinity_leaderboard'), orderBy('maxWave', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);
        let players = [];
        querySnapshot.forEach((doc) => {
            players.push(doc.data());
        });
        return players;
    } catch(e) {
        return [];
    }
}

export function saveCurrentRun() {
    userData.currentRun = {
        wave: gameState.wave, gold: gameState.gold, hp: gameState.hp,
        towers: buildSpots.map((s, i) => s.tower ? { index: i, typeId: s.tower.typeId, level: s.tower.level, ultimate: s.tower.ultimate, stars: s.tower.stars } : null).filter(t => t)
    };
    saveProgress();
    document.getElementById('btnResume').classList.remove('hidden');
}