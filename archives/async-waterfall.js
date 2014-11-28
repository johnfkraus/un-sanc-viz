var async = require('async');

async.waterfall([
  function(callback){
    callback(null, 'one', 'two');
  },
  function(arg1, arg2, callback){
    // arg1 now equals 'one' and arg2 now equals 'two'
    console.log("9 arg1 = ", arg1, "; arg2 = ", arg2);
    callback(null, 'three');
  },
  function(arg1, callback){
    // arg1 now equals 'three'
    console.log("14 arg1 = ", arg1);
    callback(null, 'done');
  }
], function (err, result) {
  console.log("18 result = ", result);
  // result now equals 'done'
});