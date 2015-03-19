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

var committeeShortDescription;
// var committeesJson;
var committeeXmlListUrl;
// var backupRawXmlFileName;
var permRefNumIndiv;
var permRefNumEnt;
var countryCode2DigitIso;
var backupRawXmlPath;
var backupRawXmlFilePathAndName;
var xmlFileLocalStoragePathAndName;
var committeesUrlPath;
var committeesJson;
var init;

var getCommitteesJson = function () {
  var committeeArray = ['751', '1267', '1518', '1521', '1533', '1572', '1591', '1718', '1737', '1970', '1988', '2048', '2127', 'consolidated'];
  committeesJson = {};

  committeeArray.forEach(function (committee) {

    committeesJson[committee] = {};
    init(committee);
    committeesJson[committee].consolidatedXmlListUrl = consolidatedXmlListUrl;
    committeesJson[committee].committeesUrlPath = committeesUrlPath;
    committeesJson[committee].consolidatedXmlListUrl = consolidatedXmlListUrl
    committeesJson[committee].xmlFileLocalStoragePathAndName = xmlFileLocalStoragePathAndName;
    committeesJson[committee].committeeXmlListUrl = committeeXmlListUrl;
    committeesJson[committee].dataPath = dataPath;
    committeesJson[committee].individualsJsonLocalOutputFileNameAndPath = individualsJsonLocalOutputFileNameAndPath;
    committeesJson[committee].entitiesJsonLocalOutputFileNameAndPath = entitiesJsonLocalOutputFileNameAndPath;
    committeesJson[committee].individualsListUrl = individualsListUrl;
    committeesJson[committee].entitiesListUrl = entitiesListUrl;
    committeesJson[committee].logFileNameAndPath = logFileNameAndPath;
    committeesJson[committee].writeJsonOutputDebuggingDirectory = writeJsonOutputDebuggingDirectory;
    committeesJson[committee].dotFileLocalOutputFileNameAndPath = dotFileLocalOutputFileNameAndPath;
    committeesJson[committee].dataJsonLocalOutputFileNameAndPath = dataJsonLocalOutputFileNameAndPath;
    // committeesJson[committee].backupRawXmlFileName = backupRawXmlFileName;
    committeesJson[committee].backupRawXmlPath = backupRawXmlPath;
    committeesJson[committee].backupRawXmlFilePathAndName = backupRawXmlFilePathAndName;
    committeesJson[committee].committeesUrlPath = committeesUrlPath;

  });
  console.log('committeesJson = ', JSON.stringify(committeesJson, null, " "));
  utilities_aq_viz.stringifyAndWriteJsonDataFile(committeesJson, __dirname + '/../data/committees/committeesJson.json');
  return committeesJson;
};

init = function (committeeParam) {
  committee = committeeParam;

  // default settings
  // xml files from Internet
  committeesUrlPath = 'http://www.un.org/sc/committees/' + committee + '/';
  committeeXmlListUrl = 'http://www.un.org/sc/committees/' + committee + '/list.xml';
  consolidatedXmlListUrl = committeeXmlListUrl;

  // xml files local storage
  xmlFileLocalStoragePathAndName = __dirname + '/../data/committees/' + committee + '/list.xml';
  backupRawXmlPath = __dirname + '/../data/committees/' + committee + '/backup/';
//   backupRawXmlFilePathAndName = backupRawXmlPath + 'list.xml';
  backupRawXmlFilePathAndName = __dirname + '/../data/committees/' + committee + '/backup/' + 'list.xml';
//  backupRawXmlFilePathAndName
  // html narrative directory files (Internet)
  individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/Individuals.shtml';
  entitiesListUrl = 'http://www.un.org/sc/committees/' + committee + '/Entities.shtml';

  // json files (local storage)
  dataPath = __dirname + '/../data/committees/consolidated/data_consolidated_list.json';
  individualsJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/individuals.json';
  entitiesJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/entities.json';
  // intermediate results debugging output path (local storage)
  writeJsonOutputDebuggingDirectory = __dirname + '/../data/committees/' + committee + '/debug/';
  // narrativeFilesUrlPath = __dirname + '/../data/committees/' + committee + '/';

  // html files (local storage)
  readWriteLocalNarrativesFilePath = __dirname + '/../data/committees/' + committee + '/narratives/';
  individualsHtmlLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/individuals.html';
  entitiesHtmlLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/entities.html';

  // logging
  logFileNameAndPath = __dirname + '/../log/parse2lists.log';

  // dot files local storage
  dotFileLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/links.dot';
  dataJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/data_committee.json';

  switch (committee) {
    // Somalia and Eritrea
    case '751':
      committeeShortDescription = "751 (1992) / 1907 (2009) regarding Somalia and Eritrea";
      permRefNumIndiv = "SOi.001";
      permRefNumEnt = "SOe.001";
      countryCode2DigitIso = 'SO';
      committeeXmlListUrl = 'http://www.un.org/sc/committees/751/751_1907.xml';
      backupRawXmlFilePathAndName = backupRawXmlPath + '751_1907.xml';
      break;
    // Al-Qaida
    case '1267':
      committeeShortDescription = "Al-Qaida";
      individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/individuals_associated_with_Al-Qaida.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/' + committee + '/entities_other_groups_undertakings_associated_with_Al-Qaida.shtml';
      break;
    case '1518':
      committeeXmlListUrl = 'http://www.un.org/sc/committees/1518/1518.xml';
      individualsListUrl = 'http://www.un.org/sc/committees/1518/Individuals.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/1518/Entities.shtml';
      break;
    case '1521':
      // committeeXmlListUrl = '';
      // individualsListUrl = '';
      // entitiesListUrl = '';
      break;
    case '1533':
      // committeeXmlListUrl = '';
      // individualsListUrl = '';
      // entitiesListUrl = '';
      break;
    case '1572':
      // committeeXmlListUrl = '';
      // individualsListUrl = '';
      // entitiesListUrl = '';
      break;
    case '1591':
      // committeeXmlListUrl = '';
      // individualsListUrl = '';
      // entitiesListUrl = '';
      break;
    case '1636':
      committeeShortDescription = "Lebanon";
      // committeeXmlListUrl = '';
      // individualsListUrl = '';
      // entitiesListUrl = '';
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
      // committeeXmlListUrl = '';
      // individualsListUrl = '';
      // entitiesListUrl = '';
      break;
    case '1988':
      // committeeXmlListUrl = '';
      // individualsListUrl = '';
      // entitiesListUrl = '';
      break;
    case '2048':
      // committeeXmlListUrl = '';
      // individualsListUrl = '';
      // entitiesListUrl = '';
      break;
    case '2127':
      // committeeXmlListUrl = '';
      // individualsListUrl = '';
      // entitiesListUrl = '';
      break;
    case '2140':
      // committeeXmlListUrl = '';
      // individualsListUrl = '';
      // entitiesListUrl = '';
      individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/Individuals.shtml';
      entitiesListUrl = false;
      // 'http://www.un.org/sc/committees/' + committee + '/Entities.shtml';
      break;
    case 'consolidated':
      // committeeXmlListUrl = '';
      // individualsListUrl = '';
      // entitiesListUrl = '';
      committeeShortDescription = "consolidated list";
      xmlListUrl = 'http://www.un.org/sc/committees/consolidated.xml';
      break;
    // default code block
    default:
      logger.error(__filename, 'line', __line, '; no valid committee selected, apparently.');
//      individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/Individuals.shtml';
//      entitiesListUrl = 'http://www.un.org/sc/committees/' + committee + '/Entities.shtml';
  }
};

module.exports = {
  getCommitteesJson: getCommitteesJson
};


