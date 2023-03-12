const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const url = require('url');
const JZZ = require('jzz');
const JME = require('jazz-midi-electron');

// optional: adding virtual MIDI-Out port (output to the console)
var vmOut = JZZ.Widget();
vmOut.connect(function(msg) {
  console.log(msg.toString());
});
JZZ.addMidiOut('Virtual MIDI-Out', vmOut);

// optional: adding virtual MIDI-In port (generate random notes)
var vmIn = JZZ.Widget();
var n;
setInterval(function() {
    if (n) {
        vmIn.noteOff(0, n);
        n = undefined;
    }
    else {
        n = Math.floor(Math.random() * 12) + 60;
        vmIn.noteOn(0, n, 127);
    }
}, 500);
JZZ.addMidiIn('Virtual MIDI-In', vmIn);

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

ipcMain.on('open-url', (evt, url) => { shell.openExternal(url); });

Menu.setApplicationMenu(null);

app.on('ready', createWindow);

app.on('window-all-closed', () => { if (!isMac) app.quit(); });

app.on('activate', () => { if (win === null) createWindow(); });
