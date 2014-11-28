// app.js
//=============
if(typeof define !== 'function') {
  var define = require('amdefine');
}
var async = require('async'),
  re = require('request-enhanced'),
  request = require('request'),
  fs = require('fs'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect'),
  parseString = require('xml2js')
    .parseString;

var collect = require('./collect.js');
var setupData = require('./setupData.js');
var logger = require('./libs/logger.js');
var linenums = require('./linenums.js');
var functionCount = 0;

var runApp = function() {

//  console.log("\n ", __filename, __line, ", runApp\n");
  console.log("\n ", __filename, "line", __line, Date());

  async.series([
    function(callback) {
      // collect AQList.xml from public web site, convert to json, save locally
      //(function() {
        console.log("\n ", __filename, __line, "  function 1#:", ++functionCount);
      console.log("\n ", __filename, __line, Date());
        // collect.getXMLFile();
//      document.getElementById("demo").innerHTML = Date();
        callback();
      //})();
    },
    function(callback) {
      // put data in arrays for d3
      // (function() {
 console.log("\n ", __filename, __line, "; function 2#:", ++functionCount);
        collect.convertXMLToJson(); //     setupData.fixData();
        callback();
      // })();
    },
    function(callback) {
      // put data in arrays for d3
      // (function() {
       console.log("\n ", __filename, __line, "; function 2#:", ++functionCount);
      //  console.log("\n app.js function 3#:", ++functionCount);
        setupData.fixData();
        callback();
      // })();
    }
  ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
    if(err) console.log("\n app.js 32 Err: ", err);
  });
};
runApp();
