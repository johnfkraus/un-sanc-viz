// committeesConfig.js
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
// var committee;
var committeeResolution;
var committeeUrlPath;
var committeeXmlListUrl;
var xmlFileLocalHistorialArchiveStoragePathAndName;
var committeesArray;
var committeesConfigJsonPathAndFileName;
var committeesJson;
var consolidatedXmlListUrl;
var countryCode2DigitIso;
var dataJsonLocalOutputFileNameAndPath;
var dotFileLocalOutputFileNameAndPath;
var entitiesHtmlLocalOutputFileNameAndPath;
var entitiesListUrl;
var fse = require('fs-extra');
var getCommitteesJson;
var narrDataPath;
var individualsHtmlLocalOutputFileNameAndPath;
var individualsListUrl;
var init;
var linenums = require('./linenums.js');
var logFileNameAndPath;
var logger = appConfig.logger;
var mergedDataPath;
var missingNodesPathAndFileName;
var narrativesUrlPath;
var permRefNumEnt;
var permRefNumIndiv;
var readWriteLocalNarrativesFilePath;
var run;
var subjectMatterAbbreviated;
var main;
var utilities_aq_viz = require('./utilities_aq_viz.js');
var writeJsonOutputDebuggingDirectory;
var xmlDataPath;
var xmlFileLocalStoragePathAndName;
var combinedListUrl;  // Committee 1988
var combinedHtmlLocalOutputFileNameAndPath; // Committee 1988

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
    committeesJson[committeeConfig].committeeUrlPath = committeeUrlPath;
    committeesJson[committeeConfig].committeeXmlListUrl = committeeXmlListUrl;
    committeesJson[committeeConfig].committeesConfigJsonPathAndFileName = committeesConfigJsonPathAndFileName;
    committeesJson[committeeConfig].consolidatedXmlListUrl = consolidatedXmlListUrl;
    committeesJson[committeeConfig].dataJsonLocalOutputFileNameAndPath = dataJsonLocalOutputFileNameAndPath;
    committeesJson[committeeConfig].dotFileLocalOutputFileNameAndPath = dotFileLocalOutputFileNameAndPath;
    committeesJson[committeeConfig].entitiesHtmlLocalOutputFileNameAndPath = entitiesHtmlLocalOutputFileNameAndPath;
    committeesJson[committeeConfig].entitiesJsonLocalOutputFileNameAndPath = entitiesJsonLocalOutputFileNameAndPath;
    committeesJson[committeeConfig].entitiesListUrl = entitiesListUrl;
    committeesJson[committeeConfig].narrDataPath = narrDataPath;
    committeesJson[committeeConfig].individualsHtmlLocalOutputFileNameAndPath = individualsHtmlLocalOutputFileNameAndPath;
    committeesJson[committeeConfig].individualsJsonLocalOutputFileNameAndPath = individualsJsonLocalOutputFileNameAndPath;
    committeesJson[committeeConfig].individualsListUrl = individualsListUrl;
    committeesJson[committeeConfig].logFileNameAndPath = logFileNameAndPath;
    committeesJson[committeeConfig].mergedDataPath = mergedDataPath;
    committeesJson[committeeConfig].missingNodesPathAndFileName = missingNodesPathAndFileName;

    committeesJson[committeeConfig].narrativesUrlPath = narrativesUrlPath;

    committeesJson[committeeConfig].readWriteLocalNarrativesFilePath = readWriteLocalNarrativesFilePath;
    committeesJson[committeeConfig].subjectMatterAbbreviated = subjectMatterAbbreviated;
    committeesJson[committeeConfig].writeJsonOutputDebuggingDirectory = writeJsonOutputDebuggingDirectory;
    committeesJson[committeeConfig].xmlDataPath = xmlDataPath;
    committeesJson[committeeConfig].xmlFileLocalStoragePathAndName = xmlFileLocalStoragePathAndName;
    committeesJson[committeeConfig].xmlFileLocalHistorialArchiveStoragePathAndName = xmlFileLocalHistorialArchiveStoragePathAndName;
    committeesJson[committeeConfig].combinedListUrl = combinedListUrl;  // Committee 1988
    committeesJson[committeeConfig].combinedHtmlLocalOutputFileNameAndPath = combinedHtmlLocalOutputFileNameAndPath; // Committee 1988

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

  xmlFileLocalHistorialArchiveStoragePathAndName = __dirname + '/../data/archive_historical/' + committeeConfig + '-' + utilities_aq_viz.getFormattedDateStringForBackupFileName(new Date(), 'yyyy-mm-dd') + '.xml';

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

  writeJsonOutputDebuggingDirectory = __dirname + '/../data/committees/' + committeeConfig + '/debug/';
