/*
 * Filename: renderer.js
 * Created Date: Saturday, May 10th 2025, 11:09:26 am
 * Author: Joseph Iannone
 * 
 * Copyright (c) 2025 iannonejoseph
 */
const MIN_FREQ = 100;
const MAX_FREQ = 2000;
const ERROR_COLOR_HEX = "#e57373";
const SUCCESS_COLOR_HEX = "#81c784";

const pad = document.getElementById('pad');
const info = document.getElementById('info');

const crosshairX = document.getElementById('crosshair-x');
const crosshairY = document.getElementById('crosshair-y');
const midiDeviceMessage = document.getElementById('midi-device-info');
const midiInstructions = document.getElementById('midi-instructions');

let audioCtx;
let oscillator;
let gainNode;
let isPlaying = false;

let frequency = 0;
let volume = 0;

document.addEventListener('DOMContentLoaded', () => {

  reset();

  window.appAPI.onVersion((version) => {
    const versionElement = document.getElementById('app-version');
    versionElement.textContent = `Version: ${version}`;
  });


  window.electron.requestMidiAccess().then((midiData) => {
    if (midiData.error) {
      console.error('MIDI Error:', midiData.error);
      midiDeviceMessage.textContent = $`MIDI Device Error: ${midiData.error}`;
      midiDeviceMessage.style.color = ERROR_COLOR_HEX;
      stopOscillator();
    } else {
      console.log('MIDI Devices:', midiData);
      // midiData.forEach((input) => {
      // });
      if (midiData.length) {
        midiInstructions.style.display = "block";
        console.log(`MIDI Input: ${midiData[0].name} (${midiData[0].state})`);
        midiDeviceMessage.innerHTML = `<strong>${midiData[0].state}</strong>: ${midiData[0].id}=${midiData[0].name}`
        midiDeviceMessage.style.color = SUCCESS_COLOR_HEX;
        handleMIDIStart(0, 0);
      }
    }
  }).catch((error) => {
    console.error('Failed to get MIDI access:', error);
    midiDeviceMessage.textContent = $`MIDI Device Error: ${error}`;
    midiDeviceMessage.style.color = ERROR_COLOR_HEX;
    stopOscillator();
  });


  window.electron.listenToMidiInputs((msg) => {
    // console.log('MIDI Message Received:', msg);
    const [status, data1, data2] = msg.data;

    // console.log('Status Byte:', status);
    // console.log('Data Byte 1:', data1);
    // console.log('Data Byte 2:', data2);

    // // Example: use note number (data1) or velocity (data2)
    // if ((status & 0xf0) === 0x90 && data2 > 0) {
    //   console.log('Note ON:', data1, 'Velocity:', data2);
    // } else if ((status & 0xf0) === 0x80 || ((status & 0xf0) === 0x90 && data2 === 0)) {
    //   console.log('Note OFF:', data1);
    // }


    if (status === 176) {

      if (data1 === 1) {
        frequency = mapRange(data2, 0, 127, 100, 2000);
      }
        
      else if (data1 === 2) {
        volume = mapRange(data2, 0, 127, 0, 1);
      }
        

      if (oscillator)
        handleMIDIMove(frequency, volume);
      else
        handleMIDIStart(frequency, volume);
    }
  });




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


});


/**
 * 
 */
function reset() {
  frequency = 1050;
  volume = .2;
}


/**
 * 
 * @param {*} value 
 * @param {*} inMin 
 * @param {*} inMax 
 * @param {*} outMin 
 * @param {*} outMax 
 * @returns 
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * 
 * @param {*} freq 
 * @param {*} width 
 * @returns 
 */
function getXFromFrequency(freq, width) {
  const percent = (freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ);
  return percent * width;
}

/**
 * 
 * @param {*} volume 
 * @param {*} height 
 * @returns 
 */
function getYFromVolume(volume, height) {
  const percent = 1 - volume;
  return percent * height;
}


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
    if (!oscillator) {
      startOscillator(freq, vol);
    }
    
    info.textContent = `Freq: ${freq.toFixed(1)} Hz | Volume: ${vol.toFixed(2)}`;
    updateCrosshairs(x, y);
}


/**
 * 
 * @param {*} freq 
 * @param {*} vol 
 */
function handleMIDIStart(freq, vol) {
  startOscillator(freq, vol);
  info.textContent = `Freq: ${freq.toFixed(1)} Hz | Volume: ${vol.toFixed(2)}`;
  updateCrosshairs(getXFromFrequency(freq, pad.clientWidth), getYFromVolume(vol, pad.clientHeight));
}


/**
 * 
 * @param {*} freq 
 * @param {*} vol 
 */
function handleMIDIMove(freq, vol) {
  if (isPlaying && oscillator && gainNode) {
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    info.textContent = `Freq: ${freq.toFixed(1)} Hz | Volume: ${vol.toFixed(2)}`;
    updateCrosshairs(getXFromFrequency(freq, pad.clientWidth), getYFromVolume(vol, pad.clientHeight));
  }
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

