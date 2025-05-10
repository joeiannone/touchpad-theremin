const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'renderer.js'),
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Send app version to renderer when the window is ready
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('app-version', app.getVersion());
  });

  // Create the application menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'About',
      submenu: [
        {
          label: 'Developer',
          click: () => showAboutDialog()
        },
        {
          label: 'Software License',
          click: () => showLicense()
        },
        {
          label: 'Version: ' + app.getVersion(),
          enabled: false,
        }
      ],
    },
  ]);

  // Set the app menu
  Menu.setApplicationMenu(menu);
}


function showLicense() {
  const licensePath = path.join(__dirname, 'LICENSE');
  fs.readFile(licensePath, 'utf8', (err, data) => {
    if (err) {
      dialog.showErrorBox('Error', 'Failed to load LICENSE file');
      return;
    }
    dialog.showMessageBox({
      type: 'none',
      title: 'License Information',
      message: data,
      buttons: ['Close']
    });
  });
}

function showAboutDialog() {
  // Information to be displayed in the About dialog
  const aboutText = `
    Developer: Joseph Iannone
    Email: josiannone@outlook.com
    Website: https://github.com/joeiannone
  `;

  // Show a dialog with the about information
  dialog.showMessageBox(win, {
    type: 'info',
    title: 'Developer Information',
    message: aboutText,
    buttons: ['OK'],
  });
}

app.whenReady().then(() => {
  createWindow();

  // For macOS, it's common to add a default application menu with app name
  if (process.platform === 'darwin') {
    const appMenu = Menu.buildFromTemplate([
      {
        label: app.name,
        submenu: [
          {
            label: 'About',
            click: showAboutDialog,
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
              app.quit();
            },
          },
        ],
      },
    ]);
    Menu.setApplicationMenu(appMenu);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
