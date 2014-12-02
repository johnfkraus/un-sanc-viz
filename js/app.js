// app.js
//=============
if (typeof define !== 'function') {
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
var docs = require('./docs.js');
var filewalker = require('./filewalker.js');
var logger = require('./libs/logger.js');
var linenums = require('./linenums.js');
var functionCount = 0;

var consoleLog = false;
var runApp = function () {

//  if (consoleLog) { console.log("\n ", __filename, __line, ", runApp\n");
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, new Date());
  }

  async.series([
    function (callback) {
      // collect AQList.xml from public web site, convert to json, save locally
      //(function() {
      if (consoleLog) {
        console.log("\n ", __filename, __line, "  function 1#:", ++functionCount);
      }
      if (consoleLog) {
        console.log("\n ", __filename, __line, new Date());
      }
      // collect.getXMLFile();
//      document.getElementById("demo").innerHTML = Date();
      callback();
      //})();
    },
    function (callback) {
      // put data in arrays for d3
      // (function() {
      if (consoleLog) {
        console.log("\n ", __filename, __line, "; function 2#:", ++functionCount);
      }
      collect.convertXMLToJson(); //     setupData.fixData();
      callback();
      // })();
    },
    function (callback) {
      // put data in arrays for d3
      if (consoleLog) {
        console.log("\n ", __filename, __line, "; function 3#:", ++functionCount);
      }
      setupData.fixData();
      callback();
     },
    function (callback) {
      // put data in arrays for d3
      if (consoleLog) {
        console.log("\n ", __filename, __line, "; function 3#:", ++functionCount);
      }
      docs.get_html_docs();
      callback();
    },
    function (callback) {
      // list files in /data/output
      if (consoleLog) {
        console.log("\n ", __filename, __line, "; function 3#:", ++functionCount);
      }
      filewalker.filewalker();
      callback();
    }


  ], function (err) { //This function gets called after the two tasks have called their "task callbacks"
    if (err) console.log("\n app.js 32 Err: ", err);
  });
};
runApp();
