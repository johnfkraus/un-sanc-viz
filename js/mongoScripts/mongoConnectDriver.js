// http://mongodb.github.io/node-mongodb-native/api-generated/mongoclient.html

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/myproject2';
// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
  db.collection('mongoclient_test').update({a: 1}, {b: 1}, {upsert: true}, function (err, r) {
    assert.equal(null, err);
    assert.equal(1, r.result.n);
    db.close();
  });
});
MongoClient.connect(url, function (err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  // var findDocuments = function (db, function (err, r) {
  //   assert.equal(null, err);
  // assert.equal(1, r.result.n);
  db.collection('mongoclient_test').find({}).toArray(function (err, docs) {
    assert.equal(err, null);
    // assert.equal(2, docs.length);
    console.log("docs.length = ", docs.length);
    console.log("Found the following records");
    console.dir(docs);
    db.close();

  });
});

/*
 MongoClient.connect(url, function (err, db) {
 assert.equal(null, err);
 console.log("Connected correctly to server");

 var findDocuments = function (db, callback) {
 // Get the documents collection
 var collection = db.collection('mongoclient_test');
 // Find some documents
 collection.find({}).toArray(function (err, docs) {
 assert.equal(err, null);
 assert.equal(2, docs.length);
 console.log("Found the following records");
 console.dir(docs);
 callback(docs);
 });
 };

 findDocuments(db);
 db.close();
 });



 */