// committees.js
//==========================

var appConfig = require('./appConfig.js');
var utilities_aq_viz = require('./utilities_aq_viz.js');
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
var writeJsonOutputDebuggingDirectory;
var individualsHtmlLocalOutputFileNameAndPath;
var entitiesHtmlLocalOutputFileNameAndPath;
var dataJsonLocalOutputFileNameAndPath;
var individualsListUrl;
var entitiesListUrl;
var logFileNameAndPath;
var readWriteLocalNarrativesFilePath;
var individualsJsonLocalOutputFileNameAndPath;
var entitiesJsonLocalOutputFileNameAndPath;
var dotFileLocalOutputFileNameAndPath;

var subjectMatterAbbreviated;
var committeeXmlListUrl;
var permRefNumIndiv;
var permRefNumEnt;
var countryCode2DigitIso;
var backupRawXmlPath;
var backupRawXmlFilePathAndName;
var xmlFileLocalStoragePathAndName;
var missingNodesPathAndFileName;
var committeeUrlPath;
var committeesConfigJsonPathAndFileName;
var committeesJson = {};
var init;
var committeeResolution; // = "1572 (2004)";
var committee;
var committeesArray;
var xmlDataPath;
var htmlDataPath;
var mergedDataPath;

var getCommitteesJson = function () {
  committeesArray = appConfig.getCommitteesArray();
  committeesArray.forEach(function (committee) {
    committeesJson[committee] = {};
    init(committee);
    committeesJson[committee].xmlDataPath = xmlDataPath;
    committeesJson[committee].htmlDataPath = htmlDataPath;
    committeesJson[committee].mergedDataPath = mergedDataPath;
    committeesJson[committee].consolidatedXmlListUrl = consolidatedXmlListUrl;
    committeesJson[committee].committeeUrlPath = committeeUrlPath;
    committeesJson[committee].consolidatedXmlListUrl = consolidatedXmlListUrl;
    committeesJson[committee].xmlFileLocalStoragePathAndName = xmlFileLocalStoragePathAndName;
    committeesJson[committee].committeeXmlListUrl = committeeXmlListUrl;
    // committeesJson[committee].dataPath = dataPath;
    committeesJson[committee].individualsJsonLocalOutputFileNameAndPath = individualsJsonLocalOutputFileNameAndPath;
    committeesJson[committee].entitiesJsonLocalOutputFileNameAndPath = entitiesJsonLocalOutputFileNameAndPath;
    committeesJson[committee].individualsListUrl = individualsListUrl;
    committeesJson[committee].entitiesListUrl = entitiesListUrl;
    committeesJson[committee].logFileNameAndPath = logFileNameAndPath;
    committeesJson[committee].writeJsonOutputDebuggingDirectory = writeJsonOutputDebuggingDirectory;
    committeesJson[committee].dotFileLocalOutputFileNameAndPath = dotFileLocalOutputFileNameAndPath;
    committeesJson[committee].dataJsonLocalOutputFileNameAndPath = dataJsonLocalOutputFileNameAndPath;
    committeesJson[committee].backupRawXmlPath = backupRawXmlPath;
    committeesJson[committee].backupRawXmlFilePathAndName = backupRawXmlFilePathAndName;
    committeesJson[committee].committeeUrlPath = committeeUrlPath;
    committeesJson[committee].individualsHtmlLocalOutputFileNameAndPath = individualsHtmlLocalOutputFileNameAndPath;
    committeesJson[committee].entitiesHtmlLocalOutputFileNameAndPath = entitiesHtmlLocalOutputFileNameAndPath;
    committeesJson[committee].missingNodesPathAndFileName = missingNodesPathAndFileName;
    committeesJson[committee].subjectMatterAbbreviated = subjectMatterAbbreviated;
    committeesJson[committee].committeesConfigJsonPathAndFileName = committeesConfigJsonPathAndFileName;
  });
  utilities_aq_viz.stringifyAndWriteJsonDataFile(committeesJson, committeesConfigJsonPathAndFileName);
  return committeesJson;
};

