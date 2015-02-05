// collectNarratives.js
// =========================

if (typeof define !== 'function') {
  var define = require('amdefine');
}
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var utilities_aq_viz = require('./utilities_aq_viz.js');
var async = require('async'),
  select = require('soupselect').select,
  http = require('http'),
  sys = require('sys'),
  re = require('request-enhanced'),
  fse = require('fs-extra'),
  util = require('util'),
  dateFormat = require('dateformat'),
  host = 'www.un.org',
  inspect = require('object-inspect'),
//trunc = require('./trunc.js'),
  requestSync = require('sync-request'),
  narrCounter,
  errors;
parseString = require('xml2js')
  .parseString;

var mongojs = require('mongojs');
var db;
var linenums = require('./linenums.js');
var mongoSaveFile = require('./mongoSaveFile.js');
// var jsonPath = require('JSONPath');
// var filewalker = require('filewalker');
var consoleLog = true;

var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};
var data;
// String.prototype.trunc = String.prototype.trunc ||
//function (n) {
//  return this.length > n ? this.substr(0, n - 1) + '&hellip,' : this;
// };
require('console-stamp')(console, '[HH:MM:ss.l]');
var now = new Date();
dateFormat.masks.friendly_detailed = 'dddd, mmmm dS, yyyy, h:MM:ss TT';
dateFormat.masks.friendly_display = 'dddd, mmmm dS, yyyy';
dateFormat.masks.file_generated_date = 'yyyy-mm-dd';
dateFormat.masks.common = 'mm-dd-yyyy';
// Basic usage
// dateFormat.masks.hammerTime = 'yyyy-mm-dd-HHMMss';
// var displayDateString = dateFormat(now, 'friendly_display');
// Saturday, June 9th, 2007, 5:46:21 PM
// var fileDateString = dateFormat(now, 'hammerTime');
var urls;
// var requestHandler;
var collectFilePath, saveFilePath;
var dataLocalFileNameAndPath = __dirname + '/../data/output/AQList-clean-docs.json';
// var narrativeLinksLocalFileNameAndPath = __dirname + '/../data/narrative_lists/narrative_links.json';
var narrative_links;

