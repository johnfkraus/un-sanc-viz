var Db = require('mongodb').Db,
  MongoClient = require('mongodb').MongoClient,
  Server = require('mongodb').Server,
  ReplSetServers = require('mongodb').ReplSetServers,
  ObjectID = require('mongodb').ObjectID,
  Binary = require('mongodb').Binary,
  GridStore = require('mongodb').GridStore,
  Grid = require('mongodb').Grid,
  Code = require('mongodb').Code,
  BSON = require('mongodb').pure().BSON,
  assert = require('assert');

var db = new Db('test', new Server('localhost', 27017));
// Establish connection to db
db.open(function(err, db) {
  // Get the collection
  var col = db.collection('batch_write_unordered_ops_legacy_0');
  // Initialize the unordered Batch
  var batch = col.initializeUnorderedBulkOp({useLegacyOps: true});

  // Add some operations to be executed in order
  batch.insert({a:1});
  batch.find({a:1}).updateOne({$set: {b:1}});
  batch.find({a:2}).upsert().updateOne({$set: {b:2}});
  batch.insert({a:3});
  batch.find({a:3}).remove({a:3});

  // Execute the operations
  batch.execute(function(err, result) {
    // Check state of result
    assert.equal(2, result.nInserted);
    assert.equal(1, result.nUpserted);
    assert.equal(1, result.nMatched);
    assert.ok(1 == result.nModified || result.nModified == null);
    assert.equal(1, result.nRemoved);

    var upserts = result.getUpsertedIds();
    assert.equal(1, upserts.length);
    assert.equal(2, upserts[0].index);
    assert.ok(upserts[0]._id != null);

    var upsert = result.getUpsertedIdAt(0);
    assert.equal(2, upsert.index);
    assert.ok(upsert._id != null);

    // Finish up test
    db.close();
  });
});