/*
 * Filename: web-polyfill.js
 * Created Date: Tuesday, May 13th 2025, 10:48:26 am
 * Author: Joseph Iannone
 * 
 * Copyright (c) 2025 iannonejoseph
 */

if (typeof window.electron === 'undefined') {
  window.electron = {
    requestMidiAccess: async () => {
      if (!navigator.requestMIDIAccess) {
        return { error: 'Web MIDI API is not supported in this browser' };
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
  };
}


if (!window.appAPI) {
  window.appAPI = {
    onVersion: (callback) => {
      callback(typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0 (web fallback)');
    }
  };
}
