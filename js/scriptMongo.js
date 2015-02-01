
// Administration > Administration Tutorials > MongoDB Scripting > Write Scripts for the mongo Shell
// Write Scripts for the mongo Shell

// You can write scripts for the mongo shell in JavaScript that manipulate data in MongoDB or perform administrative operation. For more information about the mongo shell see MongoDB Scripting, and see the Running .js files via a mongo shell Instance on the Server section for more information about using these mongo script.

//  This tutorial provides an introduction to writing JavaScript that uses the mongo shell to access MongoDB.

//  Opening New Connections

// From the mongo shell or from a JavaScript file, you can instantiate database connections using the Mongo() constructor:

// new Mongo()
// new Mongo(<host>)
// new Mongo(<host:port>)
var Mongo = require('mongodb'); //.MongoClient
new Mongo('localhost:27017');
/*
Consider the following example that instantiates a new connection to the MongoDB instance running on localhost on the default port and sets the global db variable to myDatabase using the getDB() method:

  conn = new Mongo();
db = conn.getDB("myDatabase");
Additionally, you can use the connect() method to connect to the MongoDB instance. The following example connects to the MongoDB instance that is running on localhost with the non-default port 27020 and set the global db variable:

  db = connect("localhost:27020/myDatabase");
Differences Between Interactive and Scripted mongo

When writing scripts for the mongo shell, consider the following:

  To set the db global variable, use the getDB() method or the connect() method. You can assign the database reference to a variable other than db.
  Inside the script, call db.getLastError() explicitly to wait for the result of write operations.
  You cannot use any shell helper (e.g. use <dbname>, show dbs, etc.) inside the JavaScript file because they are not valid JavaScript.
  The following table maps the most common mongo shell helpers to their JavaScript equivalents.
  Shell Helpers	JavaScript Equivalents
show dbs, show databases
db.adminCommand('listDatabases')
use <db>
db = db.getSiblingDB('<db>')
show collections
db.getCollectionNames()
show users
db.system.users.find()
show log <logname>
db.adminCommand({ 'getLog' : '<logname>' })
show logs
db.adminCommand({ 'getLog' : '*' })
it
cursor = db.collection.find()
if ( cursor.hasNext() ){
  cursor.next();
}
In interactive mode, mongo prints the results of operations including the content of all cursors. In scripts, either use the JavaScript print() function or the mongo specific printjson() function which returns formatted JSON.
  EXAMPLE
To print all items in a result cursor in mongo shell scripts, use the following idiom:

  cursor = db.collection.find();
while ( cursor.hasNext() ) {
  printjson( cursor.next() );
}
Scripting

From the system prompt, use mongo to evaluate JavaScript.

--eval option
Use the --eval option to mongo to pass the shell a JavaScript fragment, as in the following:

  mongo test --eval "printjson(db.getCollectionNames())"
This returns the output of db.getCollectionNames() using the mongo shell connected to the mongod or mongos instance running on port 27017 on the localhost interface.

  Execute a JavaScript file
You can specify a .js file to the mongo shell, and mongo will execute the JavaScript directly. Consider the following example:

  mongo localhost:27017/test myjsfile.js
This operation executes the myjsfile.js script in a mongo shell that connects to the test database on the mongod instance accessible via the localhost interface on port 27017.

Alternately, you can specify the mongodb connection parameters inside of the javascript file using the Mongo() constructor. See Opening New Connections for more information.

  You can execute a .js file from within the mongo shell, using the load() function, as in the following:

  load("myjstest.js")
This function loads and executes the myjstest.js file.

  The load() method accepts relative and absolute paths. If the current working directory of the mongo shell is /data/db, and the myjstest.js resides in the /data/db/scripts directory, then the following calls within the mongo shell would be equivalent:

  load("scripts/myjstest.js")
load("/data/db/scripts/myjstest.js")
NOTE
There is no search path for the load() function. If the desired script is not in the current working directory or the full specified path, mongo will not be able to access the file.
←  	Data Types in the mongo Shell	Getting Started with the mongo Shell	 →
Copyright © 2011-2015 MongoDB, Inc. Licensed under Creative Commons. MongoDB, Mongo, and the leaf logo are registered trademarks of MongoDB, Inc.

  ON THIS PAGE
Opening New Connections
Differences Between Interactive and Scripted mongo
Scripting
--eval option
Execute a JavaScript file
Report a Problem    

  */