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
      nodeIntegration: false,
      contextIsolation: true,
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

// ipcMain.on('open-print-preview', (event, id) => {
//   let printWindow = new BrowserWindow({
//     show: false, // Keep it hidden or show: true if you want a custom preview
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false
//     }
//   });

//   // Load the URL for the affidavit (adjust the path to your routing)
//   const url = isDev 
//     ? `http://localhost:3000/print/preview/${id}` 
//     : `file://${path.join(__dirname, '../build/index.html')}#/print/preview/${id}`;

//   printWindow.loadURL(url);

//   printWindow.webContents.on('did-finish-load', () => {
//     // This triggers the system print dialog with background graphics enabled
//     printWindow.webContents.print({
//       silent: false,
//       printBackground: true,
//       deviceName: ''
//     }, (success, errorType) => {
//       if (!success) console.error(errorType);
//       printWindow.close();
//     });
//   });
// });