var getTheNarratives = function () {
  var functionCount = 0;
  var narratives;
  async.series([
      function (callback) {
        // remove/delete old narrative files and other old files prior to collecting current narratives
        if (consoleLog) {
          console.log('\n ', __filename, __line, '; function #1:', ++functionCount);
        }
        if (false) {
          var narrativeSummariesLocalDirectory = './data/narrative_summaries';
        }
        callback();
      },
      // load the local data file, store in variable named 'data'
      function (callback) {
        console.log('\n ', __filename, 'line', __line, '; function #2:', ++functionCount, '; ');
        try {
          var dataBuffer = fse.readFileSync(dataLocalFileNameAndPath);
          data = JSON.parse(dataBuffer);
        } catch (err) {
          console.log('\n ', __filename, 'line', __line, '; Error: ', err);
        }
        callback();
      },
      // using file names from nodes array in AQList-clean ....json, collect the extended narratives from the Internet and save as local files.
      function (callback) {
        console.log('\n ', __filename, 'line', __line, '; function #3:', ++functionCount, '; ');
        narrCounter = 0;
        var nodes = data.nodes;
        countUndefinedNarrativeFileNames(nodes);
        var node;
        // make sure node.narrativeFileName is defined for each node
        for (var ldi = 0; ldi < nodes.length; ldi++) {
          node = nodes[ldi];
          // manual fixes; the narrative link was not listed in the online list
          if (node.id === "QI.A.154.04") {
            node.narrativeFileName = "NSQI15404E.shtml";
            console.log('\n ', __filename, 'line', __line, '; ldi = ', ldi, '; node.narrativeFileName = ', node.narrativeFileName, " inserted manually for node.id = ", node.id);
          }

          if (node.id === "QI.A.101.03") {
            node.narrativeFileName = "NSQI10403E.shtml";
            console.log('\n ', __filename, 'line', __line, '; ldi = ', ldi, '; node.narrativeFileName = ', node.narrativeFileName, " inserted manually for node.id = ", node.id);
          }

          if (node.id === "QI.A.151.03") {
            node.narrativeFileName = "NSQI15103E.shtml";
            console.log('\n ', __filename, 'line', __line, '; ldi = ', ldi, '; node.narrativeFileName = ', node.narrativeFileName, " inserted manually for node.id = ", node.id);
          }

          if (node.id === "QI.A.104.03") {
            node.narrativeFileName = "NSQI10403E.shtml";
            console.log('\n ', __filename, 'line', __line, '; ldi = ', ldi, '; node.narrativeFileName = ', node.narrativeFileName, " inserted manually for node.id = ", node.id);
          }

          if (typeof(node.narrativeFileName) === 'undefined') {
            node.narrativeFileName = generateNarrFileName(node);
          }

          // checkFileName(node);
        }
        countUndefinedNarrativeFileNames(nodes);
//        console.log('\n ', __filename, 'line', __line, '; errors = ', errors, '; nodes.length = ', nodes.length, '; narrCounter = ', narrCounter);
        callback();
      },
      // using file names from nodes array in AQList-clean ....json, collect the extended narratives from the Internet and save as local files.
      function (callback) {
        console.log('\n ', __filename, 'line', __line, '; function #4:', ++functionCount, '; ');
        narrCounter = 0;
        var narrativeFile = '';
        var mainContent = '';
        // var jsonFileName;
        var nodes = data.nodes;
        var node;
        errors = 0;
        for (var ldi = 0; ldi < nodes.length; ldi++) {
          narrCounter++;
          node = nodes[ldi];
          collectFilePath = 'http://www.un.org/sc/committees/1267/' + node.narrativeFileName;
          saveFilePath = __dirname + '/../data/narrative_summaries/' + node.narrativeFileName;
/*
          if (false) {
            if (node.narrativeFileName === 'NSQE00401E.shtml') {
              console.log('\n ', __filename, 'line', __line, '; node.narrativeFileName === ', node.narrativeFileName);
            } else {
              continue;
            }
          }
*/
          try {
            syncGetRawHtmlNarrativePages(collectFilePath, saveFilePath);
          } catch (err) {
            errors++;
            console.log('\n ', __filename, 'line', __line, '; error number: ', errors, '; Error: ', err, '; collectFilePath = ', collectFilePath, '; saveFilePath = ', saveFilePath);
          }
          if (narrCounter < 5) {
            console.log('\n ', __filename, 'line', __line, '; narrativeFile = ', narrativeFile);
            console.log('\n ', __filename, 'line', __line, '; mainContent = ', mainContent);
          }
        }
        console.log('\n ', __filename, 'line', __line, '; errors = ', errors, '; nodes.length = ', nodes.length, '; narrCounter = ', narrCounter);
        callback();
      },
      // using file names from AQList-clean ....json, collect the extended narratives from the Internet and save them to mongodb.
      function (callback) {
        if (false) {
          console.log('\n ', __filename, 'line', __line, '; function #2:', ++functionCount, '; ');
          narrCounter = 0;
          var narrativeFile = '';
          var mainContent = '';
          var jsonFileName;
          var nodes = data.nodes;
          var node;
          errors = 0;
          for (var ldi = 0; ldi < nodes.length; ldi++) {
            narrCounter++;
            node = nodes[ldi];
            collectFilePath = 'http://www.un.org/sc/committees/1267/' + node.narrativeFileName;
            saveFilePath = __dirname + '/../data/narrative_summaries/' + node.narrativeFileName;
            try {
              mongoSaveFile.mongoUpsert(node.narrativeFileName);
            } catch (err) {
              errors++;
              console.log('\n ', __filename, 'line', __line, '; error number: ', errors, '; Error: ', err, '; collectFilePath = ', collectFilePath, '; saveFilePath = ', saveFilePath);
            }
            if (narrCounter < 5) {
              console.log('\n ', __filename, 'line', __line, '; narrativeFile = ', narrativeFile);
              console.log('\n ', __filename, 'line', __line, '; mainContent = ', mainContent);
            }
          }
          console.log('\n ', __filename, 'line', __line, '; errors = ', errors, '; nodes.length = ', nodes.length, '; narrCounter = ', narrCounter);
        }
        callback();
      }
    ],
    function (err) {
      if (err) {
        console.log('\n ', __filename, 'line', __line, ' Error: \n' + err);
      }
    }
  );
};

// collect a named file from an Internet host and save it locally; specify indivOrEntityString equals a string either 'entity' or 'indiv'
// save to json file: narrativeLinksLocalFileNameAndPath
var syncGetRawHtmlNarrativePages = function (collectFilePath, saveFilePath) {
  var res;
  // console.log('\n ', __filename, 'line: ', __line, '; getPath = ', getPath);
  res = requestSync('GET', collectFilePath);
  var responseBody = res.body.toString();
  var narrWebPageString = utilities_aq_viz.forceUnicodeEncoding(responseBody);
  var narrative = utilities_aq_viz.trimNarrative(narrWebPageString, collectFilePath);
  utilities_aq_viz.syncWriteMyFile(saveFilePath, narrative, fsOptions);
};

