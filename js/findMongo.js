var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/aq-list';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  var col = db.collection('find');
  // Insert a single document
  col.insertMany([{a:1}, {a:1}, {a:1}], function(err, r) {
    assert.equal(null, err);
    assert.equal(3, r.insertedCount);

    // Get first two documents that match the query
    col.find({a:1}).limit(2).toArray(function(err, docs) {
      assert.equal(null, err);
      assert.equal(2, docs.length);
      var doc;
      for (var i = 0; i < docs.length; i++) {
        doc = docs[i];
        console.log("doc = ", doc);
      }
      db.close();
    });
  });
});