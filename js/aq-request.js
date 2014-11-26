// collect AQList.xml



var parseString = require('xml2js').parseString;
var re = require('request-enhanced');
var async = require('async');
var fs = require('fs');
var util = require('util');
require('console-stamp')(console, '[HH:MM:ss.l]');
var dateFormat = require('dateformat');
var now = new Date();
var request = require('request');
dateFormat.masks.hammerTime = 'yyyy-mm-dd-HHMMss';
var fileDateString = dateFormat(now, "hammerTime");
String.prototype.trunc = String.prototype.trunc ||
  function(n) {
    return this.length > n ? this.substr(0, n - 1) + '&hellip;' : this;
};
Object.defineProperty(global, '__stack', {
  get: function() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) {
      return stack;
    };
    var err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line', {
  get: function() {
    return __stack[1].getLineNumber();
  }
});

console.log("37 __line = \n", __line); //, arguments.callee.caller);
console.log("38 __dirname = \n", __dirname);
// var file = __dirname + '../data/test/AQList-2014-11-18.json';
// var file = "/home/codio/workspace/data/test/AQList-2014-11-18.json";
// var file = "aqlist.json";
var filePath = "aqlist.json";
//var file = __dirname + '/../data/test/AQList-2014-11-18.json';
var options = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};

var outputFileName = '/home/codio/workspace/data/xml/AQ-' + fileDateString + '.xml';
console.log("52 outputFileName = \n", outputFileName);

var aqFilePath = "http://www.un.org/sc/committees/1267/AQList.xml";
var aqListXML = "file coming soon!";


async.series([
  function() {
  re.get("http://www.un.org/sc/committees/1267/AQList.xml", xmlStandardFileName, function(error, filename) {
  console.log('83 Saved content to: \n', filename);
});
  },
  
  function(){  },
  function(){  },
  
    function(){  },
    function(){  }
]);






var xmlData = re.get("http://www.un.org/sc/committees/1267/AQList.xml", function(error, data) {
  if(error) {
    console.log("59 error!!! \n" + error);
  }

  // aqListXML = "some data here?" + data.toString();
  console.log('64 Fetched from ', aqFilePath, '\n and saved to data, data.toString() = \n', data.toString()
    .trunc(999));

  parseString(data.toString(), {async: 'true', attrNameProcessors: 'nameToUpperCase'}, 
              function(err, result) {
    console.dir("76 xmlToJson = \n", result);
  });

});



var xmlToJson = function(data) {
  // var xml = "<root>Hello xml2js!</root>";
  parseString(data, {async: 'true', attrNameProcessors: 'nameToUpperCase'}, function(err, result) {
    console.dir("76 xmlToJson = \n", result);
  });

}

// Don't want the result in memory and would rather pipe it to a file? No problem!

var xmlCollectedFileName = '/home/codio/workspace/data/xml/AQ-' + fileDateString + '.xml';

xmlStandardFileName = '/home/codio/workspace/data/xml/AQList.xml';

re.get("http://www.un.org/sc/committees/1267/AQList.xml", xmlStandardFileName, function(error, filename) {
  console.log('83 Saved content to: \n', filename);
});

request
  .get(aqFilePath)
  .on('error', function(err) {
    console.log("94 Error: ", err);
  })
  .pipe(fs.createWriteStream(outputFileName));

request
  .get(aqFilePath)
  .on('error', function(err) {
    console.log("101 Error: ", err);
  })
  .pipe(fs.createWriteStream("/home/codio/workspace/data/xml/AQList.xml"));

xmlStandardFileName = "/home/codio/workspace/data/xml/AQList.xml";

fs.readFileSync("/home/codio/workspace/data/xml/AQList.xml", options, function(err, data) {
  console.log("102 data = \n", data.toString()
    .trunc(999));
  console.log("120 data.inspect = \n", data.inspect);
});

try {
  var fr = fs.readFileSync(/home/codio/workspace/data/xml/AQList.xml, options);
  console.log("127 aq-request file read = \n", fr.toString().trunc(888) );
} catch(e) {
  console.log('129 Error: ', e);
}

var modifiedFile = fr;
//fs.createReadStream("aqlist.json").pipe(fs.createWriteStream(outputFileName));

try {
  fs.writeFileSync(outputFileName, modifiedFile, options);
  console.log("125 file written");
} catch(e) {
  console.log('127 Error: ', e);
}

//The synchronous version of fs.writeFile.

var aqFilePath = "http://www.un.org/sc/committees/1267/AQList.xml";
try {
  // console.log("31 aq-request file read from ", aqFilePath, "\n", fr);
  //    fs.closeSync(fd);
} catch(e) {

}