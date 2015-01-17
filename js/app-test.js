// app-test.js
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

// var collect = require('./collect.js');
// var setupData = require('./setupData.js');
var collectNarratives = require('./collectNarratives.js');
var getNarrativeList = require('./getNarrativeList.js');
// var makeDocs = require('./makeDocs.js');
var filewalker = require('./filewalker.js');
var logger = require('./libs/logger.js');
var linenums = require('./linenums.js');
var functionCount = 0;
var __filename = __filename || {};
var __line = __line || {};
var consoleLog = true;

var runAppTest = function () {
//  if (consoleLog) { console.log("\n ", __filename, __line, ", runApp\n");
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, "; running ", __filename, "; ", new Date());
  }

  async.series([
      /*
       function (callback) {
       // collect raw data from the Internet
       if (consoleLog) {
       console.log("\n ", __filename, __line, "; function 2#:", ++functionCount);
       }
       collect.convertXMLToJson(); //     setupData.fixData();
       callback();
       },
       */
      /*

       },
       */
      function (callback) {
        // get the lists of narratives, consolidate in one json file
        if (consoleLog) {
          console.log("\n ", __filename, __line, "; function 3#:", ++functionCount);
        }

        // collect individuals list of links to narratives - raw data; save json file
        // collect entities list of links to narratives - raw data; save json file
        // as /data/narrative_lists/narrative_links.json

        getNarrativeList.getListOfNarratives();
        callback();
      },

      function (callback) {
        // collect the narrative files from the Internet
        if (consoleLog) {
          console.log("\n ", __filename, __line, "; function 3#:", ++functionCount);
        }
        // read the file: /data/narrative_lists/narrative_links.json
        // loop through the list of ids and filenames/links and get the narrative files from the Internet and save each to a local file
        // using links from narrative_links.json, collect and save the narratives
        // as /data/narrative_summaries/ + link_data_item.narrativeFileName
        // using file names/links from /data/narrative_lists/narrative_links.json, collect and save the narratives

        collectNarratives.getTheNarratives();
        callback();
      },

      /*
       function (callback) {
       // put data in arrays for d3
       if (consoleLog) {
       console.log("\n ", __filename, __line, "; function 3#:", ++functionCount);
       }
       setupData.fixData();
       callback();
       },

       /*
       function (callback) {
       // put the narrative in the data structure
       if (consoleLog) {
       console.log("\n ", __filename, __line, "; function #:", ++functionCount);
       }
       makeDocs.get_html_docs();
       callback();
       },

       */
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

    ],
    function (err) { //This function gets called after the two tasks have called their "task callbacks"
      if (err) console.log("\n app.js 32 Err: ", err);
    }
  );
};
runAppTest();
