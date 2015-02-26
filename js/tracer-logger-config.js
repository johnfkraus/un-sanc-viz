var fse = require('fs-extra');

var sysDate = new Date();
var sysDateString = sysDate.toDateString().replace(/ /g, '_');
var sysTimeString = sysDate.toTimeString().replace(/:/g, '-').substring(0, 8);

var generateFileNameAndPath = function () {
  var legalLogFileName = __dirname + '/../log/aq-list-viz-' + sysDateString + '-' + sysTimeString + '.log';
  console.log(__filename, 'line', __line, '; method: generateFileNameAndPath() legalLogFileName = ', legalLogFileName);
  return legalLogFileName.trim();
};

var logFileNameAndPath = __dirname + '/../log/log.log'; //logFileNameAndPath || generateFileNameAndPath();

var colors = require('colors');

var logger = require('tracer').colorConsole({
    transport: function (data) {
      console.log(data.output);
      try {
        var stream = fse.createWriteStream(logFileNameAndPath, { // }; // "./stream.log", {
          flags: "a",
          encoding: "utf8",
          mode: 0666
        }).write(data.output + "\n");
      } catch (err) {
        console.log(__filename, 'line', __line, '; Error: ', err); // method: generateFileNameAndPath() legalLogFileName = ', legalLogFileName);
      }
    }
  });








/*
 var logger = require('tracer').console({
 transport: function (data) {
 console.log(data.output);
 try {
 var stream = fse.createWriteStream(logFileNameAndPath, { // }; // "./stream.log", {
 flags: "a",
 encoding: "utf8",
 mode: 0666
 }).write(data.output + "\n");
 } catch (err) {
 console.log(__filename, 'line', __line, '; Error: ', err); // method: generateFileNameAndPath() legalLogFileName = ', legalLogFileName);
 }
 }
 });


 var logger = require('tracer').console({
 transport : function(data) {
 console.log(data.output);
 // fse.open('./log/file.log', 'a', 0666, function(e, id) {
 try {
 fse.open(logFileNameAndPath, 'a', 0666, function (e, id) {
 fse.write(id, data.output + "\n", null, 'utf8', function () {
 fse.close(id, function () {
 });
 });
 });
 } catch (e) {
 console.log(__filename, 'line', __line, '; Error: ', e); // method: generateFileNameAndPath() legalLogFileName = ', legalLogFileName);
 }
 }
 });
 */
module.exports = {
  logger: logger
};
