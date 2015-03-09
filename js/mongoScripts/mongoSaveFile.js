var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient
  , assert = require('assert');

var linenums = require('./../linenums.js');
var format = require('util').format;

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
var consoleLog = false;

var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};
var data;
require('console-stamp')(console, '[HH:MM:ss.l]');
// var grid;
var urls;
var narrFileName = "NSQE00301E.shtml";
// var dataLocalFileNameAndPath = __dirname + "/../data/output/AQList-clean-docs.json";
// var narrativeLinksLocalFileNameAndPath = __dirname + "/../data/narrative_lists/narrative_links.json";
var narrativeBuffer;
// var jsonNarrative;
var narratives;
var narrative;
var functionCount = 0;

var run = function () {
  var url = 'mongodb://localhost:27017/aqlist';
  async.series([
      // open the narrative file
      function (callback) {
        console.log("\n ", __filename, "line", __line, "; function #1:", ++functionCount, "; ");
        try {
          narrativeBuffer = fse.readFileSync(__dirname + "/../../data/narrative_summaries/" + narrFileName);
        } catch (err) {
          console.log("\n ", __filename, "line", __line, "; Error: ", err);
        }
        narrative = {};
        narrative.content = narrativeBuffer.toString();
        narrative._id = narrFileName;
        try {
          console.log("\n ", __filename, "line", __line, "; JSON.stringify(narrative, null, \" \") =\n", JSON.stringify(narrative, null, " ").substring(0, 500), " [INTENTIONALLY TRUNCATED]");
          // console.log("\n ", __filename, "line", __line, "; narrative = ", narrative);
        } catch (err) {
          console.log("\n ", __filename, "line", __line, "; Error: ", err);
        }
        callback();
      },
      // upsert a narrative file
      function (callback) {
        console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");
        // Connection URL
        // var url = 'mongodb://localhost:27017/aqlist';
        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
          try {
            assert.equal(null, err);
            console.log(__filename, "line", __line, "; Connected correctly to server using url = ", url);
          } catch (err) {
            console.log("\n ", __filename, "line", __line, "; Error: err = ", err);
          }
          // Insert a single document
          try {
            console.log("\n ", __filename, "line", __line, " narrFileName = ", narrFileName);

            db.collection('narratives').findOneAndUpdate({_id: narrFileName}, {$set: {content: narrative.content}}, {upsert: true}, function (err, r) {
              assert.equal(null, err);
              // assert.equal(1, r.result.n);
              // console.log("\n ", __filename, "line", __line, " r.result.n = ", r.result.n);
              db.close();
            });
          }
          catch (err) {
            console.log("\n ", __filename, "line", __line, " Error: \n", err);
          }
        });
        callback();
      },
// count the documents
      function (callback) {

        MongoClient.connect(url, function (err, db) {
          assert.equal(null, err);
          console.log("Connected correctly to server");
          db.collection('narratives').find({}).toArray(function (err, docs) {
            assert.equal(err, null);
            // assert.equal(2, docs.length);
            console.log("docs.length = ", docs.length);
            console.log("Found the following records");
            console.dir(JSON.stringify(docs).substring(0, 400));
            db.close();
          });
        });

        callback();
      }
    ],
    function (err) {
      console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; ");
      if (err) {
        console.log("\n ", __filename, "line", __line, " Error: \n", err);
      }
    }
  );
};

run();