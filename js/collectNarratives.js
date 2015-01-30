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
  htmlparser = require("htmlparser"),
  sys = require('sys'),
  re = require('request-enhanced'),
  fse = require('fs-extra'),
  util = require('util'),
  dateFormat = require('dateformat'),
  host = 'www.un.org',
  inspect = require('object-inspect'),
  trunc = require('./trunc.js'),
  requestSync = require('sync-request'),
  truncateToNumChars = 400,
  narrCounter,
  narrativeData,
  myJsonData,
  parseString = require('xml2js')
    .parseString;

var mongojs = require("mongojs");
var db;
var linenums = require('./linenums.js');
var jsonPath = require('JSONPath');
var filewalker = require('filewalker');
var consoleLog = true;
var narrativeLinks = [];

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
var urls, filePaths;
var requestHandler;
var collectFilePath, link_data_array_item, saveFilePath;
var dataLocalFileNameAndPath = __dirname + "/../data/output/AQList-clean-docs.json";
var narrativeLinksLocalFileNameAndPath = __dirname + "/../data/narrative_lists/narrative_links.json";
var narrative_links;

var getTheNarratives = function () {
  var functionCount = 0;
  var myResult, text, saveTextFilePath;
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

      // using file names from AQList-clean ....json, collect and save the narratives
      function (callback) {

        console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");
        narrCounter = 0;
        var narrativeFile = "";
        var mainContent = "";
        var jsonFileName;
        var nodes = data.nodes;
        for (var ldi = 0; ldi < nodes.length; ldi++) {
          // for (var ldi = 0; ldi < 10; ldi++) {
          narrCounter++;
          node = nodes[ldi];
          collectFilePath = "http://www.un.org/sc/committees/1267/" + node.narrativeFileName;
          //jsonFileName = makeJsonNarrativeFileName(link_data_array_item.narrativeFileName);
          saveFilePath = __dirname + "/../data/narrative_summaries/" + node.narrativeFileName;

//            console.log("\n ", __filename, "line", __line, "; buffer.length = ", buffer.length);
//            var narrWebPageString = forceUnicodeEncoding(buffer.toString());
//            narrative = trimNarrative(narrWebPageString);
          try {
            syncGetRawHtmlNarrativePages(collectFilePath, saveFilePath);
            // console.log("\n ", __filename, "line: ", __line, "; res.body.toString() = ", res.body.toString());
          } catch (err) {
            console.log("\n ", __filename, "line", __line, "; Error: ", err, "; collectFilePath = ", collectFilePath, "; saveFilePath = ", saveFilePath);
          }
//          syncGetRawHtmlNarrativePages(collectFilePath, saveFilePath);
          //   mainContent = narrativeFile.match(/<div id=\"maincontent\".*  /mg); //div id=\"maincontent\".*)<div id="footer">/);
          if (narrCounter < 5) {
            console.log("\n ", __filename, "line", __line, "; narrativeFile = ", narrativeFile);
            console.log("\n ", __filename, "line", __line, "; mainContent = ", mainContent);
          }
        }
        console.log("\n ", __filename, "line", __line, "; narrCounter = ", narrCounter);
        callback();
      }

    ],
    function (err) {
      // if (consoleLog) { console.log("\n ", __filename, "line", __line, " savedJson = ", trunc.n400(myResult));
      if (err) {
        console.log("\n ", __filename, "line", __line, " Error: \n" + err);
      }
    }
  );
};

// collect a named file from an Internet host and save it locally; specify indivOrEntityString equals a string either "entity" or "indiv"
// save to json file: narrativeLinksLocalFileNameAndPath
var syncGetRawHtmlNarrativePages = function (collectFilePath, saveFilePath) {
  // var host = 'www.un.org';
  // var getPath = "http://www.un.org" + filePath;
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
  narrative = trimNarrative(narrWebPageString);

  try {
    writeMyFile(saveFilePath, responseBody, fsOptions);
    // console.log("\n ", __filename, "line: ", __line, "; res.body.toString() = ", res.body.toString());
  } catch (err) {
    console.log("\n ", __filename, "line", __line, "; Error: ", err, "; writing file collected from: ", collectFilePath, " to: ", saveFilePath);
  }

//    writeMyFile(entitiesLocalOutputFileNameAndPath, JSON.stringify(entLinks, null, " "), fsOptions);

//  writeMyFile(narrativeLinksLocalFileNameAndPath, JSON.stringify(narrativeLinks, null, " "), fsOptions);
};

function forceUnicodeEncoding(string) {
  return unescape(encodeURIComponent(string));
}

function trimNarrative(narrWebPageString) {
  var narrative1 = narrWebPageString.replace(/([\r\n\t])/gm, ' ');
  var narrative2 = narrative1.replace(/(\s{2,})/gm, ' ');
  narrative = narrative2.replace(/<!DOCTYPE HTML PUBLIC.*MAIN CONTENT BEGINS(.*?)TemplateEndEditable.*<\/html>/mi, '$1');
  return narrative;
}

var getMyFile = function () {
  var fileNameToSaveTo = __dirname + "/../data/output/AQList.xml";
  re.get("http://www.un.org/sc/committees/1267/AQList.xml", fileNameToSaveTo, function (error, filename) {
    if (error) {
      console.log("\n ", __filename, "line", __line, "; Error \n" + error);
    }
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, "; Saved content to: \n", filename);
    }
  });
};

var writeMyFile = function (localFileNameAndPath, data, fsOptions) {
  try {
    fse.writeFileSync(localFileNameAndPath, data, fsOptions);
  } catch (err) {
    console.log('\n ', __filename, "line", __line, ' Error: ', err);
  }
};

var getFile = function (url, fileNameToSaveTo) {
  // example: url = "http://www.un.org/sc/committees/1267/AQList.xml"
  // example: fileNameToSaveTo = __dirname + "/../data/output/AQList.xml";
//   fileNameToSaveTo = __dirname + "/../data/output/AQList.xml";
  //  re.get("http://www.un.org/sc/committees/1267/AQList.xml", fileNameToSaveTo, function (error, filename) {
  re.get(url, fileNameToSaveTo, function (err, filename) {
    if (err) {
      console.log("\n ", __filename, "line", __line, "; Error \n" + err);
    } else if (consoleLog) {
      console.log("\n ", __filename, "line", __line, "; Saved content to: \n", filename);
    }
  });
};

var makeJsonNarrativeFileName = function (narrativeFileNameString) {
  // console.log("\n ", __filename, __line, "; narrativeFileNameString = ", narrativeFileNameString);
  return narrativeFileNameString.replace(/(NSQ.*\.)shtml/, '$1json');
  // var narrativeFileName1 = narrativeFileNameString.replace(/http:\/\/dev.un.org(\/sc\/committees\/1267\/NSQ.*\.shtml)/, '$1');
  // console.log("\n ", __filename, __line, "; narrativeFileName1 = ", narrativeFileName1);
//  var narrativeFileName2 = narrativeFileName1.replace(/\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');

};

module.exports = {
  getTheNarratives: getTheNarratives
};