if(typeof require != 'undefined') {
  var require = require('requirejs');
  // Require server-side-specific modules
}
if(typeof module != 'undefined') {
 // module.exports = whateverImExporting;
}
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    var collect = require('./collect.js');

    //The value returned from the function is
    //used as the module export visible to Node.
  console.log(collect);
  
  var openFiles = ["file1", "file2", "file3"];

    collect.async.each(openFiles);

   

    
  
  return function () {};
});

