# jazz-midi-electron

[![npm](https://img.shields.io/npm/v/jazz-midi-electron.svg)](https://www.npmjs.com/package/jazz-midi-electron)
[![npm](https://img.shields.io/npm/dt/jazz-midi-electron.svg)](https://www.npmjs.com/package/jazz-midi-electron)
[![build](https://github.com/jazz-soft/jazz-midi-electron/actions/workflows/build.yml/badge.svg)](https://github.com/jazz-soft/jazz-midi-electron/actions)
[![Coverage Status](https://coveralls.io/repos/github/jazz-soft/jazz-midi-electron/badge.svg?branch=master)](https://coveralls.io/github/jazz-soft/jazz-midi-electron?branch=master)

## MIDI for Electron

MIDI integration in [**Electron**](https://electronjs.org) applications.

( see also: [jazz-midi-vscode](https://github.com/jazz-soft/jazz-midi-vscode) ... )

*Notice:* v2.x.x introduces some breaking changes,  
however, upgrading old projects from v1.x.x will well worth the trouble.  
You are getting:
- fewer dependencies
- improved code security
- no additional installs required

[**sample-midi-piano**](https://github.com/jazz-soft/jazz-midi-electron/tree/master/sample-midi-piano)  
[![screenshot](https://raw.githubusercontent.com/jazz-soft/jazz-midi-electron/master/sample-midi-piano/screenshot.png)](https://github.com/jazz-soft/jazz-midi-electron/tree/master/sample-midi-piano)

[**sample-midi-player**](https://github.com/jazz-soft/jazz-midi-electron/tree/master/sample-midi-piano)  
[![screenshot](https://raw.githubusercontent.com/jazz-soft/jazz-midi-electron/master/sample-midi-player/screenshot.png)](https://github.com/jazz-soft/jazz-midi-electron/tree/master/sample-midi-player)

## Install
`npm install jazz-midi-electron --save`

## Usage
( see the sample projects above... )

### Main Process

```js
const JZZ = require('jzz');
// jazz-midi-electron is not required if using MIDI only in the Main Process
// ...
JZZ().openMidiOut() // ...
```
Main Process can use [**JZZ.js**](https://github.com/jazz-soft/JZZ) as normal Node.js application.  
It can access regular MIDI ports and create virtual ports.

### Browser Window

```html
<script src='node_modules/jazz-midi-electron/jazz-midi-electron.js'></script>
<script src='node_modules/jzz/javascript/JZZ.js'></script>
// ...
JZZ().openMidiOut() // ...
```
```js
// when creating the Browser Window:
const JME = require('jazz-midi-electron');
// ...
win = new BrowserWindow({
    // ...
    webPreferences: { // see the preload.js in this repository
        preload: path.join(__dirname, 'preload.js')
    }
});
JME.init(win);
// ...
```
Browser Window will see all MIDI ports (including virtual) available to the Main Process.  
It can create additional Web Audio and HTML-based MIDI ports
(see [jzz-synth-tiny](https://github.com/jazz-soft/JZZ-synth-Tiny) and [jzz-input-kbd](https://github.com/jazz-soft/JZZ-input-Kbd)).
