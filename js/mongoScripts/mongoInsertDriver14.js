// http://mongodb.github.io/node-mongodb-native/1.4/markdown-docs/insert.html

/*
Insert
Records can be inserted to a collection with insert

  collection.insert(docs[[, options], callback])
Where

docs is a single document object or an array of documents
options is an options object.
  callback - callback function to run after the record is inserted.
  For example

*/


var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient
  , assert = require('assert');
// Grid = mongodb.Grid //use Grid via the native mongodb driver
// ;
var linenums = require('./../linenums.js');
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
var functionCount = 0;

var document = {name:"David", title:"About MongoDB"};
collection.insert(document, {w: 1}, function(err, records){
  console.log("Record added as "+records[0]._id);
});
If trying to insert a record with an existing _id value, then the operation yields in error.

  collection.insert({_id:1}, {w:1}, function(err, doc){
    // no error, inserted new document, with _id=1
    collection.insert({_id:1}, {w:1}, function(err, doc){
      // error occured since _id=1 already existed
    });
  });
Save
Shorthand for insert/update is save - if _id value set, the record is updated if it exists or inserted if it does not; if the _id value is not set, then the record is inserted as a new one.

  collection.save({_id:"abc", user:"David"},{w:1}, callback)
callback gets two parameters - an error object (if an error occured) and the record if it was inserted or 1 if the record was updated.

  Update
Updates can be done with update

  collection.update(criteria, update[[, options], callback]);
Where

criteria is a query object to find records that need to be updated (see Queries)
update is the replacement object
options is an options object (see below)
callback is the callback to be run after the records are updated. Has three parameters, the first is an error object (if error occured), the second is the count of records that were modified, the third is an object with the status of the operation.
  Update options
There are several option values that can be used with an update

multi - update all records that match the query object, default is false (only the first one found is updated)
upsert - if true and no records match the query, insert update as a new record
raw - driver returns updated document as bson binary Buffer, default:false
Replacement object
If the replacement object is a document, the matching documents will be replaced (except the _id values if no _id is set).

collection.update({_id:"123"}, {author:"Jessica", title:"Mongo facts"});
The example above will replace the document contents of id=123 with the replacement object.

  To update only selected fields, $set operator needs to be used. Following replacement object replaces author value but leaves everything else intact.

  collection.update({_id:"123"}, {$set: {author:"Jessica"}});
See MongoDB documentation for all possible operators.

  Find and Modify
To update and retrieve the contents for one single record you can use findAndModify.

  collection.findAndModify(criteria[, sort[, update[, options]]], callback)
Where

criteria is the query object to find the record
sort indicates the order of the matches if there’s more than one matching record. The first record on the result set will be used. See Queries->find->options->sort for the format.
  update is the replacement object
options define the behavior of the function
callback is the function to run after the update is done. Has two parameters - error object (if error occured) and the record that was updated.
  Options
Options object can be used for the following options:

  remove - if set to true (default is false), removes the record from the collection. Callback function still gets the object but it doesn’t exist in the collection any more.
  new - if set to true, callback function returns the modified record. Default is false (original record is returned)
upsert - if set to true and no record matched to the query, replacement object is inserted as a new record
Example
var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;

MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
  if(err) throw err;

  db.collection('test').findAndModify(
    {hello: 'world'}, // query
    [['_id','asc']],  // sort order
    {$set: {hi: 'there'}}, // replacement, replaces only the field "hi"
    {}, // options
    function(err, object) {
      if (err){
        console.warn(err.message);  // returns error if no matching object found
      }else{
        console.dir(object);
      }
    });
});
Contents
Inserting and updating
Insert
Save
Update
Update options
Replacement object
Find and Modify
Options
Example
Manual
MongoClient()
Db()
Collection()
Admin()
Cursor()
CursorStream()
Grid()
GridStore()
ReadStream()
BSON()
ObjectID()
Binary()
Code()
Double()
Long()
Timestamp()
MaxKey()
Symbol()
Home: MongoDB Node.JS Driver Manual Home
Contents: MongoDB Node.JS Driver Manual Contents
Index: MongoDB Node.JS Driver Manual Index
Search
Search this manual.

  Search the MongoDB wiki.

  MongoDB Wiki
Getting Started
Quickstart
Introduction
Downloads
Features
SQL to MongoDB Mapping
Developer Documentation
Connections
Databases
Collections
Documents
GridFS
Indexes
Querying
Aggregation
Optimization
Inserting
Updating
Removing
MapReduce
Administrative Documentation
Components
Journaling
Production Notes
Replication
Sharding
Monitoring and Diagnostics
Backups
Durability and Repair
Security and Authentication
Starting/Stopping MongoDB
GridFS Tools
DB Operations from the Shell
Architecture and Components
Windows
Troubleshooting
Community and Ecosystem
10gen
MongoDB Events
MongoDB Masters
Slides and Video
Cookbook
Hosting Center
MongoDB Monitoring Service (docs)
Administrative Interfaces
International Documentation
MongoDB Books
Drivers
JavaScript (wiki, docs)
Python (wiki, docs)
Ruby (wiki, docs)
PHP (wiki, docs)
Perl (wiki, docs)
Java (wiki, docs)
Scala (wiki, docs)
C# (wiki, docs)
C (wiki, docs)
C++ (wiki, docs)
Haskell (wiki, docs)
Erlang (wiki, docs)
| GitHubJiraMongoDB Node.JS Driver 1.4.29 documentation (index) »
© Copyright 2013, MongoDB Node.JS Team Created using Sphinx 1.3b2.
  The MongoDB Documentation Project uses GitHub. Fork the repository and submit pull requests to contribute.

  If you find any issues with the documentation feel free to open a Jira Case and we'll work to resolve it promptly.