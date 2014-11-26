// get-aqlist-xml.js

if(typeof define !== 'function') {
  var define = require('amdefine');
}
var async = require('async'),
  re = require('request-enhanced'),
  request = require('request'),
  fs = require('fs'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect'),
  parseString = require('xml2js')
    .parseString;


var setupData = require('./setupData.js');
var logger = require('./libs/logger.js');
var functionCount = 0;

var linenums = require('./linenums.js');

var getXMLFile = function () {
var fileNameToSaveTo = __dirname + "/../data/xml/AQList.xml";
  re.get("http://www.un.org/sc/committees/1267/AQList.xml", fileNameToSaveTo, function (error, filename) {
    if (error) {
      console.log("\n ", __filename, "line", __line, "; Error \n" + error);
    }
    console.log("\n ", __filename, "line", __line, "; Saved content to: \n", filename);
  });
}

module.exports = {
  getXMLFile: getXMLFile
};