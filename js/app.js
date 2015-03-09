// app.js
//=============
var linenums = require('./linenums.js');
// CONFIG settings:
var consoleLog = false;
var logger = require('tracer').colorConsole({level:'info'});
// var logger = require('./tracer-logger-config.js');
// var logger = require('./libs/logger.js');

var utilities_aq_viz = require('./utilities_aq_viz');
var rotate = require('log-rotate');
// var logger = require('./tracer-logger-config.js').logger;
var parse2Lists = require('./parse2Lists.js');

if (typeof define !== 'function') {
  var define = require('amdefine');
}
var async = require('async'),
  re = require('request-enhanced'),
  request = require('request'),
  fs = require('fs'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect');
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

var runApp = function () {
  if (consoleLog) {
    logger.debug('\n ', __filename, 'line', __line, '; running ', __filename, '; ', new Date());
  }
  async.series([

      function (callback) {
        if (consoleLog) {
          logger.debug('\n ', __filename, __line, '; Phase #:', ++functionCount, '; collect.convertXMLToJson)_');
        }
        // collect.collect();
        callback();
      },

      function (callback) {
        if (consoleLog) {
          logger.debug('\n ', __filename, __line, '; Phase #:', ++functionCount, '; collect.convertXMLToJson)_');
        }
        parse2Lists.parse2Lists();
        callback();
      },

      // list files in /data/output
      function (callback) {
        if (consoleLog) {
          logger.debug(__filename, __line, '; Phase 6#:', ++functionCount, '; filewalker.filewalker()');
        }
        var fwPath = './data/output';
        filewalker.fwalker(fwPath);
        callback();
      },

      // rotate log file
      function (callback) {
        var logFileNameAndPath = __dirname + '/../log/consolidated.log';
        // utilities_aq_viz.rotateLogFile(logFileNameAndPath);

        /*
         rotate(logFileNameAndPath, {count: 11}, function (err) {
         if (err) {
         logger.error('\n ', __filename, __line, '; Error: ', err);
         }
         // ls ./ => test.log test.log.0 test.log.1
         });
         if (consoleLog) {
         logger.debug('\n ', __filename, __line, '; Phase #:', ++functionCount, '; logFileNameAndPath = ', logFileNameAndPath);
         }

         */
        callback();
      }

    ],
    function (err) { //This function gets called after the two tasks have called their 'task callbacks'
      if (err) logger.error(__filename, __line, '; Error: ', err);
    }
  );
};


var parse2 = function () {
  if (consoleLog) {
    logger.debug('\n ', __filename, 'line', __line, '; running ', __filename, '; ', new Date());
  }
  async.series([
      function (callback) {
        if (consoleLog) {
          logger.debug('\n ', __filename, __line, '; Phase #:', ++functionCount, '; collect.convertXMLToJson)_');
        }
        // collect.collect();
        callback();
      },

      function (callback) {
        if (consoleLog) {
          logger.debug('\n ', __filename, __line, '; Phase #:', ++functionCount, '; collect.convertXMLToJson)_');
        }
        parse2Lists.parse2Lists(); //collect.collect();
        callback();
      },

      // list files in /data
      function (callback) {
        var fwPath = './data/committees/consolidated';

        if (consoleLog) {
          logger.debug(__filename, __line, '; Phase #:', ++functionCount, '; filewalker.filewalker(fwPath), fwPath = ', fwPath);
        }
        filewalker.fwalker(fwPath);
        callback();
      },

      function (callback) {
        var logFileNameAndPath = __dirname + '/../log/consolidated.log';
      //  utilities_aq_viz.rotateLogFile(logFileNameAndPath);
        callback();
      }
    ],
    function (err) { //This function gets called after the two tasks have called their 'task callbacks'
      if (err) logger.error(__filename, __line, '; Error: ', err);
    }
  );
};


runApp();
// parse2();

module.exports = {
  logger: logger,
  runApp: runApp,
  parse2: parse2
};
