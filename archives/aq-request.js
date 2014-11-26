var fs = require('fs');
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

console.log("13 __dirname = " , __dirname);
// var file = __dirname + '/../data/test/AQList-2014-11-18.json';
 // var file = "/home/codio/workspace/data/test/AQList-2014-11-18.json";
 var file = "aqlist.json";
 var filePath = "aqlist.json";
//var file = __dirname + '/../data/test/AQList-2014-11-18.json';
var options = { flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};

console.log("24 file = ", file);
var outputFileName = '/home/codio/workspace/data/test/AQ-' + fileDateString + '.json';
console.log("26 outputFileName = ", outputFileName);

var aqFilePath = "http://www.un.org/sc/committees/1267/AQList.xml";

var re = require('request-enhanced');
re.get(aqFilePath, function(error, data){
  console.log('32 Fetched:', data);
});
// Don't want the result in memory and would rather pipe it to a file? No problem!

var xmlCollectedFileName = '/home/codio/workspace/data/xml/AQ-' + fileDateString + '.xml';

re.get(aqFilePath, xmlCollectedFileName, function(error, filename){
  console.log('37 Saved content to:', filename);
});



var newAqFile = request
  .get(aqFilePath)
  .on('error', function(err) {
    console.log("33 Error:", err);
  })
  .pipe(fs.createWriteStream(outputFileName+".txt"));

/*
request(aqFilePath, function (error, response) { // , body) {
  if (!error && response.statusCode == 200) {
    var fr = fs.readFileSync(response.toString(), options);
    console.log(fr); // Print the google web page.
  }
});
*/

console.log("46 newAqFile = ", newAqFile.toString().trunc(777));
fs.readFile(file, { encoding: 'utf8' }, function (err, data ) {
  console.log("49 data = ", data.toString().trunc(999));
});

// var aqfile = fs.readFileSync(file);
// console.log("aqfile = ", aqfile);
var buffer;

try {
  //  var fd = fs.openSync(filePath, options);
    var fr = fs.readFileSync(filePath, options);
  console.log("59 aq-request file read");
//    fs.closeSync(fd);
} catch (e) {
    console.log('61 Error:', e);
}

var modifiedFile = fr;
//fs.createReadStream("aqlist.json").pipe(fs.createWriteStream(outputFileName));

try {
  fs.writeFileSync(outputFileName, modifiedFile, options);
  console.log("70 file written");
} catch (e) {
    console.log('Error:', e);
}

//The synchronous version of fs.writeFile.

var aqFilePath = "http://www.un.org/sc/committees/1267/AQList.xml";
try {

  // console.log("31 aq-request file read from ", aqFilePath, "\n", fr);
//    fs.closeSync(fd);
} catch (e) {
    
}



/*

fs.readFile(filename, [options], callback)#
filename String
options Object
encoding String | Null default = null
flag String default = 'r'
callback Function
Asynchronously reads the entire contents of a file. Example:

fs.readFile('/etc/passwd', function (err, data) {
  if (err) throw err;
  console.log(data);
});
The callback is passed two arguments (err, data), where data is the contents of the file.

If no encoding is specified, then the raw buffer is returned.

fs.readFileSync(filename, [options])#
Synchronous version of fs.readFile. Returns the contents of the filename.

If the encoding option is specified then this function returns a string. Otherwise it returns a buffer.

fs.writeFile(filename, data, [options], callback)#





/*


options is an object with the following defaults:

{ flags: 'r',
  encoding: null,
  fd: null,
  mode: 0666,
  autoClose: true
}
options can include start and end values to read a range of bytes from the file instead of the entire file. Both start and end are inclusive and start at 0. The encoding can be 'utf8', 'ascii', or 'base64'.

If autoClose is false, then the file descriptor won't be closed, even if there's an error. It is your responsiblity to close it and make sure there's no file descriptor leak. If autoClose is set to true (default behavior), on error or end the file descriptor will be closed automatically.

An example to read the last 10 bytes of a file which is 100 bytes long:

fs.createReadStream('sample.txt', {start: 90, end: 99});
Class: fs.ReadStream#

fs.close(fd, callback)#
Asynchronous close(2). No arguments other than a possible exception are given to the completion callback.

fs.closeSync(fd)#



try {
    var fd = fs.createReadStream("aqlist.json");
    // .pipe(fs.createWriteStream(outputFileName));
            
    fs.closeSync(fd);
} catch (e) {
    console.log('Error:', e);
}
*/

// fs.createReadStream("aqlist.json").pipe(fs.createWriteStream(outputFileName));
/*
request
  .get(fs.readFileSync(file))
  .on('error', function(err) {
    console.log(err);
  })
  .pipe(fs.createWriteStream(outputFileName));
*/