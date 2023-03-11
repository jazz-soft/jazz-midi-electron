const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jazz-midi', {
    send: (data) => ipcRenderer.send('jazz-midi', data),
    receive: (cb) => ipcRenderer.on('jazz-midi', cb)
});
