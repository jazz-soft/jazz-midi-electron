const { spawn } = require('child_process');

var nativeApp;
var nativeAppVer;

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
  while (this.str.length) {
    if (this.len) {
      if (this.str.length < this.len) return;
      this.read(this.str.substring(0, this.len));
      this.str = this.str.substring(this.len);
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

function initExtension() {
console.log('init web-extension...');
}

async function startNativeApp(path) {
  return await new Promise(function(resolve, reject) {
    if (!path) resolve();
    const native = spawn(path, []);
    const reader = new Reader(function(s) {
      try { var a = JSON.parse(s);
        if (a[0] == 'version') {
          nativeApp = path;
          nativeAppVer = a[1];
          if (process.versions.electron) {
            initExtension();
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