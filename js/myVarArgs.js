// turn arguments into array
var varargs = require('varargs');

function myfunction() {
  var args = varargs(arguments);
  console.log(args); // ['abc', 123] 
}

myfunction('abc', 123);
 