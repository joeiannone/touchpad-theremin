/*
 * Filename: renderer.js
 * Created Date: Saturday, May 10th 2025, 11:09:26 am
 * Author: Joseph Iannone
 * 
 * Copyright (c) 2025 iannonejoseph
 */

const { ipcRenderer } = require('electron');

// Listen for the app version sent from the main process
ipcRenderer.on('app-version', (event, version) => {
  // Display the app version in the bottom-right corner of the window
  const versionElement = document.getElementById('app-version');
  versionElement.textContent = `Version: ${version}`;
});

