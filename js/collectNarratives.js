// collectNarratives.js
// =========================

if (typeof define !== 'function') {
  var define = require('amdefine');
}
// var tika = require('tika');
 var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

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
  trunc = require('./trunc.js'),
  requestSync = require('sync-request'),
  narrCounter,
  errors
parseString = require('xml2js')
  .parseString;

var mongojs = require("mongojs");
var db;
var linenums = require('./linenums.js');
var jsonPath = require('JSONPath');
// var filewalker = require('filewalker');
var consoleLog = true;

var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};
var data;
String.prototype.trunc = String.prototype.trunc ||
function (n) {
  return this.length > n ? this.substr(0, n - 1) + '&hellip,' : this;
};
require('console-stamp')(console, '[HH:MM:ss.l]');
var now = new Date();
dateFormat.masks.friendly_detailed = "dddd, mmmm dS, yyyy, h:MM:ss TT";
dateFormat.masks.friendly_display = "dddd, mmmm dS, yyyy";
dateFormat.masks.file_generated_date = "yyyy-mm-dd";
dateFormat.masks.common = "mm-dd-yyyy";
// Basic usage
// dateFormat.masks.hammerTime = 'yyyy-mm-dd-HHMMss';
// var displayDateString = dateFormat(now, "friendly_display");
// Saturday, June 9th, 2007, 5:46:21 PM
// var fileDateString = dateFormat(now, "hammerTime");
var urls;
var requestHandler;
var collectFilePath, link_data_array_item, saveFilePath;
var dataLocalFileNameAndPath = __dirname + "/../data/output/AQList-clean-docs.json";
var narrativeLinksLocalFileNameAndPath = __dirname + "/../data/narrative_lists/narrative_links.json";
var narrative_links;

var getTheNarratives = function () {
  var functionCount = 0;
  var narratives;

  async.series([
      function (callback) {
        // remove/delete old narrative files and other old files prior to collecting current narratives
        if (false) {
          if (consoleLog) {
            console.log("\n ", __filename, __line, "; function #:", ++functionCount);
          }
          var narrativeSummariesLocalDirectory = "./data/narrative_summaries";
          // console.log("\n ", __filename, "line", __line, "; Deleting directory: ", narrativeSummariesLocalDirectory);
          // delete narrative_summaries directory and contents
          // fse.removeSync(narrativeSummariesLocalDirectory);
          //  console.log("\n ", __filename, "line", __line, "; Deleting file: /data/narrative_lists/narrative_links_docs.json");
          // fse.removeSync("./data/narrative_lists/narrative_links_docs.json");
          // fse.removeSync("./data/narrative_lists/narrative_links.json");
          // fse.removeSync("./data/narrative_lists/narrative_links.json");
          // re-create narrative_summaries directory
          //   fse.mkdirs(narrativeSummariesLocalDirectory);
        }
        callback();
      },
      // load the local narrative_links.json file, store in variable named 'narrative_links'
      // load the local narrative_links.json file, store in variable named 'narrative_links'
      function (callback) {
        console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");
        try {
          var dataBuffer = fse.readFileSync(dataLocalFileNameAndPath);
          data = JSON.parse(dataBuffer);
        } catch (err) {
          console.log("\n ", __filename, "line", __line, "; Error: ", err);
        }
        try {
          var linksBuffer = fse.readFileSync(narrativeLinksLocalFileNameAndPath); // data/narrative_lists/narrative_links.json
          narrative_links = JSON.parse(linksBuffer);
        } catch (err) {
          console.log("\n ", __filename, "line", __line, "; Error: ", err);
        }
        callback();
      },

      // using file names from AQList-clean ....json, collect the extended narratives from the Internet and save as local files.
      function (callback) {
        console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");
        narrCounter = 0;
        var narrativeFile = "";
        var mainContent = "";
        var jsonFileName;
        var nodes = data.nodes;
        var node;
        errors = 0;
        for (var ldi = 0; ldi < nodes.length; ldi++) {
          narrCounter++;
          node = nodes[ldi];
          collectFilePath = "http://www.un.org/sc/committees/1267/" + node.narrativeFileName;
          saveFilePath = __dirname + "/../data/narrative_summaries/" + node.narrativeFileName;


          try {
            syncGetRawHtmlNarrativePages(collectFilePath, saveFilePath);
          } catch (err) {
            errors++;
            console.log("\n ", __filename, "line", __line, "; error number: ", errors, "; Error: ", err, "; collectFilePath = ", collectFilePath, "; saveFilePath = ", saveFilePath);
          }
          if (narrCounter < 5) {
            console.log("\n ", __filename, "line", __line, "; narrativeFile = ", narrativeFile);
            console.log("\n ", __filename, "line", __line, "; mainContent = ", mainContent);
          }
        }
        console.log("\n ", __filename, "line", __line, "; errors = ", errors, "; nodes.length = ", nodes.length, "; narrCounter = ", narrCounter);
        callback();
      }

/*
      // save the local files to mongodb
      function (callback) {
        console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");
        narrCounter = 0;
        var narrativeFile = "";
        var mainContent = "";
        var jsonFileName;
        var nodes = data.nodes;
        var node;
        errors = 0;
        for (var ldi = 0; ldi < nodes.length; ldi++) {
          narrCounter++;
          node = nodes[ldi];
          readFilePath = __dirname + "/../data/narrative_summaries/" + node.narrativeFileName;

          // Connection URL
          var url = "mongodb://localhost:27017/aq-list";
          // Use connect method to connect to the Server





          MongoClient.connect(url, function (err, db) {
            console.log("Connected correctly to server");
            assert.equal(null, err);
            console.log("\n ", __filename, "line", __line, "; err = ", err);

            var document = {name:"David", title:"About MongoDB"};
            collection.insert(document, {w: 1}, function(err, records){
              console.log("Record added as "+records[0]._id);
            });
//            If trying to insert a record with an existing _id value, then the operation yields in error.

              collection.insert({_id:1}, {w:1}, function(err, doc){
                // no error, inserted new document, with _id=1
                collection.insert({_id:1}, {w:1}, function(err, doc){
                  // error occured since _id=1 already existed
                });
              });
            // Shorthand for insert/update is save - if _id value set, the record is updated if it exists or inserted if it does not; if the _id value is not set, then the record is inserted as a new one.

              collection.save({_id:"abc", user:"David"},{w:1}, callback)
           // callback gets two parameters - an error object (if an error occured) and the record if it was inserted or 1 if the record was updated.

          }
          db.collection('narratives').insert(narrative, function (err, r) {
            assert.equal(null, err);
            assert.equal(1, r.insertedCount);
          });


          try {
            var narrativeFile = fse.readFileSync(__dirname + "/../data/narrative_lists/" + node.narrativeFileName);
            // narrative_links = JSON.parse(buffer);
          } catch (err) {
            console.log("\n ", __filename, "line", __line, "; Error: ", err);
          }

          if (narrCounter < 5) {
            console.log("\n ", __filename, "line", __line, "; narrativeFile = ", narrativeFile);
            console.log("\n ", __filename, "line", __line, "; mainContent = ", mainContent);
          }
        }
        //        db.close();
        // });
        console.log("\n ", __filename, "line", __line, "; errors = ", errors, "; nodes.length = ", nodes.length, "; narrCounter = ", narrCounter);
        callback();
      }
*/

    ],
    function (err) {
      if (err) {
        console.log("\n ", __filename, "line", __line, " Error: \n" + err);
      }
    }
  );
};

