const { spawn } = require('child_process');

var nativeApp;

async function startNativeApp(path) {
  if (!path) return;
  console.log('spawning:', path);
}

async function startWebMidi() {
  await new Promise(function(resolve, reject) {
    if (!process.versions.electron) {
      reject('jazz-midi-electron requires Electron!');
    }
    else {
      // Electron MIDI bug: when MIDIAccess is just open, inputs and outputs are empty.
      navigator.requestMIDIAccess().then(function() { setTimeout(resolve, 500); });
    }
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
    await startWebMidi();
  }
  else if (process.platform == 'darwin') {
    if (await startNativeApp('/Library/Internet Plug-Ins/jazz-chrome')) return;
    await startWebMidi();
  }
  else if (process.platform == 'linux') {
    if (await startNativeApp('/usr/lib/mozilla/plugins/jazz-chrome')) return;
    await startWebMidi();
  }
};