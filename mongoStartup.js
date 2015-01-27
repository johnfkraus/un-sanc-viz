// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/aq-list", function (err, db) {
  if (!err) {
    console.log("We are connected");
  }

  var collection = db.collection('testData');

  /*
   for (var i = 31; i <= 75; i++) {
   collection.insert( { x : i } )
   }
   */
  var doc1 = {'hello': 'doc1'};
  var doc2 = {'hello': 'doc2'};
  var lotsOfDocs = [{'hello': 'doc3'}, {'hello': 'doc4'}];
  collection.insert(doc1);

  collection.insert(doc2, {w: 1}, function (err, result) {
  });

  collection.insert(lotsOfDocs, {w: 1}, function (err, result) {
  });

  /*
   db.collection('test', function(err, collection) {});
   db.collection('test', {w:1}, function(err, collection) {});
   db.createCollection('test', function(err, collection) {});
   db.createCollection('test', {w:1}, function(err, collection) {});
   */
});



