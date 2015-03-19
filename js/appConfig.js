// appConfig.js

// skip downloading 300+ narrative files and use locally stored files instead; for debugging
var useLocalListFiles = true;
var useLocalNarrativeFiles = true;
// do we want lots of console.log messages for debugging (if so, set consoleLog = true)
var consoleLog = false;
// var logger = require('tracer').colorConsole({level: 'info'});
var logger = require('./tracer-logger-config.js').logger;
// var logger = require('./libs/logger.js');

module.exports = {
  useLocalListFiles: useLocalListFiles,
  useLocalNarrativeFiles: useLocalNarrativeFiles,
  consoleLog: consoleLog,
  logger:logger

};

