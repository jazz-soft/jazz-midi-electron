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
  }

console.log('context:', _env);

  return JME;
});
