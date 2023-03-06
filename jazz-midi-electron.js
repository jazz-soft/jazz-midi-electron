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
    var ipcMain = electron.ipcMain || ipcMainTestFake;
    var webContents = electron.webContents;
    var CLs = [];
    var client = function(wc, n) {
      var c;
      for (c of CLs) if (c.wc == wc && c.n == n) return c;
      c = { wc: wc, n: n };
      CLs.push(c);
      return c;
    }
    ipcMain.on('jazz-midi', function(evt, data) {
      var i, c, p, s;
      var wc = webContents.fromId(evt.sender.id);
      if (!data || data[0] == 'version') {
        wc.send('jazz-midi', ['version', 0, _ver]);
      }
      else if (data[0] == 'new') {
        i = 0;
        for (c of CLs) if (c.wc == wc) i++;
        wc.send('jazz-midi', ['version', i, _ver]);
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
      else if (data[0] == 'openout') {
        c = client(wc, data[1]);
        p = c.out;
        s = p ? p.name() : '';
        if (s == data[2]) {
          wc.send('jazz-midi', ['openout', data[1], data[2]]);
          return;
        }
        JZZ().openMidiOut(data[2]).then(function() {
          c.out = this;
          if (p) p.close();
          wc.send('jazz-midi', ['openout', data[1], data[2]]);
        }, function() {
          wc.send('jazz-midi', ['openout', data[1], s]);
        });
      }
      else if (data[0] == 'openin') {
        c = client(wc, data[1]);
        p = c.in;
        s = p ? p.name() : '';
        if (s == data[2]) {
          wc.send('jazz-midi', ['openin', data[1], data[2]]);
          return;
        }
        JZZ().openMidiIn(data[2]).then(function() {
          c.in = this;
          if (p) p.close();
          wc.send('jazz-midi', ['openin', data[1], data[2]]);
          c.in.connect(function(midi) {
            if (midi.length) wc.send('jazz-midi', ['midi', data[1], 0].concat(midi.slice()));
          });
        }, function() {
          wc.send('jazz-midi', ['openin', data[1], s]);
        });
      }
      else if (data[0] == 'closeout') {
        c = client(wc, data[1]);
        if (c.out) c.out.close();
        delete c.out;
      }
      else if (data[0] == 'closein') {
        c = client(wc, data[1]);
        if (c.in) c.in.close();
        delete c.in;
      }
      else if (data[0] == 'play') {
        c = client(wc, data[1]);
        if (c.out) c.out.send(data.slice(2));
      }
    });
    JME.init = function(win) {
      var wc = win.webContents;
      client(wc, 0);
      win.on('closed', function() {
        var CC = [];
        var c;
        for (c of CLs) {
          if (c.wc == wc) {
            if (c.out) c.out.close();
            if (c.in) c.in.close();
          }
          else {
            CC.push(c);
          }
        }
        CLs = CC;
      })
    };
  }
  return JME;
});
