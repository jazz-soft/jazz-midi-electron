module.exports = async function() {
  if (!process.versions.electron) {
console.log('jazz-midi-electron requires Electron!');
  }
  if (process.platform == 'win32') {
console.log('jazz-midi-electron started on Windows!');
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

    let path1 = await findWindowsPath(Reg.HKLM);
    console.log('found at:', path1);

    let path = await findWindowsPath(Reg.HKCU);
    console.log('found at:', path);
  }
  else if (process.platform == 'darwin') {
console.log('jazz-midi-electron started on MacOS!');
// /Library/Google/Chrome/NativeMessagingHosts/
// /Library/Application Support/Chromium/NativeMessagingHosts/
  }
  else if (process.platform == 'linux') {
console.log('jazz-midi-electron started on Linux!');
// /etc/opt/chrome/native-messaging-hosts/
// /etc/chromium/native-messaging-hosts/
  }
};