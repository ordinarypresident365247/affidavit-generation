const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openPrintPreview: (id) => ipcRenderer.send('open-print-preview', id),
});