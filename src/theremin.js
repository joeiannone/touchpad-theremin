/*
 * Filename: theremin.js
 * Created Date: Saturday, May 10th 2025, 12:42:21 pm
 * Author: Joseph Iannone
 * 
 * Copyright (c) 2025 iannonejoseph
 */

const MIN_FREQ = 100;
const MAX_FREQ = 2000;

const pad = document.getElementById('pad');
const info = document.getElementById('info');

let audioCtx;
let oscillator;
let gainNode;
let isPlaying = false;


/**
 * 
 * @param {*} x 
 * @param {*} width 
 * @returns 
 */
function getFrequencyFromX(x, width) {
    const percent = x / width;
    return MIN_FREQ + percent * (MAX_FREQ - MIN_FREQ);
}

/**
 * 
 * @param {*} y 
 * @param {*} height 
 * @returns 
 */
function getVolumeFromY(y, height) {
    const percent = 1 - y / height;
    return Math.max(0, Math.min(1, percent));
}


/**
 * 
 * @param {*} freq 
 * @param {*} volume 
 */
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

/**
 * 
 */
function stopOscillator() {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        gainNode.disconnect();
        oscillator = null;
        gainNode = null;
        isPlaying = false;
        hideCrosshairs();
    }
}

/**
 * 
 * @param {*} x 
 * @param {*} y 
 * @param {*} width 
 * @param {*} height 
 */
function handleStart(x, y, width, height) {
    const freq = getFrequencyFromX(x, width);
    const vol = getVolumeFromY(y, height);
    startOscillator(freq, vol);
    info.textContent = `Freq: ${freq.toFixed(1)} Hz | Volume: ${vol.toFixed(2)}`;
    updateCrosshairs(x, y);
}

/**
 * 
 * @param {*} x 
 * @param {*} y 
 * @param {*} width 
 * @param {*} height 
 */
function handleMove(x, y, width, height) {
    if (isPlaying && oscillator && gainNode) {
        const freq = getFrequencyFromX(x, width);
        const vol = getVolumeFromY(y, height);
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
        info.textContent = `Freq: ${freq.toFixed(1)} Hz | Volume: ${vol.toFixed(2)}`;
        updateCrosshairs(x, y);
    }
}

// Mouse events

/**
 * 
 */
pad.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Only left click
    const rect = pad.getBoundingClientRect();
    handleStart(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
});

/**
 * 
 */
pad.addEventListener('mousemove', (e) => {
    if (!(e.buttons & 1)) return; // Only if left button is pressed
    const rect = pad.getBoundingClientRect();
    handleMove(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
});

/**
 * 
 */
document.addEventListener('mouseup', (e) => {
    if (isPlaying) {
        stopOscillator();
        info.textContent = 'Touch or click and drag';
    }
});



// Touch events

/**
 * Prevent context menu when click inside touch pad
 */
pad.addEventListener('contextmenu', (e) => e.preventDefault());

/**
 * 
 */
pad.addEventListener('touchstart', (e) => {
    const rect = pad.getBoundingClientRect();
    const touch = e.touches[0];
    handleStart(touch.clientX - rect.left, touch.clientY - rect.top, rect.width, rect.height);
    e.preventDefault();
});

/**
 * 
 */
pad.addEventListener('touchmove', (e) => {
    const rect = pad.getBoundingClientRect();
    const touch = e.touches[0];
    handleMove(touch.clientX - rect.left, touch.clientY - rect.top, rect.width, rect.height);
    e.preventDefault();
});

/**
 * 
 */
pad.addEventListener('touchend', () => {
    stopOscillator();
    info.textContent = 'Touch or click and drag';
});

/**
 * 
 */
pad.addEventListener('touchcancel', () => {
    stopOscillator();
    info.textContent = 'Touch or click and drag';
});





const crosshairX = document.getElementById('crosshair-x');
const crosshairY = document.getElementById('crosshair-y');

/**
 * 
 * @param {*} x 
 * @param {*} y 
 */
function updateCrosshairs(x, y) {
  crosshairX.style.top = `${y}px`;
  crosshairY.style.left = `${x}px`;
  crosshairX.style.display = 'block';
  crosshairY.style.display = 'block';
}

/**
 * 
 */
function hideCrosshairs() {
  crosshairX.style.display = 'none';
  crosshairY.style.display = 'none';
}
