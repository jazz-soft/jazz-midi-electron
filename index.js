const { spawn } = require('child_process');

var nativeApp;
var nativeAppVer;
var exchange;
var ports = [];

function encode(s) {
  var n = s.length;
  var x = '';
  for (var i = 0; i < 4; i++) {
    x += String.fromCharCode(n & 0xff);
    n >>= 8;
  }
  return x + s;
}

function Reader(read) {
  this.str = '';
  this.len = 0;
  if (typeof read === 'function') this.read = read;
}

Reader.prototype.read = console.log;

Reader.prototype.consume = function(s) {
  this.str += s;
//console.log('data received:', s);
  while (this.str.length) {
    if (this.len) {
//console.log(this.str.length, this.len);
      if (this.str.length < this.len) return;
      this.read(this.str.substring(0, this.len));
      this.str = this.str.substring(this.len);
//console.log('data consumed!');
      this.len = 0;
    }
    else {
      if (this.str.length < 4) return;
      this.len = this.str.charCodeAt(0) + (this.str.charCodeAt(1) << 8) + (this.str.charCodeAt(2) << 16) + (this.str.charCodeAt(3) << 24);
      this.str = this.str.substring(4);
      if (!this.len) this.read('');
    }
  }
}

function createPort() {
//console.log('create port');
  var id = ports.length;
  const native = spawn(nativeApp, []);
  ports.push(native);
  const reader = new Reader(function(s) {
    try { var v = JSON.parse(s);
      if (v[0] !== 'refresh') v.splice(1, 0, id);
      exchange.innerText += JSON.stringify(v) + '\n';
      document.dispatchEvent(new Event('jazz-midi-msg'));
    }
    catch (e) {}
//console.log(v);
  });
  native.on('error', function(e) { resolve(); });
  native.stdout.on('data', function(data) { 
    var str = '';
    for (var i = 0; i < data.length; i++) str += String.fromCharCode(data[i]);
    reader.consume(str);
  });
  native.stdin.write(encode('["version"]'));
}

function eventHandle(e) {
//console.log('caught event:', e.detail);
  if (!e.detail) document.dispatchEvent(new Event('jazz-midi-msg'));
  if (!exchange) {
    exchange = document.createElement('div');
    exchange.id = 'jazz-midi-msg';
    document.body.appendChild(exchange);
    createPort();
  }
  if (!e.detail) return;
  var n = 0;
  var v = e.detail.slice();
  if (v[0] === 'new') {
    createPort();
    return;
  }
  if (v[0] !== 'refresh' && v[0] !== 'watch' && v[0] !== 'unwatch') n = v.splice(1, 1);
  if (ports[n]) ports[n].stdin.write(encode(JSON.stringify(v)));
  document.dispatchEvent(new Event('jazz-midi-msg'));
}

async function startNativeApp(path) {
  return await new Promise(function(resolve, reject) {
    if (!path) resolve();
    const native = spawn(path, []);
    const reader = new Reader(function(s) {
      try { var v = JSON.parse(s);
        if (v[0] == 'version') {
          nativeApp = path;
          nativeAppVer = v[1];
          if (process.versions.electron) {
            document.addEventListener('jazz-midi', eventHandle);
            resolve(true);
          }
        }
      }
      catch (e) {}
      resolve();
    });
    native.on('error', function(e) { resolve(); });
    native.stdout.on('data', function(data) { reader.consume(data); });
    native.stdin.write(encode('["version"]'));
    native.stdin.end();
  });
}

module.exports = async function() {
  if (process.platform == 'win32') {
    const Reg = require('winreg');
    async function findWindowsPath(hive) {
      try {
        return await new Promise(function(resolve, reject) {
          Reg({ hive: hive, key: '\\Software\\Google\\Chrome\\NativeMessagingHosts\\com.jazz_soft.jazz_midi' }).values(function(err, arr) {
            if (err) {
              reject();
            }
            else {
              for (var i = 0; i < arr.length; i++) {
                if (arr[i].name == '(Default)') {
                  resolve(arr[i].value.replace(/\\[^\\]+$/, '\\jazz-chrome.exe'));
                }
              }
              reject();
            }
          });
        });
      }
      catch (e) {}
    }
    if (await startNativeApp(await findWindowsPath(Reg.HKLM))) return;
    if (await startNativeApp(await findWindowsPath(Reg.HKCU))) return;
  }
  else if (process.platform == 'darwin') {
    if (await startNativeApp('/Library/Internet Plug-Ins/jazz-chrome')) return;
  }
  else if (process.platform == 'linux') {
    if (await startNativeApp('/usr/lib/mozilla/plugins/jazz-chrome')) return;
  }
  if (!process.versions.electron) {
    if (nativeApp) {
      console.log('found Jazz-Plugin version', nativeAppVer);
    }
    else {
      console.log('Jazz-Plugin not found');
    }
    throw('jazz-midi-electron requires Electron!');
  }
  await new Promise(function(resolve, reject) {
    // Electron MIDI bug: when MIDIAccess is just open, inputs and outputs are empty.
    navigator.requestMIDIAccess().then(function() { setTimeout(resolve, 500); });
  });
};