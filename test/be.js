backend(); // Electron Back End environment
const assert = require('assert');
const JME = require('..');

describe('backend', function() {
  it('context: backend', function() {
    assert.equal(JME.context(), 'backend');
  });
});

function IpcMain() {}
function backend() {
  IpcMain.prototype.on = function() {
  }
  global.ipcMainTestFake = new IpcMain();
}