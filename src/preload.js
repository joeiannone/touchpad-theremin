/*
 * Filename: preload.js
 * Created Date: Monday, May 12th 2025, 10:10:23 am
 * Author: Joseph Iannone
 * 
 * Copyright (c) 2025 iannonejoseph
 */


const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  requestMidiAccess: async () => {
    if (!navigator.requestMIDIAccess) {
      return { error: 'Web MIDI API is not supported in this environment' };
    }

    try {
      const midiAccess = await navigator.requestMIDIAccess();
      const inputs = Array.from(midiAccess.inputs.values());
      return inputs.map((input) => ({
        id: input.id,
        name: input.name,
        state: input.state
      }));
    } catch (err) {
      return { error: err.message || 'Unknown error accessing MIDI' };
    }
  },
  listenToMidiInputs: async (onMessage) => {
    const midiAccess = await navigator.requestMIDIAccess();
    for (const input of midiAccess.inputs.values()) {
      input.onmidimessage = (msg) => {
        onMessage({
          data: Array.from(msg.data),
          timestamp: msg.timeStamp,
          device: input.name,
        });
      };
    }
  }
});


// Exposing app version to renderer
contextBridge.exposeInMainWorld('appAPI', {
  onVersion: (callback) => ipcRenderer.on('app-version', (_event, version) => {
    callback(version);
  })
});

