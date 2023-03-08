backend(); // Electron Back End environment
const assert = require('assert');
const JME = require('..');
var ipc, wc1, wc2, win2, win1, fake_in;

describe('backend', function() {
  it('context: backend', function() {
    assert.equal(JME.context(), 'backend');
  });
  it('init', function() {
    JME.init(win1);
    JME.init(win2);
    win1.send();
  });
  it('new', function() {
    win1.send(['new']);
  });
  it('refresh', function() {
    win1.send(['refresh']);
  });
  it('openout', function() {
    win1.send(['openout', 0, 'Not existent']);
    win1.send(['openout', 0, 'Fake MIDI-Out 1']);
    win1.send(['openout', 0, 'Fake MIDI-Out 1']);
    win1.send(['openout', 0, 'Fake MIDI-Out 2']);
    win1.send(['openout', 1, 'Fake MIDI-Out 1']);
  });
  it('openin', function() {
    win1.send(['openin', 0, 'Not existent']);
    win1.send(['openin', 0, 'Fake MIDI-In 1']);
    win1.send(['openin', 0, 'Fake MIDI-In 1']);
    win1.send(['openin', 0, 'Fake MIDI-In 2']);
    win1.send(['openin', 1, 'Fake MIDI-In 1']);
  });
  it('closeout', function() {
    win1.send(['closeout', 0]);
    win1.send(['closeout', 0]);
  });
  it('closein', function() {
    win1.send(['closein', 0]);
    win1.send(['closein', 0]);
  });
  it('midi', function() {
    fake_in._emit([]);
    fake_in._emit([0x90, 0x60, 0x7f]);
  });
  it('play', function() {
    win1.send(['play', 0, 0x90, 0x60, 0x7f]);
    win1.send(['play', 1, 0x90, 0x60, 0x7f]);
  });
  it('other', function() {
    win1.send(['other']);
  });
  it('exit', function() {
    win1.close();
  });
});

function WC() {}
function WIN(wc) { this.webContents = wc; this.handles = {} }
function IpcMain() { this.handles = {} }
function backend() {
  WC.prototype.send = function() {}
  WIN.prototype.on = function(evt, fn) {
    this.handles[evt] = fn;
  }
  WIN.prototype.send = function(data) {
    if (ipc.handles['jazz-midi']) ipc.handles['jazz-midi']({ sender: { id: this.webContents } }, data);
  }
  WIN.prototype.close = function() {
    if (this.handles.closed) this.handles.closed();
  }
  IpcMain.prototype.on = function(evt, fn) {
    this.handles[evt] = fn;
  }
  wc1 = new WC();
  wc2 = new WC();
  win1 = new WIN(wc1);
  win2 = new WIN(wc2);
  ipc = new IpcMain();
  global.ipcMainTestFake = ipc;
  global.webContentsTestFake = { fromId: function(x) { return x; } };
  const JZZ = require('jzz');
  fake_in = JZZ.Widget();
  JZZ.addMidiIn('Fake MIDI-In 1', fake_in);
  JZZ.addMidiIn('Fake MIDI-In 2', JZZ.Widget());
  JZZ.addMidiOut('Fake MIDI-Out 1', JZZ.Widget());
  JZZ.addMidiOut('Fake MIDI-Out 2', JZZ.Widget());
}