// collectNarratives.js
// download and save locally every narrative file from the U.N. site.
// =========================

// Previously we collected two shtml files from the U.N. site containing lists of sanctioned individuals and
// entities (i.e., 'nodes') along with the urls of narrative files for each node.
// We converted those two files into json and saved them here:  '/data/narrative_lists/individuals_associated_with_Al-Qaida.json' and
// '/data/narrative_lists/entities_other_groups_undertakings_associated_with_Al-Qaida.json'.
// The name of the narrative file was inserted as a property of each node.
// Now we download each narrative file and store it locally in a normalized format.
// there are over three hundred nodes (i.e., sanctioned individuals or entities) in the data set.  If you don't want
// run this script on every one of them, set 'debugWithFewerNodesCount to a smaller integer.  The number of nodes
// processed will the be the lesser of the actual total number of nodes (approximately 314) or the value of debugWithFewerNodesCount.
var debugWithFewerNodesCount = 9999;
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
var urls;
var collectFilePath, saveFilePath;
var dataLocalFileNameAndPath = __dirname + '/../data/output/AQList-clean.json';
var narrative_links;

var getTheNarratives = function () {
  var functionCount = 0;
  var narratives;
  async.series([
      // remove/delete old narrative files and other old files prior to collecting current narratives
      // incomplete and not implemented
      function (callback) {
        if (consoleLog) {
          console.log('\n ', __filename, __line, '; function #1:', ++functionCount);
        }
        if (false) {
          // var narrativeSummariesLocalDirectory = './data/narrative_summaries';
        }
        callback();
      },

      // load the local data file and store it in the variable named 'data'
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

      // The UN list files omit some of the nodes.  In some cases, this appears to be an oversight.  In others, the node
      // is no longer on the sanctions list.  There may be other reasons for the omission as well.
      // If no narrative file name for a node could be found in the UN list files, we generate the expected file name
      // based an observed relationship between a given nodes id and its narrative file name.
      function (callback) {
        console.log('\n ', __filename, 'line', __line, '; function #3:', ++functionCount, '; ');
        narrCounter = 0;
        var nodes = data.nodes;
        countUndefinedNarrativeFileNames(nodes);
        var node = null;
        // check if the node.narrativeFileName is defined for each node
        for (var ldi = 0; ldi < Math.min(nodes.length, debugWithFewerNodesCount); ldi++) {
          node = nodes[ldi];
          var narrativeFileNameIsMissing = (typeof(node.narrativeFileName) === 'null' || typeof(node.narrativeFileName) === 'undefined');
          //          if (typeof(node.narrativeFileName) === 'null' || typeof(node.narrativeFileName) === 'undefined') {
          if (narrativeFileNameIsMissing) {
            node.narrativeFileName = generateNarrFileName(node);
            console.log('\n ', __filename, 'line', __line, '; Generated narrative file name for node.id = ', node.id, '; ldi = ', ldi, '; node.name = ', node.name, '; node.noLongerListed = ', node.noLongerListed);
          }
        }

        countUndefinedNarrativeFileNames(nodes);
        callback();
      },
      // using file names from nodes array in the 'data' variable (loaded from local file AQList-clean ....json),
      // collect the extended narratives from the Internet and save as local files.
      // If no narrative file name listed in the list found on the U.N. site, generate the file name based the pattern that
      // infers that the narrative file name can be deduced from the node id.
      // using file names from nodes array in AQList-clean ....json, collect the extended narratives from the Internet and save as local files.
      function (callback) {
        console.
          log('\n ', __filename,
          'line', __line,
          '; function #4:', ++
            functionCount, '; ');
        narrCounter = 0;
        var narrativeFile = '';
        var mainContent = '';
        // var jsonFileName;
        var nodes = data.nodes;
        var node;
        var
          collectAndSaveLocallyNarrativePagesErrorsCount = 0;

//        for (var ldi = 0; ldi < nodes.length; ldi++) {
        for (var ldi = 0; ldi < Math.min(nodes.
          length, debugWithFewerNodesCount); ldi++) {
          narrCounter++;
          node = nodes[ldi];
          collectFilePath = 'http://www.un.org/sc/committees/1267/' + node.
            narrativeFileName;
          saveFilePath = __dirname +
          '/../data/narrative_summaries/' + node.narrativeFileName;
          try {
            syncGetRawHtmlNarrativePages(collectFilePath, saveFilePath);
          } catch (err) {
            console.log('\n ', __filename, 'line', __line, '; collectAndSaveLocallyNarrativePagesErrorsCount =  ',
              collectAndSaveLocallyNarrativePagesErrorsCount++, '; Error: ', err, '; collectFilePath = ', collectFilePath, '; saveFilePath = '
              , saveFilePath);
          }
          if (narrCounter < 5) {
            console.log(
              '\n '
              , __filename, 'line', __line, '; narrativeFile = ', narrativeFile);
            console.log('\n ', __filename, 'line', __line,
              '; mainContent = ',
              mainContent);
          }
        }
        console.log('\n ', __filename, 'line', __line, '; errors = ', errors,
          '; nodes.length = ', nodes.length, '; narrCounter = ',
          narrCounter);
        callback();
      },

      // mongodb database: using file names from AQList-clean ....json, collect the extended narratives from the Internet and save them to mongodb.
      // incomplete, unimplemented
      function (callback) {
        if (false) {
          console.log('\n ',
            __filename, 'line', __line, '; function #2:', ++functionCount, '; ');

          narrCounter = 0;
          var narrativeFile = '';
          var mainContent = '';
          // var jsonFileName;
          var nodes = data.nodes;
          var node;
          errors = 0;
          // for (var ldi = 0; ldi < nodes.length; ldi++) {

          for (var ldi = 0; ldi < Math.min(nodes.length, debugWithFewerNodesCount); ldi++) {
            narrCounter++
            ;
            node = nodes[ldi];
            collectFilePath =
              'http://www.un.org/sc/committees/1267/' + node.narrativeFileName;
            // saveFilePath = __dirname + '/../data/narrative_summaries/' + node.narrativeFileName;
            try {
              // mongoSaveFile.mongoUpsert(node.narrativeFileName);
            } catch (err) {
              errors++;
              console.log('\n ', __filename, 'line', __line, '; error number: ',
                errors,
                '; Error: ', err, '; collectFilePath = ', collectFilePath, '; saveFilePath = ', saveFilePath);
            }
            if (ldi < 5) {
              console.log(
                '\n ',
                __filename, 'line',
                __line,
                '; narrativeFile = ', narrativeFile, '; mainContent = ', mainContent);
            }
          }
          console.log('\n ', __filename, 'line', __line, '; errors = ', errors, '; nodes.length = ', nodes.length, '; ldi = ', ldi);
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
  try {
    var res;
    res = requestSync('GET', collectFilePath);
    var responseBody = res.body.toString();
    var narrWebPageString = utilities_aq_viz.forceUnicodeEncoding(responseBody);
    var narrative = utilities_aq_viz.trimNarrative(narrWebPageString, collectFilePath);
    utilities_aq_viz.syncWriteMyFile(saveFilePath, narrative, fsOptions);
  } catch (err) {
    console.log('\n ', __filename, 'line', __line, '; Error: ', err);
  }
};

// throw an error if node.narrativeFileName is null or undefined
var checkNarrativeFileName = function (node) {
  var errorMessageNull = 'node.id = ' + node.id + ' has null node.narrativeFileName';
  var errorMessageUndefined = 'node.id = ' + node.id + ' has undefined node.narrativeFileName';
  if (typeof(node.narrativeFileName) === 'null') {
    throw errorMessageNull;
  } else if (typeof(node.narrativeFileName) === 'undefined') {
    throw errorMessageUndefined;
  }
};

var countUndefinedNarrativeFileNames = function (nodes) {
  var nullCount = 0;
  var undefinedCount = 0;
  var node;
  for (var ldi = 0; ldi < nodes.length; ldi++) {
    node = nodes[ldi];
    if (typeof(node.narrativeFileName) === 'null') {
      nullCount++;
      continue;
    }
    if (typeof(node.narrativeFileName) === 'undefined') {
      undefinedCount++;
    }
  }
  console.log('\n\n ', __filename, 'line: ', __line, '; nullCount = ', nullCount, '; undefinedCount = ', undefinedCount, '; nodes.length = ', nodes.length, '\n\n');
};

var generateNarrFileName = function (node) {
  var id = node.id.trim();
  var idSplit = id.split('.');
  var narrFileName = 'NSQ' + idSplit[0].substring(1, 2) + idSplit[2] + idSplit[3] + '.shtml';
  console.log('\n ', __filename, 'line', __line, '; id = ', id, '; generated narrFileName = ', narrFileName);
  return narrFileName;
};

module.exports = {
  getTheNarratives: getTheNarratives
};

// getTheNarratives();
