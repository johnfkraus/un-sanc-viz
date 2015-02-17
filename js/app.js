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
var collectNarratives = require('./collectNarratives.js');
var getNarrativeList = require('./getNarrativeList.js');
var makeDocs = require('./makeDocs.js');
var filewalker = require('./filewalker.js');
var logger = require('./libs/logger.js');
var linenums = require('./linenums.js');
var functionCount = 0;
var __filename = __filename || {};
var __line = __line || {};
var consoleLog = false;

var runApp = function () {
//  if (consoleLog) { console.log("\n ", __filename, __line, ", runApp\n");
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, "; running app.js; ", new Date());
  }

  async.series([
    function (callback) {
      // collect raw data from the Internet
      if (consoleLog) {
        console.log("\n ", __filename, __line, "; function 2#:", ++functionCount);
      }
      collect.convertXMLToJson(); //     setupData.fixData();
      callback();
    },

    function (callback) {
      // get the lists of narratives, consolidate in one json file
      if (consoleLog) {
        console.log("\n ", __filename, __line, "; function 3#:", ++functionCount);
      }
      getNarrativeList.getListOfNarratives();
      callback();
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
      // collect the narrative files from the Internet
      if (consoleLog) {
        console.log("\n ", __filename, __line, "; function 3#:", ++functionCount);
      }
      collectNarratives.getTheNarratives();
      callback();
    },

    function (callback) {
      // put the narrative in the data structure
      if (consoleLog) {
        console.log("\n ", __filename, __line, "; function 4#:", ++functionCount);
      }
      makeDocs.get_html_docs();
      callback();
    },
    function (callback) {
      // list files in /data/output
      if (consoleLog) {
        console.log("\n ", __filename, __line, "; function 5#:", ++functionCount);
      }
      // console.log("\n ", __filename, "line", __line, "; running filewalker.filewalker()");
      var fwPath = "./data/output";
      filewalker.filewalker(fwPath);

      callback();
    }

  ], function (err) { //This function gets called after the two tasks have called their "task callbacks"
    if (err) console.log("\n app.js 32 Err: ", err);
  });
};
runApp();
