const {app, BrowserWindow} = require('electron');
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

  JME.init(win);

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
