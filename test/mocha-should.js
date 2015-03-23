// Chovy's Blog
// Web Development with Node.js, Javascript, and HTML5
// Testing a node.js express app with Mocha and Should.js
/*
I’ve been doing more Test Driven Development the past few months with my node.js application code base.

  For the User Interface I record Selenium tests using the Selenium IDE for Firefox. This has caught quite a lot of bugs as I run the Selenium test suite before every deploy as a means of acceptance testing.

  Here’s a simple unit test I wrote to get things started. I created a file in ./test/model.item.js and imported the modules and libraries I need (mongoose, User model and Item model). I’m using Mocha and Should.js for the testing language.
*/
//var cfg = require('../config')
var cfg = mongoose = require('mongoose')
  , User = require('../models/user')
  , Item = require('../models/item')
  , should = require('should')
  , fakeUser
  , fakeItem;

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
// var db = mongoose.connect(cfg.mongo.uri, cfg.mongo.db)

/*
In case there is a database error, we trap it — I had an issue where I was getting the following error when running my mocha tests:

Error: Trying to open unclosed connection.
…so trapping the error will fix the above promblem.
*/

mongoose.connection.on('error', function(err){
  console.log(err);
});
/*
I was a little worried I might actually delete data from the wrong database if I accidently ran my tests on development or production databases instead of my test database, so I forced a check for the NODE_ENV variable to be test in each unit test before any tests are executed:
*/

console.log('NODE_ENV: '+process.env.NODE_ENV);

if ( process.env.NODE_ENV !== 'test' ) {
  console.log("Woops, you want NODE_ENV=test before you try this again!");
  process.exit(1);
}
/*
Since this is a test run, I want to just drop whatever is in the database after I’m done with tests so we don’t have strange errors arise from pre-existing data:

  BE VERY CAREFUL AS YOU WILL LOOSE ALL DATA — You can read my previous article on backing up a mongodb first
*/

after(function(done){
  db.connection.db.dropDatabase(function(){
    db.connection.close(function(){
      done();
    });
  });
});

/*
You can put one ‘after()’ statement above all else that will run when all tests are finished.
Ok, now we are ready to write some mocha tests using the Should.js library. Let’s describe the first User model tests.
*/

describe('User', function(){

//  Basically, I am removing all users before each test, since we create a fakeUser in the first test (see beforeEach):

  beforeEach(function(done){
    //clear out db
    User.remove(done);

    fakeUser = {
      username    : 'Test1'
      , email     : 'test1@example.com'
      , password  : 'somepassword'
    };

    fakeItem = {
      name            : 'Test item'
      , description	: 'Test description'
    };
  });
//  After all tests, I will remove the User and the Item that were created previously. Note that each callback takes a ‘done’ function that can be called at the end of your test.

  after(function(done){
    //clear out db
    User.remove(function(err){
      Item.remove(done);
    });
  });
//  Here is a nested describe() unit test that will test the #save() function of the User model.

  describe('#save()', function(){
    var user
      , item;
    // you can use beforeEach in each nested describe
    beforeEach(function(done){
      user = new User(fakeUser);
      user.save(function(err, user){
        fakeItem.user = user;
        item = new Item(fakeItem);
        done();
      });
    });
  //  Here we use the Should.js library to describe and test what attributes should be in the unit test (this is the heart of the unit test).


    // you are testing for errors when checking for properties
    // no need for explicit save test
    it('should have required properties', function(done){
      item.save(function(err, item){
        // dont do this: if (err) throw err; - use a test
        should.not.exist(err);
        item.should.have.property('name', 'Test item');
        item.should.have.property('description', 'Test description');
        done();
      });
    });
  });
});

/* Now to tie things together and so all you have to do to run tests is type ‘make test’, we need to add the following Makefile to your root directory (be sure there is a ./test subdirectory):

REPORTER = dottest:
@NODE_ENV=test ./node_modules/.bin/mocha \
--reporter $(REPORTER) \

test-w:
@NODE_ENV=test ./node_modules/.bin/mocha \
--reporter $(REPORTER) \
--growl \    --watch

  .PHONY: test test-w
//…and finally, in package.json you can add the following line, so you can run ‘npm test’ to run your unit tests:


"scripts": {
  "test": "make test"
}
*/
