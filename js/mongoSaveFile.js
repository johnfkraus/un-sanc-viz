var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient
  , assert = require('assert');
  // Grid = mongodb.Grid //use Grid via the native mongodb driver
  // ;
var linenums = require('./linenums.js');
//var linenums = require('./linenums.js');
// var __line = __line || {};
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

var consoleLog = true;

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
var run = function () {

  async.series([
      function (callback) {
        try {
          // var narrFileName = "NSQE00301E.shtml";
          narrativeBuffer = fse.readFileSync(__dirname + "/../data/narrative_summaries/" + narrFileName);
          // console.log("\n ", __filename, "line", __line, "; narrativeBuffer = ", narrativeBuffer);
        } catch (err) {
          console.log("\n ", __filename, "line", __line, "; Error: ", err);
        }
        narrative = {};
        narrative.content = narrativeBuffer.toString();
        narrative._id = narrFileName;

        //  narrative = JSON.parse(narrativeBuffer);
        try {
          // var narr = JSON.stringify(narrative, null, " ");
          console.log("\n ", __filename, "line", __line, "; JSON.stringify(narrative, null, \" \") =\n", JSON.stringify(narrative, null, " ").substring(0, 500), " [INTENTIONALLY TRUNCATED]");
          // console.log("\n ", __filename, "line", __line, "; narrative = ", narrative);
        } catch (err) {
          console.log("\n ", __filename, "line", __line, "; Error: ", err);
        }

        callback();
      },
      function (callback) {

        MongoClient.connect('mongodb://127.0.0.1:27017/aq-list', function (err, db) {
          if (err) throw err;

          var collection = db.collection('test_insert');
          collection.insert({a: 2}, function (err, r) {
            if (err) throw err;
            console.log(format("\n ", __filename, "line", __line, "; r = ", r));
            collection.count(function (err, count) {
              console.log(format("\n ", __filename, "line", __line, "; collection.namespace = ", collection.namespace, "; count = ", count));
            });

            // Locate all the entries using find
            collection.find().toArray(function (err, results) {
              console.dir(__filename, "line", __line, "; results = ", results);
              // Let's close the db
              db.close();
            });
          });
        });

        callback();
      },
      function (callback) {
        // Connection URL
        var url = 'mongodb://localhost:27017/aq-list';
        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
          try {
            assert.equal(null, err);
            console.log(__filename, "line", __line, "; Connected correctly to server.");
          } catch (err) {
            console.log("\n ", __filename, "line", __line, "; docs = ", docs);
          }
          // Insert a single document
          var col;
          try {
            col = db.collection('narratives');
            console.log("\n ", __filename, "line", __line, " col.namespace = ", col.namespace);
          }
          catch (err) {
            console.log("\n ", __filename, "line", __line, " Error: \n", err);
          }
          try {
            //      db.collection('narratives').insert({a: 1},{
            //  {upsert: true}, function (err, r) {
//              db.collection('narratives').update(
            col.update(narrative,
              {upsert: true});

//              {_id: narrFileName},
            //             {content: narrative},
            //            {upsert: true});

            console.log("\n ", __filename, "line", __line, "Collection updated.");

          }
          catch (err) {
            console.log("\n ", __filename, "line", __line, " Error: \n", err);
          }
          db.close();
        });

        callback();
      },
      function (callback) {
        // Connection URL
        var url = 'mongodb://localhost:27017/aq-list';
        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
          try {
            assert.equal(null, err);
            console.log(__filename, "line", __line, "; Connected correctly to server.");
          } catch (err) {
            console.log("\n ", __filename, "line", __line, "; docs = ", docs.toString().substring(0, 200), " [INTENTIONALLY TRUNCATED]");
          }
          // Insert a single document
          var col;
          try {
            col = db.collection('narratives');
            console.log("\n ", __filename, "line", __line, " col.namespace = ", col.namespace);
          }
          catch (err) {
            console.log("\n ", __filename, "line", __line, " Error: \n", err);
          }
          try {

            col.find().toArray(function (err, docs) {
              try {
                assert.equal(null, err);
              } catch (err) {
                console.log("\n ", __filename, "line", __line, " Error: \n", err);
              }
              console.log("\n ", __filename, "line", __line, "retrieved records:");
              console.log("\n ", __filename, "line", __line, "; docs.length = ", docs.length);
              console.log("\n ", __filename, "line", __line, "; docs = ", JSON.stringify(docs, null, " ").substring(0, 600), " [INTENTIONALLY TRUNCATED]");
              try {
            db.close();
              }
              catch (err) {
                console.log("\n ", __filename, "line", __line, " Error: \n", err);
              }
              //db.close();
            });
            // console.log("\n ", __filename, "line", __line, " col.namespace = ", col.namespace);
            // console.log("\n ", __filename, "line", __line, " col.getName() = ", col.getName());
          }
          catch (err) {
            console.log("\n ", __filename, "line", __line, " Error: \n", err);
          }


        });
        callback();
      },
      function (callback) {

        MongoClient.connect('mongodb://127.0.0.1:27017/aq-list', function (err, db) {
          if (err) throw err;

          var collection = db.collection('narratives');
           //collection.insert({a: 2}, function (err, docs) {

            //collection.count(function (err, count) {
             // console.log(format("\n ", __filename, "line", __line, "; count = %s", count));
            //});

            // Locate all the entries using find
            collection.find().toArray(function (err, narratives) {
              if (err) throw err;
              console.dir(__filename, "line", __line, "; narratives.length = ", narratives.length);
              // Let's close the db
              db.close();
            });
          // });
        });

        callback();
      }
    ],
    function (err) {
      if (err) {
        console.log("\n ", __filename, "line", __line, " Error: \n", err);
      }
    }
  );
};

run();