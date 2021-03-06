// committeesConfig.js
// for each committee this file keeps track of urls, local storage directories0
//==========================

if (typeof define !== 'function') {
  var define = require('amdefine');
}
var fsOptions = {
  flags: 'r+', encoding: 'utf-8', autoClose: true
};

var appConfig = require('./appConfig.js');
var backupRawXmlFilePathAndName;
var backupRawXmlPath;
var combinedHtmlLocalOutputFileNameAndPath; // Committee 1988
var combinedListUrl;  // Committee 1988
var committeeResolution;
var committeeUrlPath;
var committeeXmlListUrl;
var committeesArray;
var committeesConfigJsonPathAndFileName;
var committeesJson;
var consolidatedXmlListUrl;
var countryCode2DigitIso;
var dataJsonLocalOutputFileNameAndPath;
var dotFileLocalOutputFileNameAndPath;
var entitiesHtmlLocalOutputFileNameAndPath;
var entitiesJsonLocalOutputFileNameAndPath;
var entitiesListUrl;
var fse = require('fs-extra');
var getCommitteesJson;
var individualsHtmlLocalOutputFileNameAndPath;
var individualsJsonLocalOutputFileNameAndPath;
var individualsListUrl;
var init;
var linenums = require('./linenums.js');
var logFileNameAndPath;
var logger = appConfig.logger;
var main;
var mergedDataPath;
var missingNodesPathAndFileName;
var narrDataPath;
var narrativesUrlPath;
var permRefNumEnt;
var permRefNumIndiv;
var readWriteLocalNarrativesFilePath;
var run;
var subjectMatterAbbreviated;
var utilities_aq_viz = require('./utilities_aq_viz.js');
var writeJsonOutputDebuggingDirectory;
var xmlDataPath;
var xmlFileLocalHistoricalArchiveStoragePathAndName;
var xmlFileLocalStoragePathAndName;

// returns a committeesJson object

getCommitteesJson = function (test) {
  if (test) {
    test();
  } else {
    return run();
  }

};

run = function () {

// getCommitteesJson = function () {
  committeesArray = appConfig.getCommitteesArray();
  committeesJson = {};

  committeesArray.forEach(function (committeeParam) {
    //committeesJson.set(committee, {});
    var committeeConfig = committeeParam;
    committeesJson[committeeConfig] = {};
    init(committeeConfig);

    // committeesJson[committee].consolidatedXmlListUrl = consolidatedXmlListUrl;
    committeesJson[committeeConfig].backupRawXmlFilePathAndName = backupRawXmlFilePathAndName;
    committeesJson[committeeConfig].backupRawXmlPath = backupRawXmlPath;
    committeesJson[committeeConfig].combinedHtmlLocalOutputFileNameAndPath = combinedHtmlLocalOutputFileNameAndPath; // Committee 1988
    committeesJson[committeeConfig].combinedListUrl = combinedListUrl;  // Committee 1988
    committeesJson[committeeConfig].committeeUrlPath = committeeUrlPath;
    committeesJson[committeeConfig].committeeXmlListUrl = committeeXmlListUrl;
    committeesJson[committeeConfig].committeesConfigJsonPathAndFileName = committeesConfigJsonPathAndFileName;
    committeesJson[committeeConfig].consolidatedXmlListUrl = consolidatedXmlListUrl;
    committeesJson[committeeConfig].dataJsonLocalOutputFileNameAndPath = dataJsonLocalOutputFileNameAndPath;
    committeesJson[committeeConfig].dotFileLocalOutputFileNameAndPath = dotFileLocalOutputFileNameAndPath;
    committeesJson[committeeConfig].entitiesHtmlLocalOutputFileNameAndPath = entitiesHtmlLocalOutputFileNameAndPath;
    committeesJson[committeeConfig].entitiesJsonLocalOutputFileNameAndPath = entitiesJsonLocalOutputFileNameAndPath;
    committeesJson[committeeConfig].entitiesListUrl = entitiesListUrl;
    committeesJson[committeeConfig].individualsHtmlLocalOutputFileNameAndPath = individualsHtmlLocalOutputFileNameAndPath;
    committeesJson[committeeConfig].individualsJsonLocalOutputFileNameAndPath = individualsJsonLocalOutputFileNameAndPath;
    committeesJson[committeeConfig].individualsListUrl = individualsListUrl;
    committeesJson[committeeConfig].logFileNameAndPath = logFileNameAndPath;
    committeesJson[committeeConfig].mergedDataPath = mergedDataPath;
    committeesJson[committeeConfig].missingNodesPathAndFileName = missingNodesPathAndFileName;
    committeesJson[committeeConfig].narrDataPath = narrDataPath;
    committeesJson[committeeConfig].narrativesUrlPath = narrativesUrlPath;
    committeesJson[committeeConfig].readWriteLocalNarrativesFilePath = readWriteLocalNarrativesFilePath;
    committeesJson[committeeConfig].subjectMatterAbbreviated = subjectMatterAbbreviated;
    committeesJson[committeeConfig].writeJsonOutputDebuggingDirectory = writeJsonOutputDebuggingDirectory;
    committeesJson[committeeConfig].xmlDataPath = xmlDataPath;
    committeesJson[committeeConfig].xmlFileLocalHistoricalArchiveStoragePathAndName = xmlFileLocalHistoricalArchiveStoragePathAndName;
    committeesJson[committeeConfig].xmlFileLocalStoragePathAndName = xmlFileLocalStoragePathAndName;

  });
  fse.writeFileSync(committeesConfigJsonPathAndFileName, JSON.stringify(committeesJson, null, ' '), fsOptions);
  return committeesJson;
};

