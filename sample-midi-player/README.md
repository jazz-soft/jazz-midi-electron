# Sample JZZ MIDI Player project for Electron

### Install
    npm install

### Run
    electron .

### Code
    // index.html
    // ...
    var JZZ = require('jzz');
    require('jazz-midi-electron')().then(function () {
      // Start JZZ after jazz-midi-electron is initialized
      JZZ()//... do whatever else ...
    });


[![screenshot](screenshot.png)](https://github.com/jazz-soft/jazz-midi-electron/tree/master/sample-midi-piano)


*Back to [**jazz-midi-electron**](https://github.com/jazz-soft/jazz-midi-electron).*
