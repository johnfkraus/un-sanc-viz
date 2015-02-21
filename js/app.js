// app-test.js
//=============
var linenums = require('./linenums.js');
var consoleLog = false;
var utilities_aq_viz = require('./utilities_aq_viz');
var logger = require('./tracer-logger-config.js').logger;
//var logger = require('tracer').colorConsole({level:'info'});
// var logger = require('./tracer-logger-config.js');
// var logger = require('./libs/logger.js');

if (typeof define !== 'function') {
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

var collect = require('./collect.js');
var filewalker = require('./filewalker.js');

var functionCount = 0;
var __filename = __filename || {};
var __line = __line || {};

var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};

var runAppTest = function () {
  if (consoleLog) {
    logger.debug('\n ', __filename, 'line', __line, '; running ', __filename, '; ', new Date());
  }

  async.series([
      // test logging
     /*
      function (callback) {
        // if (consoleLog) {
        logger.log('hello?');
        logger.debug('hello?');
        logger.info('hello world!');
        logger.warn('carefule there, world!');
        logger.error('WHOA WHOA WHOA world?!');
        callback();
      },
*/
      function (callback) {
        if (consoleLog) {
          logger.debug('\n ', __filename, __line, '; Phase #:', ++functionCount, '; collect.convertXMLToJson)_');
        }
        collect.collect();
        callback();
      },

      // list files in /data/output
      function (callback) {
        if (consoleLog) {
          logger.debug( __filename, __line, '; Phase 6#:', ++functionCount, '; filewalker.filewalker()');
        }
        var fwPath = './data/output';
        filewalker.filewalker(fwPath);
        callback();
      }
    ],
    function (err) { //This function gets called after the two tasks have called their 'task callbacks'
      if (err) logger.error(__filename, __line, '; Error: ', err);
    }
  );
};
runAppTest();