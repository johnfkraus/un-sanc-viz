// appConfig.js

// skip downloading 300+ narrative files and use locally stored files instead; for debugging
var useLocalListFiles = true;
var useLocalNarrativeFiles = true;

// RUN CONFIGURATION
// skip downloading 300+ narrative files and use locally stored files instead; for debugging
// do we want lots of console.log messages for debugging (if so, set consoleLog = true)
// do we want lots of console.log messages for debugging (if so, set consoleLog = true)
var consoleLog = false;
// var logger = require('tracer').colorConsole({level: 'info'});
var logger = require('./tracer-logger-config.js').logger;
// var logger = require('./libs/logger.js');

var getCommitteesArray = function () {
  return ['751', '1267', '1518', '1521', '1533', '1572', '1591', '1718', '1737', '1970', '1988', '2048', '2127', '2140', 'consolidated'];
};

var getCommitteesWithNoSeparateEntitiesList = function () {
  return ['1572', '1636', '1988', '2048', '2127', '2140'];
};

var getCommitteesWithNoSeparateIndividualsList = function () {
  return ['1636', '1988'];
};

var getCommitteesWithSingleCombinedEntitiesAndIndividualsList = function () {
  return ['1988'];
};

module.exports = {
  consoleLog: consoleLog,
  getCommitteesArray: getCommitteesArray,
  getCommitteesWithNoSeparateEntitiesList: getCommitteesWithNoSeparateEntitiesList,
  getCommitteesWithNoSeparateIndividualsList: getCommitteesWithNoSeparateIndividualsList,
  getCommitteesWithSingleCombinedEntitiesAndIndividualsList: getCommitteesWithSingleCombinedEntitiesAndIndividualsList,
  logger: logger,
  useLocalListFiles: useLocalListFiles,
  useLocalNarrativeFiles: useLocalNarrativeFiles
};

