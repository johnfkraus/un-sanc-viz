// test.js
if(typeof define !== 'function') {
  var define = require('amdefine');
}
var async = require('async'),
  re = require('request-enhanced'),
  request = require('request'),
  fs = require('fs-extra'),
  util = require('util'),
//   httpRequest = require('http-request'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect'),
  parseString = require('xml2js')
    .parseString;

//var collect = require('./collect.js');
// var setupData = require('./setupData.js');
// var logger = require('./libs/logger.js');
// var functionCount = 0;
var removefile = require('./removefile.js');

// collect.httpRequestXMLFile();
// collect.convertXMLToJson();

removefile.removeAFile();

