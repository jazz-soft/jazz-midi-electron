webview(); // WebView environment
const assert = require('assert');
const version = require('../package.json').version;
const JME = require('..');

describe('webview', function() {
  it('version ' + version, function() {
    //assert.equal(JME.version(), version);
  });
  it('context: webview', function() {
    assert.equal(JME.context(), 'webview');
  });
  it('send', function() {
    document.dispatchEvent(new CustomEvent('jazz-midi'));
  });
  it('receive', function() {
    window.dispatchEvent({ type: 'message', data: { type: 'jazz-midi-msg' } });
  });
});

function DOC() {}
function WIN() { this['jazz-midi'] = this; }
function CustomEvent(t, d) {
  this.type = t;
  this.detail = d;
}
function webview() {
  DOC.prototype.addEventListener = function(t, f) {
    this.listener = f;
  };
  DOC.prototype.dispatchEvent = function(e) { this.listener(e); };

  WIN.prototype.send = function(f) {};
  WIN.prototype.receive = function(f) { this.listener = f; };
  WIN.prototype.dispatchEvent = function(e) { this.listener(e); };

  global.document = new DOC();
  global.window = new WIN();
  global.navigator = true;
}