//  writeJsonOutputDebuggingPath = __dirname + '/../data/committees/' + committeeConfig + '/debug/';

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
      individualsListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/individuals_associated_with_Al-Qaida.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/entities_other_groups_undertakings_associated_with_Al-Qaida.shtml';
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
    // Committee 1572 has no entities list
    case '1572':
      individualsListUrl = 'http://www.un.org/sc/committees/1572/individuals.shtml';
      entitiesListUrl = false;
      entitiesHtmlLocalOutputFileNameAndPath = false;
      permRefNumIndiv = "CIi.001";
      permRefNumEnt = "CIe.001";
      countryCode2DigitIso = "CI";
      committeeResolution = "1572 (2004)";
      subjectMatterAbbreviated = "Resolution 1572 (2004) concerning Côte d'Ivoire";
      break;
    // Sudan
    case '1591':
      individualsListUrl = 'http://www.un.org/sc/committees/1591/Individuals.shtml';
      entitiesListUrl = false;
      permRefNumIndiv = "SDi.001";
      permRefNumEnt = "SDe.001";
      countryCode2DigitIso = "SD";
      committeeResolution = "1591 (2005)";
      subjectMatterAbbreviated = "Resolution 1591 (2005) concerning the Sudan";
      break;
    // Lebanon
    // Committee 1636 has neither an individuals list or entities list
    case '1636':
      individualsListUrl = false;
      entitiesListUrl = false;
      individualsHtmlLocalOutputFileNameAndPath = false;
      entitiesHtmlLocalOutputFileNameAndPath = false;
      permRefNumIndiv = "NA";
      permRefNumEnt = "NA";
      countryCode2DigitIso = "NA";
      committeeResolution = "NA";
      subjectMatterAbbreviated = "Resolution 1636 (2005) re: February 2005 terrorist bombing in Beirut, Lebanon that killed former P.M. Hariri and 22 others.";
      break;
    // North Korea
    case '1718':
      individualsListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/Individuals.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/Entities.shtml';
      permRefNumIndiv = "KPi.001";
      permRefNumEnt = "KPe.001";
      countryCode2DigitIso = "KP";
      committeeResolution = "1718 (2006)";
      subjectMatterAbbreviated = "Resolution 1718 (2006) relating to the Democratic People’s Republic of Korea (DPRK).";
      break;
    // Iran
    case '1737':
      individualsListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/individuals.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/entities.shtml';
      permRefNumIndiv = "IRi.001";
      permRefNumEnt = "IRe.001";
      countryCode2DigitIso = "IR";
      committeeResolution = "1737 (2006)";
      subjectMatterAbbreviated = "Resolution 1737 (2006) relating to the Islamic Republic of Iran.";
      break;
    // Libya
    case '1970':
      individualsListUrl = 'http://www.un.org/sc/committees/1970/Individuals.shtml';
      entitiesListUrl = 'http://www.un.org/sc/committees/1970/Entities.shtml';
      permRefNumIndiv = "LYi.001";
      permRefNumEnt = "LYe.001";
      countryCode2DigitIso = "LY";
      committeeResolution = "1970 (2011)";
      subjectMatterAbbreviated = "Resolution 1970 (2011) concerning Libya";
      break;
    // Taliban/Afghanistan
    case '1988':
      // For committee 1988, the list of both individuals and entities is on a single page here: http://www.un.org/sc/committees/1988/narrative.shtml
      // Committee 1988 has no entities list
      individualsListUrl = 'http://www.un.org/sc/committees/1988/narrative.shtml';
      combinedListUrl = 'http://www.un.org/sc/committees/1988/narrative.shtml';
      combinedHtmlLocalOutputFileNameAndPath = 'http://www.un.org/sc/committees/1988/narrative.shtml';
      entitiesListUrl = false;
      entitiesHtmlLocalOutputFileNameAndPath = false;
      permRefNumIndiv = "TAi.001";
      permRefNumEnt = "TAe.001";
      countryCode2DigitIso = "non-State entity";
      committeeResolution = "1988 (2011)";
      subjectMatterAbbreviated = "Resolution 1988 (2011), Resolution 2082 (2012) re: Taliban/Afghanistan";
      break;
    // Guinea-Bissau
    // Committee 2048 has no entities list
    case '2048':
      entitiesListUrl = false;
      individualsListUrl = 'http://www.un.org/sc/committees/2048/2048individuals.shtml';
      entitiesHtmlLocalOutputFileNameAndPath = false;
      permRefNumIndiv = "GBi.001";
      permRefNumEnt = "GBe.001";
      countryCode2DigitIso = "GB";
      committeeResolution = "2048 (2012)";
      subjectMatterAbbreviated = "Resolution 2048 (2012) concerning Guinea-Bissau";
      break;
    // Central African Republic
    // Committee 2127 has no entities list
    case '2127':
      entitiesListUrl = false;
      individualsListUrl = 'http://www.un.org/sc/committees/2127/individuals_associated_with_CAR.shtml';
      entitiesHtmlLocalOutputFileNameAndPath = false;
      permRefNumIndiv = "CFi.001";
      permRefNumEnt = "CFe.001";
      countryCode2DigitIso = "CF";
      committeeResolution = "2127 (2013)";
      subjectMatterAbbreviated = "Resolution 2127 (2013) concerning the Central African Republic";
      break;
    // Yemen
    // Committee 2140 has no entities list
    case '2140':
      individualsListUrl = 'http://www.un.org/sc/committees/' + committeeConfig + '/Individuals.shtml';
      entitiesListUrl = false;
      entitiesHtmlLocalOutputFileNameAndPath = false;
      permRefNumIndiv = "NA";
      permRefNumEnt = "NA";
      countryCode2DigitIso = "NA";
      committeeResolution = "NA";
      subjectMatterAbbreviated = "Resolution 2140 (2014) re: Yemen.";
      break;
    // Consolidated list
    case 'consolidated':
      committeeXmlListUrl = 'http://www.un.org/sc/committees/consolidated.xml';
      individualsListUrl = false;
      individualsHtmlLocalOutputFileNameAndPath = false;
      entitiesListUrl = false;
      entitiesHtmlLocalOutputFileNameAndPath = false;
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


