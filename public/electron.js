const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');


// Use app.isPackaged instead of electron-is-dev
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1100, // Slightly wider for better preview
    height: 900,
    icon: path.join(__dirname, 'favicon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false, // Helps with print preview issues
      preload: path.join(__dirname, 'preload.js')
    },
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});