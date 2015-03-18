// committees.js
//==========================

var appConfig = require('./appConfig.js');
var utilities_aq_viz = require('./utilities_aq_viz.js');
// RUN CONFIGURATION
// skip downloading 300+ narrative files and use locally stored files instead; for debugging
// do we want lots of console.log messages for debugging (if so, set consoleLog = true)
var consoleLog = appConfig.consoleLog;

var logger = appConfig.logger;
var linenums = require('./linenums.js');
var counter = 0;
if (typeof define !== 'function') {
  var define = require('amdefine');
}
require('console-stamp')(console, '[HH:MM:ss.l]');

var dataPath;

var consolidatedXmlListUrl;
var individualsLocalOutputFileNameAndPath;
var entitiesLocalOutputFileNameAndPath;
var narrativeUrlsArrayLocalFileNameAndPath;

var writeJsonOutputDebuggingDirectory;
var individualsHtmlLocalOutputFileNameAndPath;
var entitiesHtmlLocalOutputFileNameAndPath;
var narrativeFilesUrlPath;
var dataJsonLocalOutputFileNameAndPath;
var individualsListUrl;
var entitiesListUrl;
var committee;
var logFileNameAndPath;
var readWriteLocalNarrativesFilePath;
var individualsJsonLocalOutputFileNameAndPath;
var entitiesJsonLocalOutputFileNameAndPath;
var dotFileLocalOutputFileNameAndPath;
var committeeArray = ['751', '1267', '1518', '1521', '1533', '1572', '1591', '1718', '1737', '1970', '1988', '2048', '2127', 'consolidated'];
var committeeShortDescription;
var committeesJson;
var committeeXmlListUrl;
var init;

var test = function () {
  committeesJson = {};
  committeeArray.forEach(function (committee) {

    committeesJson[committee] = {};
    init(committee);
    committeesJson[committee]['consolidatedXmlListUrl'] = consolidatedXmlListUrl;
    committeesJson[committee].dataPath = dataPath;
    committeesJson[committee].individualsJsonLocalOutputFileNameAndPath = individualsJsonLocalOutputFileNameAndPath;
    committeesJson[committee].entitiesJsonLocalOutputFileNameAndPath = entitiesJsonLocalOutputFileNameAndPath;
    committeesJson[committee].individualsListUrl = individualsListUrl;
    committeesJson[committee].entitiesListUrl = entitiesListUrl;
    committeesJson[committee].logFileNameAndPath = logFileNameAndPath;
    committeesJson[committee].writeJsonOutputDebuggingDirectory = dataJsonLocalOutputFileNameAndPath;
    committeesJson[committee].dotFileLocalOutputFileNameAndPath = dataJsonLocalOutputFileNameAndPath;
    committeesJson[committee].dataJsonLocalOutputFileNameAndPath = dataJsonLocalOutputFileNameAndPath;

  });
  console.log('committeesJson = ', JSON.stringify(committeesJson, null, " "));
  return committeesJson;
};

init = function (committeeParam) {
  committee = committeeParam;

  // default settings
  // xml files Internet
  consolidatedXmlListUrl = 'http://www.un.org/sc/committees/consolidated.xml';
  committeeXmlListUrl = 'http://www.un.org/sc/committees/' + committee + '/list.xml';

  // html narrative directory files (Internet)
  individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/Individuals.shtml';
  entitiesListUrl = 'http://www.un.org/sc/committees/' + committee + '/Entities.shtml';

  // json files (local storage)
  dataPath = __dirname + '/../data/committees/consolidated/data_consolidated_list.json';
  individualsJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/individuals.json';
  entitiesJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/entities.json';

  // narrativeFilesUrlPath = __dirname + '/../data/committees/' + committee + '/';

  // html files (local storage)
  readWriteLocalNarrativesFilePath = __dirname + '/../data/committees/' + committee + '/narratives/';
  individualsHtmlLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/individuals.html';
  entitiesHtmlLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/entities.html';

  // logging
  logFileNameAndPath = __dirname + '/../log/parse2lists.log';

  // intermediate results debugging output path (local storage)
  writeJsonOutputDebuggingDirectory = __dirname + '/../data/committees/' + committee + '/debug/';
  // dot files local storage
  dotFileLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/links.dot';
  dataJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/data_committee.json';

  switch (committee) {
    // Somalia and Eritrea
    case '751':
      committeeShortDescription = "Somalia and Eritrea";
      break;
    // Al-Qaida
    case '1267':
      committeeShortDescription = "Al-Qaida";
      individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/individuals_associated_with_Al-Qaida.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/' + committee + '/entities_other_groups_undertakings_associated_with_Al-Qaida.shtml';
      break;
    case '1518':
      break;
    case '1521':
      break;
    case '1533':
      break;
    case '1572':
      break;
    case '1591':
      break;
    case '1636':
      committeeShortDescription = "Lebanon";
      break;
    case '1718':
      individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/Individuals.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/' + committee + '/Entities.shtml';
      break;
    case '1737':
      individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/individuals.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/' + committee + '/entities.shtml';
      break;
    case '1970':
      // regarding: individualsListUrl, entitiesListUrl, use default
      break;
    case '1988':
      break;
    case '2048':
      break;
    case '2127':
      break;
    case '2140':
      individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/Individuals.shtml';
      entitiesListUrl = false;
      // 'http://www.un.org/sc/committees/' + committee + '/Entities.shtml';
      break;
    case 'consolidated':
      committeeShortDescription = "consolidated list";
      xmlListUrl = 'http://www.un.org/sc/committees/consolidated.xml';
      break;
    // default code block
    default:
      logger.error(__filename, 'line', __line, '; no valid committee selected, apparently.');
      individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/Individuals.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/' + committee + '/Entities.shtml';
  }
};

test();

module.exports = {
  init: init
};