var checkFileName = function (node) {
//  var message, x;
//  message = document.getElementById("message");
//  message.innerHTML = "";
//  x = document.getElementById("demo").value;
  // try {
  var message = "node.id = " + node.id + " has undefined node.narrativeFileName";
  if (typeof(node.narrativeFileName) === 'undefined') {
    throw message;
  }
};

var countUndefinedNarrativeFileNames = function (nodes) {
//  var message, x;
//  message = document.getElementById("message");
//  message.innerHTML = "";
//  x = document.getElementById("demo").value;
  // try {
  var undefinedCount = 0;
  for (var ldi = 0; ldi < nodes.length; ldi++) {
    node = nodes[ldi];
    if (typeof(node.narrativeFileName) === 'undefined') {
      undefinedCount++;
    }
  }
  console.log('\n ', __filename, 'line: ', __line, '; undefinedCount = ', undefinedCount, '; nodes.length = ', nodes.length);
};

/*
 // collect a named file from an Internet host and save it locally; specify indivOrEntityString equals a string either "entity" or "indiv"
 // save to json file: narrativeLinksLocalFileNameAndPath
 var syncGetRawHtmlNarrativePages1 = function (collectFilePath, saveFilePath) {
 var res;
 // console.log("\n ", __filename, "line: ", __line, "; getPath = ", getPath);
 try {
 res = requestSync('GET', collectFilePath);
 // console.log("\n ", __filename, "line: ", __line, "; res.body.toString() = ", res.body.toString());
 } catch (err) {
 console.log("\n ", __filename, "line", __line, "; Error: ", err, "; downloading: ", collectFilePath);
 }
 try {
 var responseBody = res.body.toString();
 // console.log("\n ", __filename, "line: ", __line, "; res.body.toString() = ", res.body.toString());
 } catch (err) {
 console.log("\n ", __filename, "line", __line, "; Error: ", err, "; parsing response body from: ", collectFilePath);
 }
 var narrWebPageString = forceUnicodeEncoding(responseBody);
 var narrative = trimNarrative(narrWebPageString);
 try {
 syncWriteMyFile(saveFilePath, narrative, fsOptions);
 // console.log("\n ", __filename, "line: ", __line, "; res.body.toString() = ", res.body.toString());
 } catch (err) {
 console.log("\n ", __filename, "line", __line, "; Error: ", err, "; writing file collected from: ", collectFilePath, " to: ", saveFilePath);
 }
 };
 */
/*
 function forceUnicodeEncoding(string) {
 return unescape(encodeURIComponent(string));
 }

 function trimNarrative(narrWebPageString) {
 var narrative1 = narrWebPageString.replace(/([\r\n\t])/gm, ' ');
 var narrative2 = narrative1.replace(/(\s{2,})/gm, ' ');

 // var narrative3 = narrative2.replace(/<!DOCTYPE HTML PUBLIC.*MAIN CONTENT BEGINS(.*?)TemplateEndEditable.*<\/html>/mi, '$1');
 var narrative3 = narrative2.replace(/.*>=?NARRATIVE SUMMARIES OF REASONS FOR LISTING<\/h3>(.*)<div id="footer">.* /mi, '$1');
 //  return narrative3.replace(/ =================================== --> <h3 align="center">(.*)/mi, '$1');
 // return narrative3;

 }
 */
/*
 // write data to a local file
 var syncWriteMyFile = function (localFileNameAndPath, data, fsOptions) {
 try {
 fse.writeFileSync(localFileNameAndPath, data, fsOptions);
 } catch (err) {
 console.log('\n ', __filename, "line", __line, '; Error: ', err);
 }
 };
 */

var generateNarrFileName = function (node) {
  var id = node.id.trim();
  var idSplit = id.split('.');
  var narrFileName = "NSQ" + idSplit[0].substring(1, 2) + idSplit[2] + idSplit[3] + '.shtml';
  console.log('\n ', __filename, 'line', __line, '; id = ', id, '; generated narrFileName = ', narrFileName);
  return narrFileName;
}


module.exports = {
  getTheNarratives: getTheNarratives
};

getTheNarratives();