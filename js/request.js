var fs = require('fs');
require('console-stamp')(console, '[HH:MM:ss.l]');
var dateFormat = require('dateformat');
var now = new Date();
var request = require('request');
dateFormat.masks.hammerTime = 'yyyy-mm-dd-HHMMss';
var fileDateString = dateFormat(now, "hammerTime");

console.log("__dirname = ", __dirname);
// var file = __dirname + '/../data/test/AQList-2014-11-18.json';
// var file = "/home/codio/workspace/data/test/AQList-2014-11-18.json";
var file = "aqlist.json";
var filePath = "aqlist.json";
//var file = __dirname + '/../data/test/AQList-2014-11-18.json';

console.log("file = ", file);
var outputFileName = '/home/codio/workspace/data/test/AQ-' + fileDateString + '.json';
console.log("outputFileName = ", outputFileName);

//fs.readFile(filename, [options], callback)#
//filename String
// options Object
// encoding String | Null default = null
// flag String default = 'r'
//callback Function
// Asynchronously reads the entire contents of a file. Example:
/*
 try {
 var fd = fs.readFileSync(filePath,"r");
 var fr = fs.readSync(fd, buffer, 0, size, 0);
 fs.closeSync(fd);
 } catch (e) {
 console.log('Error:', e);
 }
 */
fs.readFileSync(file);
/*
 * , function (err, data) {
 if (err) throw err;
 console.log(data);
 });
 */
//The callback is passed two arguments (err, data), where data is the contents of the file.

// If no encoding is specified, then the raw buffer is returned.

// fs.readFileSync(filename, [options])#
// Synchronous version of fs.readFile. Returns the contents of the filename.

// If the encoding option is specified then this function returns a string. Otherwise it returns a buffer.

/*

 try {
 var fd = fs.openSync(filePath,"r");
 var fr = fs.readSync(fd, buffer, 0, size, 0);
 fs.closeSync(fd);
 } catch (e) {
 console.log('Error:', e);
 }
 */

fs.createReadStream("aqlist.json").pipe(fs.createWriteStream(outputFileName));
/*
 request
 .get(fs.readFileSync(file))
 .on('error', function(err) {
 console.log(err);
 })
 .pipe(fs.createWriteStream(outputFileName));
 */