var iterators = require('async-iterators');

var createExampleIterator = function() {
  var i = 0;
  return {
    next: function(cb) {
      i++;
      if (i == 100) return cb(null);
      cb(null, i);
    }
  }
};

var myIterator = createExampleIterator();

// wrap myIterator with a map iterator that doubles all results
var doublingIterator = iterators.map(myIterator, function(err, each) {
  return each * 2;
});

// pipe the iterator to an array
iterators.toArray(doublingIterator, function(err, res) {
  console.log(res);
});

/*
##Documentation ###Iterator Sources

fromArray
fromReadableStream





var a={a:1,b:2,c:3};
// var it=Iterator(a);

function iterate(){
  try {
    console.log(it.next());
    setTimeout(iterate,1000);
  }catch (err)  { // if err instanceof StopIteration) {
    console.log("End of record.\n");
  }// catch (err) {
  //  console.log("Unknown error: " + err.description + "\n");
 // }

}

iterate();

/*
is there something like this in node.js ?

  Right now i'm using:

function Iterator(o){
  /*var k=[];
   for(var i in o){
   k.push(i);
   }*/


/*
  var k=Object.keys(o);
  return {
    next:function(){
      return k.shift();
    }
  };
}
but that produces a lot of overhead by storing all the object keys in k.

  javascript node.js


  **/