// appConfig.js

// skip downloading 300+ narrative files and use locally stored files instead; for debugging
var useLocalListFiles = false;
var useLocalNarrativeFiles = false;

var committeesArray2 = [
  {'id': '751', 'run': true, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true},
  {'id': '1267', 'run': false, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true},
  {'id': '1518', 'run': false, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true},
  {'id': '1521', 'run': false, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true},
  {'id': '1533', 'run': false, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true},
  {'id': '1572', 'run': false, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true},
  {'id': '1591', 'run': false, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true},
  {'id': '1718', 'run': false, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true},
  {'id': '1737', 'run': false, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true},
  {'id': '1970', 'run': false, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true},
  {'id': '1988', 'run': false, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true},
  {'id': '2048', 'run': false, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true},
  {'id': '2127', 'run': false, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true},
  {'id': '2140', 'run': false, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true},
  {'id': 'consolidated', 'run': false, 'useLocalNarrativeFiles': true, 'useLocalListFiles': true}];

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

var getCommitteesArray2 = function () {
  return committeesArray2;
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

var run = function () {
  var ca = getCommitteesArray2();
  ca.forEach(function (comte) {
    console.log(comte);
    if (comte.run === true) {
      console.log(comte.id);
    }
  })
};
// run();

module.exports = {
  consoleLog: consoleLog,
  getCommitteesArray: getCommitteesArray,
  getCommitteesArray2: getCommitteesArray2,
  getCommitteesWithNoSeparateEntitiesList: getCommitteesWithNoSeparateEntitiesList,
  getCommitteesWithNoSeparateIndividualsList: getCommitteesWithNoSeparateIndividualsList,
  getCommitteesWithSingleCombinedEntitiesAndIndividualsList: getCommitteesWithSingleCombinedEntitiesAndIndividualsList,
  logger: logger,
  useLocalListFiles: useLocalListFiles,
  useLocalNarrativeFiles: useLocalNarrativeFiles
};