// collect a named file from an Internet host and save it locally; specify indivOrEntityString equals a string either "entity" or "indiv"
// save to json file: narrativeLinksLocalFileNameAndPath
var syncGetRawHtmlNarrativePages = function (collectFilePath, saveFilePath) {
  var res;
  // console.log("\n ", __filename, "line: ", __line, "; getPath = ", getPath);

  res = requestSync('GET', collectFilePath);
  var responseBody = res.body.toString();
  var narrWebPageString = forceUnicodeEncoding(responseBody);
  var narrative = trimNarrative(narrWebPageString);
  writeMyFile(saveFilePath, narrative, fsOptions);
};

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
    writeMyFile(saveFilePath, narrative, fsOptions);
    // console.log("\n ", __filename, "line: ", __line, "; res.body.toString() = ", res.body.toString());
  } catch (err) {
    console.log("\n ", __filename, "line", __line, "; Error: ", err, "; writing file collected from: ", collectFilePath, " to: ", saveFilePath);
  }
};

function forceUnicodeEncoding(string) {
  return unescape(encodeURIComponent(string));
}

function trimNarrative(narrWebPageString) {
  var narrative1 = narrWebPageString.replace(/([\r\n\t])/gm, ' ');
  var narrative2 = narrative1.replace(/(\s{2,})/gm, ' ');
  var narrative3 = narrative2.replace(/<!DOCTYPE HTML PUBLIC.*MAIN CONTENT BEGINS(.*?)TemplateEndEditable.*<\/html>/mi, '$1');
  return narrative3.replace(/ =================================== --> <h3 align="center">(.*)/mi, '$1');
}

var writeMyFile = function (localFileNameAndPath, data, fsOptions) {
  try {
    fse.writeFileSync(localFileNameAndPath, data, fsOptions);
  } catch (err) {
    console.log('\n ', __filename, "line", __line, '; Error: ', err);
  }
};

module.exports = {
  getTheNarratives: getTheNarratives
};