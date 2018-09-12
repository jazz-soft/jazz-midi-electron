require('../jazz-midi-electron')().then(function() { console.log('done!'); }, function(err) { console.log(err); }).catch(function(err) {
 console.log(err);
 });