init = function (committeeParam) {
  committee = committeeParam;

  // initialize values;
  permRefNumIndiv = "";
  permRefNumEnt = "";
  subjectMatterAbbreviated = "";
  countryCode2DigitIso = '';
  committeeResolution = "";

  // default settings
  committeeUrlPath = 'http://www.un.org/sc/committees/' + committee + '/';
  committeeXmlListUrl = 'http://www.un.org/sc/committees/' + committee + '/' + committee + '.xml';
  consolidatedXmlListUrl = committeeXmlListUrl;
  missingNodesPathAndFileName = __dirname + '/../data/committees/' + committee + '/missing/missing_nodes.json.js';
  // xml files local storage
  xmlFileLocalStoragePathAndName = __dirname + '/../data/committees/' + committee + '/' + committee + '.xml';
  backupRawXmlPath = __dirname + '/../data/committees/' + committee + '/backup/';
  backupRawXmlFilePathAndName = __dirname + '/../data/committees/' + committee + '/backup/' + committee + '.xml';
  // html narrative files
  // url download from html Internet
  individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/Individuals.shtml';
  entitiesListUrl = 'http://www.un.org/sc/committees/' + committee + '/Entities.shtml';
  // local storage
  readWriteLocalNarrativesFilePath = __dirname + '/../data/committees/' + committee + '/narratives/';
  individualsHtmlLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/individuals.html';
  entitiesHtmlLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/entities.html';
  // json files (local storage)
  // json files extracted from the xml list files
  xmlDataPath = __dirname + '/../data/committees/' + committee + '/data_xml.json';
  // json files of nodes extracted from the narratives
  htmlDataPath = __dirname + '/../data/committees/' + committee + '/data_html.json';
  mergedDataPath = __dirname + '/../data/committees/' + committee + '/data.json';
  individualsJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/individuals.json';
  entitiesJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/entities.json';
  writeJsonOutputDebuggingDirectory = __dirname + '/../data/committees/' + committee + '/debug/';
  // logging
  logFileNameAndPath = __dirname + '/../log/parse2lists.log';
  // dot files local storage
  dotFileLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/links.dot';
  dataJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/data_committees.json';
  // place to store all the configuration data from this committees.js file
  committeesConfigJsonPathAndFileName =  __dirname + '/../data/committees/committeesJson.json';

  switch (committee) {
    // Somalia and Eritrea
    case '751':
      backupRawXmlFilePathAndName = __dirname + '/../data/committees/' + committee + '/backup/751_1907.xml';
      permRefNumIndiv = "SOi.001";
      permRefNumEnt = "SOe.001";
      countryCode2DigitIso = 'SO';
      committeeXmlListUrl = 'http://www.un.org/sc/committees/751/751_1907.xml';
      permRefNumIndiv = "SOi.001";
      permRefNumEnt = "SOe.001";
      countryCode2DigitIso = "SO";
      committeeResolution = "751 (1992) / 1907 (2009)";
      subjectMatterAbbreviated = "Resolutions 751 (1992) and 1907 (2009) concerning Somalia and Eritrea";
      break;
    // Al-Qaida
    case '1267':
      subjectMatterAbbreviated = "Al-Qaida";
      individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/individuals_associated_with_Al-Qaida.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/' + committee + '/entities_other_groups_undertakings_associated_with_Al-Qaida.shtml';
      permRefNumIndiv = "QDi.001";
      permRefNumEnt = "QDe.001";
      countryCode2DigitIso = "non-State entity";
      committeeResolution = "1267/1989";
      subjectMatterAbbreviated = "Resolutions 1267 (1999) and 1989 (2011) concerning Al-Qaida and associated individuals and entities";
      break;
    // former Iraqi regime
    case '1518':
      subjectMatterAbbreviated = "Resolution 1518 (2003) re: the former Iraqi regime";
      committeeXmlListUrl = 'http://www.un.org/sc/committees/1518/1518.xml';
      individualsListUrl = 'http://www.un.org/sc/committees/1518/Individuals.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/1518/Entities.shtml';
      permRefNumIndiv = "IQi.001";
      permRefNumEnt = "IQe.001";
      countryCode2DigitIso = "IQ";
      committeeResolution = "1518 (2003)";
      break;
    // Liberia
    case '1521':
      committeeXmlListUrl = 'http://www.un.org/sc/committees/1521/1521.xml';
      individualsListUrl = 'http://www.un.org/sc/committees/1521/Individuals.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/1521/Entities.shtml';
      permRefNumIndiv = "LRi.001";
      permRefNumEnt = "LRe.001";
      countryCode2DigitIso = "LR";
      committeeResolution = "1521 (2003)";
      subjectMatterAbbreviated = "Resolution 1521 (2003) concerning Liberia";
      break;
    // Congo
    case '1533':
      committeeXmlListUrl = 'http://www.un.org/sc/committees/1533/1533.xml';
      permRefNumIndiv = "CDi.001";
      permRefNumEnt = "CDe.001";
      countryCode2DigitIso = "CD";
      committeeResolution = "1533 (2004)";
      subjectMatterAbbreviated = "Resolution 1533 (2004) concerning the Democratic Republic of the Congo";
      break;
    // Côte d'Ivoire
    case '1572':
      // committeeXmlListUrl = '';
      individualsListUrl = 'http://www.un.org/sc/committees/1572/individuals.shtml';
      entitiesListUrl = false;
      // Permanent_reference_numbers_for_individuals = "CIi.001";
      // Permanent_reference_numbers_for_entities = "CIe.001";
      // Two_Digit_Country_ISO_Code = "CI";
      // committeeResolution = "1572 (2004)";
      // Subject_Matter_Abbreviated = "Resolution 1572 (2004) concerning Côte d'Ivoire";

      permRefNumIndiv = "CIi.001";
      permRefNumEnt = "CIe.001";
      countryCode2DigitIso = "CI";
      committeeResolution = "1572 (2004)";
      subjectMatterAbbreviated = "Resolution 1572 (2004) concerning Côte d'Ivoire";

      break;
    case '1591':
      // committeeXmlListUrl = '';
      individualsListUrl = 'http://www.un.org/sc/committees/1591/Individuals.shtml';
      entitiesListUrl = false;
      permRefNumIndiv = "SDi.001";
      permRefNumEnt = "SDe.001";
      countryCode2DigitIso = "SD";
      committeeResolution = "1591 (2005)";
      subjectMatterAbbreviated = "Resolution 1591 (2005) concerning the Sudan";
      break;
    case '1636':
      subjectMatterAbbreviated = "Lebanon";
      // committeeXmlListUrl = '';
      individualsListUrl = false;
      entitiesListUrl = false;
      permRefNumIndiv = "NA";
      permRefNumEnt = "NA";
      countryCode2DigitIso = "NA";
      committeeResolution = "NA";
      subjectMatterAbbreviated = "Resolution 1636 (2005) re: February 2005 terrorist bombing in Beirut, Lebanon that killed former P.M. Hariri and 22 others.";
      break;
    case '1718':
      individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/Individuals.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/' + committee + '/Entities.shtml';
      permRefNumIndiv = "KPi.001";
      permRefNumEnt = "KPe.001";
      countryCode2DigitIso = "KP";
      committeeResolution = "1718 (2006)";
      subjectMatterAbbreviated = "Resolution 1718 (2006) relating to the Democratic People’s Republic of Korea (DPRK).";
      break;
    case '1737':
      individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/individuals.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/' + committee + '/entities.shtml';
      permRefNumIndiv = "IRi.001";
      permRefNumEnt = "IRe.001";
      countryCode2DigitIso = "IR";
      committeeResolution = "1737 (2006)";
      subjectMatterAbbreviated = "Resolution 1737 (2006) relating to the Islamic Republic of Iran.";
      break;
    case '1970':
      // regarding: individualsListUrl, entitiesListUrl, use default
      // committeeXmlListUrl = '';
      individualsListUrl = 'http://www.un.org/sc/committees/1970/Individuals.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/1970/Entities.shtml';
      permRefNumIndiv = "LYi.001";
      permRefNumEnt = "LYe.001";
      countryCode2DigitIso = "LY";
      committeeResolution = "1970 (2011)";
      subjectMatterAbbreviated = "Resolution 1970 (2011) concerning Libya";
      break;
    case '1988':
      // committeeXmlListUrl = '';
      individualsListUrl = 'http://www.un.org/sc/committees/1988/narrative.shtml';
      entitiesListUrl = individualsListUrl;
      permRefNumIndiv = "TAi.001";
      permRefNumEnt = "TAe.001";
      countryCode2DigitIso = "non-State entity";
      committeeResolution = "1988 (2011)";
      subjectMatterAbbreviated = "Resolution 1988 (2011), Resolution 2082 (2012) re: Taliban/Afghanistan";
      break;
    case '2048':
      // committeeXmlListUrl = '';
      entitiesListUrl = 'false';
      individualsListUrl = 'http://www.un.org/sc/committees/2048/2048individuals.shtml';
      permRefNumIndiv = "GBi.001";
      permRefNumEnt = "GBe.001";
      countryCode2DigitIso = "GB";
      committeeResolution = "2048 (2012)";
      subjectMatterAbbreviated = "Resolution 2048 (2012) concerning Guinea-Bissau";
      break;
    case '2127':
      // committeeXmlListUrl = '';
      // individualsListUrl = '';
      // entitiesListUrl = '';
      entitiesListUrl = false;
      individualsListUrl = 'http://www.un.org/sc/committees/2127/individuals_associated_with_CAR.shtml';
      permRefNumIndiv = "CFi.001";
      permRefNumEnt = "CFe.001";
      countryCode2DigitIso = "CF";
      committeeResolution = "2127 (2013)";
      subjectMatterAbbreviated = "Resolution 2127 (2013) concerning the Central African Republic";
      break;
    case '2140':
      // committeeXmlListUrl = '';
      // individualsListUrl = '';
      // entitiesListUrl = '';
      individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/Individuals.shtml';
      entitiesListUrl = false;
      // 'http://www.un.org/sc/committees/' + committee + '/Entities.shtml';
      permRefNumIndiv = "NA";
      permRefNumEnt = "NA";
      countryCode2DigitIso = "NA";
      committeeResolution = "NA";
      subjectMatterAbbreviated = "Resolution 2140 (2014) re: Yemen.";
      break;
    case 'consolidated':
      committeeXmlListUrl = 'http://www.un.org/sc/committees/consolidated.xml';
      // committeeXmlListUrl = '';
      // individualsListUrl = '';
      // entitiesListUrl = '';
      subjectMatterAbbreviated = "consolidated list";
      break;
    // default code block
    default:
      logger.error(__filename, 'line', __line, '; no valid CommitteeResolution selected, apparently.');
//      individualsListUrl = 'http://www.un.org/sc/committees/' + committee + '/Individuals.shtml';
//      entitiesListUrl = 'http://www.un.org/sc/committees/' + committee + '/Entities.shtml';
  }
};

module.exports = {
  getCommitteesJson: getCommitteesJson
};


