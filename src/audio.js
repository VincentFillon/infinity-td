const AudioContext = window.AudioContext || window.webkitAudioContext;
export let audioCtx;

export let audioSettings = {
    musicMuted: false,
    sfxMuted: false,
    masterVolume: 0.5
};

export function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
}

export function setConfig(sfx, music) {
    audioSettings.sfxMuted = !sfx;
    audioSettings.musicMuted = !music;
}

// Ensure context is running (fixes autoplay policy)
export function resumeAudio() {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(freq, type, duration, vol = 1, slideFreq = null) {
    if (!audioCtx || audioSettings.sfxMuted) return;
    
    let osc = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();
    
    osc.type = type; // 'square', 'sine', 'sawtooth', 'triangle'
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    let now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(freq, now);
    if (slideFreq) {
        osc.frequency.exponentialRampToValueAtTime(slideFreq, now + duration);
    }
    
    gainNode.gain.setValueAtTime(vol * audioSettings.masterVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
}

function playNoise(duration, vol = 1) {
    if (!audioCtx || audioSettings.sfxMuted) return;
    
    let bufferSize = audioCtx.sampleRate * duration;
    let buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    let data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    let noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    let filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    
    let gainNode = audioCtx.createGain();
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    let now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(vol * audioSettings.masterVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    noise.start(now);
}

export function playShoot(type) {
    if (type === 'archer') {
        playTone(600, 'triangle', 0.1, 0.3, 800);
    } else if (type === 'mage') {
        playTone(400, 'sine', 0.2, 0.3, 600);
    } else if (type === 'cannon') {
        playNoise(0.2, 0.5);
    }
}

export function playHit() {
    playNoise(0.05, 0.2);
}

export function playCritHit() {
    playTone(800, 'square', 0.1, 0.4, 400);
    playNoise(0.1, 0.4);
}

export function playExplosion() {
    playNoise(0.4, 0.8);
    playTone(100, 'sawtooth', 0.4, 0.6, 20); // Boom sub-bass
}

export function playError() {
    playTone(150, 'sawtooth', 0.15, 0.5, 100);
}

export function playClick() {
    playTone(800, 'sine', 0.05, 0.2);
}