main = function () {
  var cj = getCommitteesJson();
  console.log('\nJSON.stringify(committeesArray, null, \' \') = ', JSON.stringify(committeesArray, null, ' '));
  console.log('\nJSON.stringify(cj, null, \' \') = ', JSON.stringify(cj, null, ' '));
};

init = function (committeeParam) {
  var committeeConfig = committeeParam;

  // initialize values;
  permRefNumIndiv = "";
  permRefNumEnt = "";
  subjectMatterAbbreviated = "";
  countryCode2DigitIso = '';
  committeeResolution = "";

  // default settings
  // ** URLs / URIs
  // ======================================
  // **** URLs / URIs for XML files
  committeeXmlListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/' + committeeConfig + '.xml';
  consolidatedXmlListUrl = committeeXmlListUrl;
  // **** URL path
  committeeUrlPath = 'http://www.un.org/sc/committees/' + committeeConfig + '/';
  // **** URLs for html individual and entity list files
  individualsListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/Individuals.shtml';
  entitiesListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/Entities.shtml';
  narrativesUrlPath = 'http://www.un.org/sc/committees/' + committeeConfig + '/';
  // local paths and file names
  missingNodesPathAndFileName = __dirname + '/../data/committees/' + committeeConfig + '/missing/missing_nodes.json.js';
  // xml files local storage
  xmlFileLocalStoragePathAndName = __dirname + '/../data/committees/' + committeeConfig + '/' + committeeConfig + '.xml';
  xmlFileLocalHistoricalArchiveStoragePathAndName = __dirname + '/../data/archive_historical/' + committeeConfig + '-' + utilities_aq_viz.getFormattedDateStringForBackupFileName(new Date(), 'yyyy-mm-dd') + '.xml';

  // XML backups
  backupRawXmlPath = __dirname + '/../data/committees/' + committeeConfig + '/backup/';
  backupRawXmlFilePathAndName = __dirname + '/../data/committees/' + committeeConfig + '/backup/' + committeeConfig + '.xml';

  // local storage
  // ============
  individualsHtmlLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committeeConfig + '/individuals.html';
  entitiesHtmlLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committeeConfig + '/entities.html';

  readWriteLocalNarrativesFilePath = __dirname + '/../data/committees/' + committeeConfig + '/narratives/';

  // ** json files
  // **** json files extracted from the xml list files
  xmlDataPath = __dirname + '/../data/committees/' + committeeConfig + '/data_xml.json';
  // json files of nodes extracted from the narratives
  narrDataPath = __dirname + '/../data/committees/' + committeeConfig + '/data_narr.json';
  mergedDataPath = __dirname + '/../data/committees/' + committeeConfig + '/data.json';
  individualsJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committeeConfig + '/individuals.json';
  entitiesJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committeeConfig + '/entities.json';

  // debugging output is written to a different directory for each javascript file
  // for example, collect.js writes debugging output to __dirname + '/../data/committees/' + committeeConfig + '/debug_collect/';

  // logging
  logFileNameAndPath = __dirname + '/../log/parse2lists.log';

  // dot files local storage
  dotFileLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committeeConfig + '/links.dot';

  // store local 'data_committee.json' file location
  dataJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committeeConfig + '/data_committees.json';

  // place to store all the configuration data from this committeesConfig.js file
  committeesConfigJsonPathAndFileName = __dirname + '/../data/committees/committeesConfig.json';

  // Committee 1988 combined list; these variables are flags to be recognized by code
  combinedListUrl = null;
  combinedHtmlLocalOutputFileNameAndPath = null;

  switch (committeeConfig) {
    // Somalia and Eritrea
    case '751':
      backupRawXmlFilePathAndName = __dirname + '/../data/committees/' + committeeConfig + '/backup/751_1907.xml';
      committeeResolution = "751 (1992) / 1907 (2009)";
      committeeXmlListUrl = 'http://www.un.org/sc/committees/751/751_1907.xml';
      countryCode2DigitIso = 'SO';
      permRefNumEnt = "SOe.001";
      permRefNumIndiv = "SOi.001";
      subjectMatterAbbreviated = "Resolutions 751 (1992) and 1907 (2009) concerning Somalia and Eritrea";
      break;
    // Al-Qaida
    case '1267':
      committeeResolution = "1267/1989";
      countryCode2DigitIso = "non-State entity";
      entitiesListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/entities_other_groups_undertakings_associated_with_Al-Qaida.shtml';
      individualsListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/individuals_associated_with_Al-Qaida.shtml';
      permRefNumEnt = "QDe.001";
      permRefNumIndiv = "QDi.001";
      subjectMatterAbbreviated = "Resolutions 1267 (1999) and 1989 (2011) concerning Al-Qaida and associated individuals and entities";
      break;
    // former Iraqi regime
    case '1518':
      committeeResolution = "1518 (2003)";
      committeeXmlListUrl = 'http://www.un.org/sc/committees/1518/1518.xml';
      countryCode2DigitIso = "IQ";
      entitiesListUrl = 'http://www.un.org/sc/committees/1518/Entities.shtml';
      individualsListUrl = 'http://www.un.org/sc/committees/1518/Individuals.shtml';
      permRefNumEnt = "IQe.001";
      permRefNumIndiv = "IQi.001";
      subjectMatterAbbreviated = "Resolution 1518 (2003) re: the former Iraqi regime";
      break;
    // Liberia
    case '1521':
      committeeResolution = "1521 (2003)";
      countryCode2DigitIso = "LR";
      entitiesListUrl = 'http://www.un.org/sc/committees/1521/Entities.shtml';
      individualsListUrl = 'http://www.un.org/sc/committees/1521/Individuals.shtml';
      permRefNumEnt = "LRe.001";
      permRefNumIndiv = "LRi.001";
      subjectMatterAbbreviated = "Resolution 1521 (2003) concerning Liberia";
      committeeXmlListUrl = 'http://www.un.org/sc/committees/1521/1521.xml';      break;
    // Congo
    case '1533':
      committeeResolution = "1533 (2004)";
      committeeXmlListUrl = 'http://www.un.org/sc/committees/1533/1533.xml';
      countryCode2DigitIso = "CD";
      permRefNumEnt = "CDe.001";
      permRefNumIndiv = "CDi.001";
      subjectMatterAbbreviated = "Resolution 1533 (2004) concerning the Democratic Republic of the Congo";
      break;
    // Côte d'Ivoire
    // Committee 1572 has no entities list
    case '1572':
      committeeResolution = "1572 (2004)";
      countryCode2DigitIso = "CI";
      entitiesHtmlLocalOutputFileNameAndPath = false;
      entitiesListUrl = false;
      individualsListUrl = 'http://www.un.org/sc/committees/1572/individuals.shtml';
      permRefNumEnt = "CIe.001";
      permRefNumIndiv = "CIi.001";
      subjectMatterAbbreviated = "Resolution 1572 (2004) concerning Côte d'Ivoire";
      break;
    // Sudan
    case '1591':
      committeeResolution = "1591 (2005)";
      countryCode2DigitIso = "SD";
      entitiesListUrl = false;
      individualsListUrl = 'http://www.un.org/sc/committees/1591/Individuals.shtml';
      permRefNumEnt = "SDe.001";
      permRefNumIndiv = "SDi.001";
      subjectMatterAbbreviated = "Resolution 1591 (2005) concerning the Sudan";
      break;
    // Lebanon
    // Committee 1636 has neither an individuals list or entities list
    case '1636':
      committeeResolution = "NA";
      countryCode2DigitIso = "NA";
      entitiesHtmlLocalOutputFileNameAndPath = false;
      entitiesListUrl = false;
      individualsHtmlLocalOutputFileNameAndPath = false;
      individualsListUrl = false;
      permRefNumEnt = "NA";
      permRefNumIndiv = "NA";
      subjectMatterAbbreviated = "Resolution 1636 (2005) re: February 2005 terrorist bombing in Beirut, Lebanon that killed former P.M. Hariri and 22 others.";
      break;
    // North Korea
    case '1718':
      committeeResolution = "1718 (2006)";
      countryCode2DigitIso = "KP";
      entitiesListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/Entities.shtml';
      individualsListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/Individuals.shtml';
      permRefNumEnt = "KPe.001";
      permRefNumIndiv = "KPi.001";
      subjectMatterAbbreviated = "Resolution 1718 (2006) relating to the Democratic People’s Republic of Korea (DPRK).";
      break;
    // Iran
    case '1737':
      committeeResolution = "1737 (2006)";
      countryCode2DigitIso = "IR";
      entitiesListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/entities.shtml';
      individualsListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/individuals.shtml';
      permRefNumEnt = "IRe.001";
      permRefNumIndiv = "IRi.001";
      subjectMatterAbbreviated = "Resolution 1737 (2006) relating to the Islamic Republic of Iran.";
      break;
    // Libya
    case '1970':
      committeeResolution = "1970 (2011)";
      countryCode2DigitIso = "LY";
      entitiesListUrl = 'http://www.un.org/sc/committees/1970/Entities.shtml';
      individualsListUrl = 'http://www.un.org/sc/committees/1970/Individuals.shtml';
      permRefNumEnt = "LYe.001";
      permRefNumIndiv = "LYi.001";
      subjectMatterAbbreviated = "Resolution 1970 (2011) concerning Libya";
      break;
    // Taliban/Afghanistan
    case '1988':
      // For committee 1988, the list of both individuals and entities is on a single page here: http://www.un.org/sc/committees/1988/narrative.shtml
      // Committee 1988 has no entities list
      combinedHtmlLocalOutputFileNameAndPath = 'http://www.un.org/sc/committees/1988/narrative.shtml';
      combinedListUrl = 'http://www.un.org/sc/committees/1988/narrative.shtml';
      committeeResolution = "1988 (2011)";
      countryCode2DigitIso = "non-State entity";
      entitiesHtmlLocalOutputFileNameAndPath = false;
      entitiesListUrl = false;
      individualsListUrl = 'http://www.un.org/sc/committees/1988/narrative.shtml';
      permRefNumEnt = "TAe.001";
      permRefNumIndiv = "TAi.001";
      subjectMatterAbbreviated = "Resolution 1988 (2011), Resolution 2082 (2012) re: Taliban/Afghanistan";
      break;
    // Guinea-Bissau
    // Committee 2048 has no entities list
    case '2048':
      committeeResolution = "2048 (2012)";
      countryCode2DigitIso = "GB";
      entitiesHtmlLocalOutputFileNameAndPath = false;
      entitiesListUrl = false;
      individualsListUrl = 'http://www.un.org/sc/committees/2048/2048individuals.shtml';
      permRefNumEnt = "GBe.001";
      permRefNumIndiv = "GBi.001";
      subjectMatterAbbreviated = "Resolution 2048 (2012) concerning Guinea-Bissau";
      break;
    // Central African Republic
    // Committee 2127 has no entities list
    case '2127':
      committeeResolution = "2127 (2013)";
      countryCode2DigitIso = "CF";
      entitiesHtmlLocalOutputFileNameAndPath = false;
      entitiesListUrl = false;
      individualsListUrl = 'http://www.un.org/sc/committees/2127/individuals_associated_with_CAR.shtml';
      permRefNumEnt = "CFe.001";
      permRefNumIndiv = "CFi.001";
      subjectMatterAbbreviated = "Resolution 2127 (2013) concerning the Central African Republic";
      break;
    // Yemen
    // Committee 2140 has no entities list
    case '2140':
      committeeResolution = "NA";
      countryCode2DigitIso = "NA";
      entitiesHtmlLocalOutputFileNameAndPath = false;
      entitiesListUrl = false;
      individualsListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/Individuals.shtml';
      permRefNumEnt = "NA";
      permRefNumIndiv = "NA";
      subjectMatterAbbreviated = "Resolution 2140 (2014) re: Yemen.";
      break;
    // Consolidated list of all committees' lists
    case 'consolidated':
      committeeXmlListUrl = 'http://www.un.org/sc/committees/consolidated.xml';
      entitiesHtmlLocalOutputFileNameAndPath = false;
      entitiesListUrl = false;
      individualsHtmlLocalOutputFileNameAndPath = false;
      individualsListUrl = false;
      subjectMatterAbbreviated = "Consolidated United Nations Security Council Sanctions List includes all individuals and entities subject to sanctions measures imposed by the U.N. Security Council.";
      break;
    // default code block
    default:
      logger.error(__filename, 'line', __line, '; no valid CommitteeResolution selected, apparently.');
  }
};

// test();

module.exports = {
  getCommitteesJson: getCommitteesJson
};


