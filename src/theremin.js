let audioCtx;
let oscillator;
let gainNode;
let isPlaying = false;

const MIN_FREQ = 100;
const MAX_FREQ = 2000;

const pad = document.getElementById('pad');
const info = document.getElementById('info');

function getFrequencyFromX(x, width) {
    const percent = x / width;
    return MIN_FREQ + percent * (MAX_FREQ - MIN_FREQ);
}

function getVolumeFromY(y, height) {
    const percent = 1 - y / height;
    return Math.max(0, Math.min(1, percent));
}

function startOscillator(freq, volume) {
    if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);

    oscillator.connect(gainNode).connect(audioCtx.destination);
    oscillator.start();
    isPlaying = true;
}

function stopOscillator() {
    if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    gainNode.disconnect();
    oscillator = null;
    gainNode = null;
    isPlaying = false;
    }
}

function handleStart(x, y, width, height) {
    const freq = getFrequencyFromX(x, width);
    const vol = getVolumeFromY(y, height);
    startOscillator(freq, vol);
    info.textContent = `Freq: ${freq.toFixed(1)} Hz | Volume: ${vol.toFixed(2)}`;
}

function handleMove(x, y, width, height) {
    if (isPlaying && oscillator && gainNode) {
    const freq = getFrequencyFromX(x, width);
    const vol = getVolumeFromY(y, height);
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    info.textContent = `Freq: ${freq.toFixed(1)} Hz | Volume: ${vol.toFixed(2)}`;
    }
}

// Mouse events
pad.addEventListener('mousedown', (e) => {
    const rect = pad.getBoundingClientRect();
    handleStart(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
});

pad.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) {
    const rect = pad.getBoundingClientRect();
    handleMove(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
    }
});

document.addEventListener('mouseup', () => {
    stopOscillator();
    info.textContent = 'Touch or click and drag';
});

// Touch events
pad.addEventListener('touchstart', (e) => {
    const rect = pad.getBoundingClientRect();
    const touch = e.touches[0];
    handleStart(touch.clientX - rect.left, touch.clientY - rect.top, rect.width, rect.height);
    e.preventDefault();
});

pad.addEventListener('touchmove', (e) => {
    const rect = pad.getBoundingClientRect();
    const touch = e.touches[0];
    handleMove(touch.clientX - rect.left, touch.clientY - rect.top, rect.width, rect.height);
    e.preventDefault();
});

pad.addEventListener('touchend', () => {
    stopOscillator();
    info.textContent = 'Touch or click and drag';
});

pad.addEventListener('touchcancel', () => {
    stopOscillator();
    info.textContent = 'Touch or click and drag';
});