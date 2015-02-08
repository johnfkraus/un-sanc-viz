var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient
  , assert = require('assert');

var linenums = require('./linenums.js');
var format = require('util').format;

var utilities_aq_viz = require('./utilities_aq_viz.js');

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
var urls;
var narrativeBuffer;
var narratives;
var narrative;
var functionCount = 0;
var mongodbUrl = 'mongodb://localhost:27017/aqlist';

var mongodbUpsert = function (narrFileName) {
  var url = 'mongodb://localhost:27017/aqlist';
  async.series([
      // open the narrative file
      function (callback) {
        console.log('\n ', __filename, 'line', __line, '; function #1:', ++functionCount, '; ');
        try {
          narrativeBuffer = fse.readFileSync(__dirname + '/../data/narrative_summaries/' + narrFileName);
        } catch (err) {
          console.log('\n ', __filename, 'line', __line, '; Error: ', err);
        }
        narrative = {};
        narrative._id = narrFileName;
        narrative.content = utilities_aq_viz.trimNarrative(utilities_aq_viz.forceUnicodeEncoding(narrativeBuffer.toString()));
        try {
          console.log('\n ', __filename, 'line', __line, '; JSON.stringify(narrative, null, \' \') =\n', JSON.stringify(narrative, null, ' ').substring(0, 500), ' [INTENTIONALLY TRUNCATED]');
        } catch (err) {
          console.log('\n ', __filename, 'line', __line, '; Error: ', err);
        }
        callback();
      },
      // upsert a narrative file
      function (callback) {
        console.log('\n ', __filename, 'line', __line, '; function #2:', ++functionCount, '; ');
        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
          try {
            assert.equal(null, err);
            console.log(__filename, 'line', __line, '; Connected correctly to server using url = ', url);
          } catch (err) {
            console.log('\n ', __filename, 'line', __line, '; Error: err = ', err, '; narrFileName = ', narrFileName);
          }
          // Insert a document
          try {
            console.log('\n ', __filename, 'line', __line, ' narrFileName = ', narrFileName);
            db.collection('narratives').findOneAndUpdate({_id: narrFileName}, {$set: {content: narrative.content}}, {upsert: true}, function (err, r) {
              assert.equal(null, err);
              // assert.equal(1, r.result.n);
              // console.log('\n ', __filename, 'line', __line, ' r.result.n = ', r.result.n);
              db.close();
            });
          }
          catch (err) {
            console.log('\n ', __filename, 'line', __line, ' Error: \n', err, '; narrFileName = ', narrFileName);
          }
        });
        callback();
      }
// count the documents
/*      function (callback) {

        MongoClient.connect(url, function (err, db) {
          assert.equal(null, err);
          console.log('Connected correctly to server');
          db.collection('narratives').find({}).toArray(function (err, docs) {
            assert.equal(err, null);
            // assert.equal(2, docs.length);
            console.log('docs.length = ', docs.length);
            console.log('Found the following records');
            console.dir(JSON.stringify(docs).substring(0,400));
            db.close();
          });
        });
        callback();
      }
  */
    ],
    function (err) {
      console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; ');
      if (err) {
        console.log('\n ', __filename, 'line', __line, ' Error: \n', err);
      }
    }
  );
};

module.exports = {
  mongoUpsert: mongodbUpsert
};