(function(global, factory) {
  /* istanbul ignore next */
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  }
  else if (typeof define === 'function' && define.amd) {
    define('JME', [], factory);
  }
  else {
    if (!global) global = window;
    if (global.JME) return;
    global.JME = factory();
  }
})(this, function() {

  var _ver = '2.0.0';
  var _env = 'backend';
  var JME = {
    version: function() { return _ver; },
    context: function() { return _env; }
  };
  if (typeof navigator != 'undefined') {
    _env = 'webview';
    document.addEventListener('jazz-midi', function(msg) {
      window['jazz-midi'].send(msg.detail);
    });
    window['jazz-midi'].receive(function(evt, data) {
      document.dispatchEvent(new CustomEvent('jazz-midi-msg', { detail: data }));
    });
  }
  else {
    var JZZ = require('jzz');
    var electron = require('electron');
    var ipcMain = electron.ipcMain;
    var webContents = electron.webContents;
    ipcMain.on('jazz-midi', function(evt, data) {
      console.log('received data:', data);
      var i;
      var wc = webContents.fromId(evt.sender.id);
      if (!data || data[0] == 'version') {
        wc.send('jazz-midi', ['version', 0, _ver]);
      }
      else if (data[0] == 'refresh') {
        JZZ().refresh().and(function() {
          var info = this.info();
          var ins = [];
          var outs = [];
          for (i = 0; i < info.inputs.length; i++) {
            ins.push({ name: info.inputs[i].name, manufacturer: info.inputs[i].manufacturer, version: info.inputs[i].version });
          }
          for (i = 0; i < info.outputs.length; i++) {
            outs.push({ name: info.outputs[i].name, manufacturer: info.outputs[i].manufacturer, version: info.outputs[i].version });
          }
          wc.send('jazz-midi', ['refresh', { ins: ins, outs: outs }]);
        });
      }
    });
    JME.init = function(win) {
      win.on('closed', function() {
      })
    };
  }
  return JME;
});
