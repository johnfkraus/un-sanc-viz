var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/aq-list';
// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
  // db.adminCommand('listDatabases')
  var col = db.collection('findAndModify');
  // Insert a single document
  col.insert([{a: 1}, {a: 2}, {a: 2}], function (err, r) {
    assert.equal(null, err);
    console.log("r.result.n = ", r.result.n);
    assert.equal(3, r.result.n);

    // console.log( db.collection('findAndModify').find());

    /*
     // Modify and return the modified document
     col.findOneAndUpdate({a:1}, {$set: {b: 1}}, {
     returnOriginal: false
     , sort: [[a,1]]
     , upsert: true
     }, function(err, doc) {
     assert.equal(null, err);
     assert.equal(1, r.length);

     // Remove and return a document
     col.findOneAndDelete({a:2}, function(err, r) {
     assert.equal(null, err);
     assert.ok(r.value.b == null);
     db.close();
     });
     });
     */

  });
  // col = db.collection('findAndModify');

  // Get first two documents that match the query
  col.find({a: 1}).limit(2).toArray(function (err, docs) {
    assert.equal(null, err);
    assert.equal(2, docs.length);
    var doc;
    for (var i = 0; i < docs.length; i++) {
      doc = docs[i];
      console.log("doc = ", doc);
    }
//    db.close();
  });

  //assert.equal(3, r.length);
});