const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const JZZ = require('jzz');
const JME = require('jazz-midi-electron');

// optional: adding virtual MIDI-Out port (output to the console)
var vmOut = JZZ.Widget();
vmOut.connect(function(msg) {
  console.log(msg.toString());
});
JZZ.addMidiOut('Virtual MIDI-Out', vmOut);

let win;
const isMac = process.platform === 'darwin';

function createWindow () {
  win = new BrowserWindow({
    width: 640,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  //uncomment for debug:
  //win.webContents.openDevTools();

  //enable MIDI in the renderer view:
  JME.init(win);

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
}

function openFile() {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'MIDI Files', extensions: ['mid', 'midi', 'kar', 'rmi'] }, { name: 'All Files', extensions: ['*'] }]
  }).then(function(result) {
    if (result.filePaths && result.filePaths[0]) {
      fs.readFile(result.filePaths[0], 'binary', (err, data) => {
        win.webContents.send('load-midi', err ?
          { err: 'Cannot open ' + result.filePaths[0] + ': ' + err } :
          { file: result.filePaths[0], data: data }
        );
      });
    }
  });
}

const menu = Menu.buildFromTemplate([
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  {
    label: 'File',
    submenu: [
      { label: 'Open', click: openFile },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  }
]);
Menu.setApplicationMenu(menu);

app.on('ready', createWindow);

app.on('window-all-closed', () => { if (!isMac) app.quit(); });

app.on('activate', () => { if (win === null) createWindow(); });
