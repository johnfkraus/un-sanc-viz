var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
// var fs = require('fs');

if (typeof define !== 'function') {
  var define = require('amdefine');
}
var async = require('async'),
  sys = require('sys'),
  re = require('request-enhanced'),
  fse = require('fs-extra'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect'),
  errors,
  parseString = require('xml2js')
    .parseString;
var col;
var linenums = require('./linenums.js');
var consoleLog = true;

var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};
var data;
require('console-stamp')(console, '[HH:MM:ss.l]');

var urls;

// var dataLocalFileNameAndPath = __dirname + "/../data/output/AQList-clean-docs.json";
// var narrativeLinksLocalFileNameAndPath = __dirname + "/../data/narrative_lists/narrative_links.json";
var jsonNarrative;
var run = function () {
  var narratives;
  var narrative;
  async.series([
      function (callback) {
        try {
          // var dataBuffer = fse.readFileSync(dataLocalFileNameAndPath);
          // var dataBuffer = fse.readFileSync(    // "C:/Users/User1\WebstormProjects/aq-list-viz/data/narrative_summaries/NSQE00301E.shtml");
          //         data = JSON.parse(dataBuffer);
          var narrFileName = "NSQE00301E.shtml"
          var narrativeBuffer = fse.readFileSync(__dirname + "/../data/narrative_summaries/" + narrFileName);
        } catch (err) {
          console.log("\n ", __filename, "line", __line, "; Error: ", err);
        }
        //  narrative = JSON.parse(narrativeBuffer);
        jsonNarrative = {};
        jsonNarrative._id = narrFileName;
        //jsonNarrative.content = JSON.parse(narrativeBuffer.toString(), null, " ");
        jsonNarrative.content = narrativeBuffer.toString();

        callback();
      },
      function (callback) {
        // Connection URL
        var url = 'mongodb://localhost:27017/aq-list';
        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
          assert.equal(null, err);
          console.log("Connected correctly to server");

// Read file with proper encoding...
//          var data = //...

//          db = db.getSiblingDB('narratives');
// narratives = db.getCollection('narratives');
          // narratives = db.getSiblingDB('narratives');
          // records = db.getSiblingDB('records')

          narratives.count()
//           users.active.findOne()

          //       records.requests.count()
          //     records.requests.findOne()

          // col = db.collection('narratives');

          //  var nodes = data.nodes;

//  for (var ldi = 0; ldi < nodes.length; ldi++) {
          //          var node = nodes[0];
          //         var readFilePath = __dirname + "/../data/narrative_summaries/" + node.narrativeFileName;
          //         console.log("readFilePath = ", readFilePath);
          //         var narrativeBuffer = fse.readFileSync(dataLocalFileNameAndPath);

          //      narrative = JSON.parse(narrativeBuffer);
// console.log("narrative = ", narrative);

          // Insert into Mongo
          mongo.insert({file: narrative});

          console.log("\n ", __filename, "line", __line, "; jsonNarrative = ", jsonNarrative);
          narratives.insert(jsonNarrative);

          db.close();
        });

        callback();
      },

      // save the local files to mongodb
      function (callback) {
        callback();
      }

    ],
    function (err) {
      if (err) {
        console.log("\n ", __filename, "line", __line, " Error: \n" + err);
      }
    }
  );
};

run();