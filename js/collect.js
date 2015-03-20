// collect.js
// collect consolidated sanctions list file from 'http://www.un.org/sc/committees/consolidated.xml', convert to json
// get the two html files containing narrative names and file names/urls
// write narrative urls array file (a json array) to /data/narrative_lists/narrativeUrlsArray.json
// normalize the data and put it into arrays for d3
// each element in the node array in the main json data file (represented by the 'data' variable and stored in /data/output/data.json) contains data on a single individual or
// entity listed in the consolidated.xml sanctions data file collected from the U.N. site located at http://www.un.org/sc/committees/1267/.
//==========================

// do we want lots of logging messages for debugging (if so, set consoleLog = true)

// var app = require('./app.js');
var appConfig = require('./appConfig.js');
var getCommitteesJson = require('./committees.js').getCommitteesJson;
var getCommitteesArray = require('./committees.js').getCommitteesArray;
var logger = require('./tracer-logger-config.js').logger;
var utilities_aq_viz = require('./utilities_aq_viz');
// RUN CONFIGURATION
// skip downloading 300+ narrative files and use locally stored files instead; for debugging
var useLocalConsolidatedListFile = appConfig.useLocalListFiles;
var useLocalNarrativeFiles = appConfig.useLocalNarrativeFiles;
var consoleLog = appConfig.consoleLog;

var logModulus = utilities_aq_viz.logModulus;
var substringChars = utilities_aq_viz.truncateToNumChars;
var linenums = require('./linenums.js');
var responseBody;
var individualsHtmlUnicodeString;
var entitiesHtmlUnicodeString;
var iterators = require('async-iterators');
var missingNodes = require('./missing_nodes.js'),
  async = require('async'),
  re = require('request-enhanced'),
  request = require('request'),
  fse = require('fs-extra'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect');
var narrativeUrlsArray = narrativeUrlsArray || [];

var counter = 0;
var numObjectsToShow = 3;
var generatedFileDateString;
var Set = require('backpack-node').collections.Set;
// StrSet class has exactly the same interface like the Set, but values have to be strings only.
var StrSet = require('backpack-node').collections.StrSet;
var Bag = require('backpack-node').collections.Bag;
var Map = require('backpack-node').collections.Map;

var fsOptions = {
  flags: 'r+', encoding: 'utf-8', autoClose: true
};
// var dateGenerated;
if (typeof define !== 'function') {
  var define = require('amdefine');
}
var requestSync = require('sync-request'),
  list_xml,
  parseString = require('xml2js')
    .parseString;
require('console-stamp')(console, '[HH:MM:ss.l]');
var now = new Date();

var select = require('soupselect').select,
  htmlparser = require('htmlparser'),
  http = require('http'),
  sys = require('sys'),
  MongoClient = require('mongodb').MongoClient,
  assert = require('assert');
var targetName = '';
var anchor,
  data = {},
  narrativeFileName,
  paragraph,
  rows,
  row,
  td,
  tds,
  underscore,
  url;
// var functionCount = 0;
var indivLinks = [];
var entLinks = [];

/*
 var committeesJson[committee].dataPath = __dirname + '/../data/committees/consolidated/data_consolidated_list.json';
 var writeJsonOutputDebuggingDirectory = __dirname + '/../data/committees/consolidated/debug/';
 var listUrl = 'http://www.un.org/sc/committees/consolidated.xml';
 // var individualsJsonLocalOutputFileNameAndPath = __dirname + '/../data/narrative_lists/individuals_associated_with_Al-Qaida.json';
 // var entitiesJsonLocalOutputFileNameAndPath = __dirname + '/../data/narrative_lists/entities_other_groups_undertakings_associated_with_Al-Qaida.json';
 var narrativeUrlsArrayLocalFileNameAndPath = __dirname + '/../data/narrative_lists/narrativeUrlsArray.json';
 */

var indivOrEntityString;
// var individualsListUrl = 'http://www.un.org/sc/committees/1267/individuals_associated_with_Al-Qaida.shtml';
// var entitiesListUrl = 'http://www.un.org/sc/committees/1267/entities_other_groups_undertakings_associated_with_Al-Qaida.shtml';
var host = 'www.un.org';
// var logMessageStringHead = new String().concat(__filename, 'line', __line);
var config;
var committees;
var committeeArray; // = ['751', '1267', '1518', '1521', '1533', '1572', '1591', '1718', '1737', '1970', '1988', '2048', '2127', '2140', 'consolidated'];
var committeesJson;

var start = function () {
  committeesArray = appConfig.getCommitteesArray();
  var functionCount = 0;
  async.series([
      // test logger
      function (callback) {
        utilities_aq_viz.testLogging();
        callback();
      },

      // copy previously downloaded or created data files to archive
      function (callback) {
        fse.copySync(__dirname + '/../data', __dirname + '/../archives/data/'); // , fsOptions);
        logger.debug(__filename, 'line', __line, 'Copied ', __dirname, '/../data to ', __dirname, '/../archives');
        callback();
      },

      // delete old files
      function (callback) {
        // fse.removeSync(writeJsonOutputDebuggingDirectory);
        if (!useLocalNarrativeFiles) {
          // fse.removeSync(__dirname + '/../data/narrative_summaries/');
          // fse.mkdirs(__dirname + '/../data/narrative_summaries/');
        }
        // fse.removeSync(__dirname + '/../data/narrative_lists/');
        // fse.removeSync(committeesJson[committee].dataPath);   // deletes /data/output/data_consolidated_list.json
        // re-create deleted directories
        // fse.mkdirs(writeJsonOutputDebuggingDirectory);
        // fse.mkdirs(__dirname + '/../data/narrative_lists/');

        try {
          committeeArray.forEach(function (committee) {
            fse.removeSync(__dirname + '/../data/committees/' + committee + '/debug/');
            fse.mkdirs(__dirname + '/../data/committees/' + committee + '/debug/');
          })
        } catch (err) {
          logger.error('\n ', __filename, 'line', __line, '; Error: ', err, utilities_aq_viz.getStackTrace(err));
        }
        callback();
      },

      function (callback) {
        committeesJson = getCommitteesJson();
        callback();
      },

      // collect XML sanctions list files for the various U.N. sanctions committees
      function (callback) {
        // var committeeArray = ['751', '1267', '1518', '1521', '1533', '1572', '1591', '1718', '1737', '1970', '1988', '2048', '2127'];
        try {
          committeesArray.forEach(function (committee) {
            collect(committee);
          })
        } catch (err) {
          logger.error('\n ', __filename, 'line', __line, '; Error: ', err, utilities_aq_viz.getStackTrace(err));
        }
        callback();
      }
    ],
    function (err) {
      if (err) {
        logger.error(__filename, 'line', __line, '; Error: ' + err);
      }
    });
};

var collect = function (committee) {
    var functionCount = 0;
    async.series([

        // get the raw xml file from the UN site on the Internet
        function (callback) {
          //  var backupRawXmlFilePathAndName = committeesJson[committee].backupRawXmlFilePathAndName; // __dirname + '/../data/committees/' + committee + '/backup/consolidated.xml';
          if (!useLocalConsolidatedListFile) {
            try {
              var res = requestSync('GET', committeesJson[committee].committeeXmlListUrl);
              list_xml = res.body.toString();
            } catch (err) {
              logger.error(__filename, 'line', __line, '; Error: ', err, '; reading xml file from Internet at url = ', committeesJson[committee].committeeXmlListUrl, '; useLocalConsolidatedListFile = ', useLocalConsolidatedListFile);
              try {
                list_xml = fse.readFileSync(committeesJson[committee].backupRawXmlFilePathAndName, fsOptions);
              } catch (err) {
                logger.error(__filename, 'line', __line, '; Error: ', err, '; filed to read xml file from the Internet per configuration ( useLocalConsolidatedListFile = ', useLocalConsolidatedListFile, '); then failed to read stored backup file:', committeesJson[committee].backupRawXmlFilePathAndName);
              }
            }
          }
          else {
            try {
              list_xml = fse.readFileSync(committeesJson[committee].backupRawXmlFilePathAndName, fsOptions);
            } catch (err) {
              logger.error(__filename, 'line', __line, '; Error: ', err, '; reading stored backup file:', committeesJson[committee].backupRawXmlFilePathAndName, 'useLocalConsolidatedListFile = ', useLocalConsolidatedListFile);
            }
            logger.info(__filename, 'line', __line, '; Per configuration, reading stored backup XML file: committeesJson[committee].backupRawXmlFilePathAndName = ', committeesJson[committee].backupRawXmlFilePathAndName, '; useLocalConsolidatedListFile = ', useLocalConsolidatedListFile, '; useLocalConsolidatedListFile = ', useLocalConsolidatedListFile);
          }
          if (consoleLog) {
            logger.debug(__filename, 'line', __line, '; consoleLog = ', consoleLog, '; list_xml res.body.toString() = ', list_xml.substring(0, substringChars), '\n list_xml Response body length: ', list_xml.length);
            logger.debug([__filename, 'line', __line, 'list_xml res.body.toString() = ', list_xml.substring(0, substringChars), '\nlist_xml Response body length: ', list_xml.length].join(''));
          }
          callback();
        },

        // write committee or consolidated.xml to local file and archive_historical directory
        function (callback) {
//          var fileNameAndPathForProcessing = __dirname + '/../data/committees/consolidated/consolidated.xml';
          utilities_aq_viz.syncWriteMyFile(list_xml, committeesJson[committee].xmlFileLocalStoragePathAndName, fsOptions);

          utilities_aq_viz.syncWriteMyFile(list_xml, committeesJson[committee].backupRawXmlFilePathAndName, fsOptions);
          // committeesJson[committee].backupRawXmlFilePathAndName

          // syncWriteFileXML(list_xml, fileNameAndPathForProcessing);
          // var fileNameAndPathForArchive = __dirname + '/../data/archive/consolidated.xml';
          // utilities_aq_viz.syncWriteMyFile(list_xml, fileNameAndPathForArchive, fsOptions);
          // syncWriteFileXML(list_xml, fileNameAndPathForArchive);
          callback();
        },

        // convert xml in variable 'list_xml' to json and store in var 'data'
        function (callback) {
          if (consoleLog) {
            logger.debug('\n ', __filename, 'line', __line, ' function #:', ++functionCount);
          }
          parseString(list_xml, {
            explicitArray: false,
            trim: true
          }, function (err, result) {
            if (err) {
              logger.error(__filename, 'line', __line, ' error attempting parseString: ', err, '\n');
            }
            data = result;
            if (consoleLog) {
              logger.debug(__filename, 'line', __line, ' result = \n', JSON.stringify(data).substring(0, 400));
            }
          });
          callback();
        },

        // update the data_consolidated_list.json file; write the intermediate file for debugging
        function (callback) {
          var writeJsonPathAndFileName = committeesJson[committee].writeJsonOutputDebuggingDirectory + 'data-collect-L' + __line + '-raw_data_consolidated_list.json';
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, writeJsonPathAndFileName);
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, committeesJson[committee].dataPath);
          callback();
        },

        // read 'raw' unprocessed json data file created from raw XML file data feed
        function (callback) {
          // var dataPath = __dirname + '/../data/output/data_consolidated_list.json';
          data = JSON.parse(fse.readFileSync(committeesJson[committee].dataPath, fsOptions));
          if (consoleLog) {
            logger.info(__filename, 'line', __line, '; function #:', ++functionCount, '; read data_consolidated_list.json, consoleLog = ', consoleLog);
          }
          callback();
        },

        // read committees json data file
        function (callback) {
          var committeesPath = __dirname + '/../data/committees/committees.json';
          committees = JSON.parse(fse.readFileSync(committeesPath, fsOptions));
          if (false) {
            logger.info(__filename, 'line', __line, '; function #:', ++functionCount, '; read committees.json, consoleLog = ', consoleLog, '; committees = ', JSON.stringify(committees, null, ' '));
          }
          callback();
        },

        // misc normalization
        // put all the individual and entity nodes in a single array and add a property to identify node as indiv or ent
        // from local file, add no-longer-listed and otherwise missing ents and indivs to nodes
        // normalize indiv.indivDobString, indiv.indivPlaceOfBirthString, indiv.indivAliasString
        // archive a dated copy of consolidated.xml for potential future time series analysis
        // normalize reference numbers, ids, name strings, nationality.
        function (callback) {

          var oldRefNumRegexReplace;

          if (consoleLog) {
            logger.debug('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; normalize data_consolidated_list.json');
          }

          //var x = Object.prototype.toString.call( data.CONSOLIDATED_LIST.ENTITIES.ENTITY );

          // if there is only one data.CONSOLIDATED_LIST.ENTITIES.ENTITY, ENTITY will be an object, not an array; so we convert the single object to an element in an array
        // is an entity defined?
          try {
            if (data.CONSOLIDATED_LIST.ENTITIES && data.CONSOLIDATED_LIST.ENTITIES.ENTITY) {
              // is entity an array?  Put the array into data.entities
              if (Object.prototype.toString.call(data.CONSOLIDATED_LIST.ENTITIES.ENTITY) === '[object Array]') {
                console.log('entities Array!, committee = ', committee);
                data.entities = data.CONSOLIDATED_LIST.ENTITIES.ENTITY;
                data.entities.forEach(function (entity) {
                  entity.noLongerListed = 0;
                });
              } else {
                // entity is not an array; it is probably a single object, so create data.entities as an array and put the entity in the array
                data.entities = [];
                data.entities.push(data.CONSOLIDATED_LIST.ENTITIES.ENTITY);
              }
            }
            else {
              // entity is undefined; there are no entities; create an empty array
              data.entities = [];
            }
          } catch (err) {
            logger.error(__filename, 'line', __line, '; Error: ', err, '; committee = ', committee);
          }


          /*
                    if (Object.prototype.toString.call(data.CONSOLIDATED_LIST.ENTITIES.ENTITY) === '[object Array]') {
                      console.log('entities Array!, committee = ', committee);
                      data.entities = data.CONSOLIDATED_LIST.ENTITIES.ENTITY;
                      // data.indivs = data.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL;
                    } else if (data.CONSOLIDATED_LIST.ENTITIES.ENTITY) {
                      data.entities = [];
                      data.entities.push(data.CONSOLIDATED_LIST.ENTITIES.ENTITY);
                    } else {
                      data.entities = [];
                    }
          */
          // var y = Object.prototype.toString.call( data.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL );
          if (Object.prototype.toString.call(data.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL) === '[object Array]') {
            console.log('individual Array!, committee = ', committee);
            data.indivs = data.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL;



          } else if (data.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL) {
            data.indivs = [];
              data.indivs.push(data.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL);
          } else {
            data.indivs = [];
          }

//          data.CONSOLIDATED_LIST.ENTITIES.ENTITY;

          //

//          data.entities = data.CONSOLIDATED_LIST.ENTITIES.ENTITY;

          // data.entities = data.CONSOLIDATED_LIST.ENTITIES;
          // data.indivs = data.CONSOLIDATED_LIST.INDIVIDUALS;
          try {

            data.entities.forEach(function (entity) {
              entity.noLongerListed = 0;
            });
            data.indivs.forEach(function (indiv) {
              indiv.noLongerListed = 0;
            });
          } catch (err) {
            logger.error(__filename, 'line', __line, '; Error: ', err, '; committee = ', committee);
          }

          var missingIndivs = missingNodes.getMissingIndivs();
          missingIndivs.forEach(function (missing_indiv) {
            missing_indiv.noLongerListed = 1;
          });
          var missingEnts = missingNodes.getMissingEnts();
          missingEnts.forEach(function (missing_ent) {
            missing_ent.noLongerListed = 1;
          });
          data.indivs = data.indivs.concat(missingIndivs);
          // data.indivs = data.indivs.concat(missingNodes.getMissingIndivs());
          data.indivs.forEach(function (indiv) {
            indiv.indiv0OrEnt1 = 0;
            indiv.indivDobString = createIndivDateOfBirthString(indiv);
            indiv.indivPlaceOfBirthString = processPlaceOfBirthArray(indiv);
            indiv.indivAliasString = processAliasArray(indiv);
          });
          data.entities = data.entities.concat(missingEnts);
          data.entities.forEach(function (entity) {
            entity.indiv0OrEnt1 = 1;
          });
          data.nodes = data.indivs.concat(data.entities);

          data.dateGenerated = utilities_aq_viz.formatMyDate(data.CONSOLIDATED_LIST.$.dateGenerated);
          data.dateCollected = utilities_aq_viz.formatMyDate(new Date());
          data.nodes.forEach(function (node) {
            node.dateUpdatedString = processDateUpdatedArray(node);

          });
          var generatedFileDateString = dateFormat(data.dateGenerated, 'yyyy-mm-dd');
          var archiveFileNameAndPath = __dirname + '/../data/archive_historical/consolidated-' + generatedFileDateString + '.xml';

          utilities_aq_viz.syncWriteMyFile(data, archiveFileNameAndPath, fsOptions);
          createDateGeneratedMessage();
          delete data.entities;
          delete data.indivs;
          delete data.CONSOLIDATED_LIST;

          // cleanUpRefNums(data.nodes);
          // cleanUpIds(data.nodes);
          data.comments = {};
          data.comments.links = [];
          data.narratives = {};
          data.narratives.links = [];
          var nodes = data.nodes;
          var node;
          var oldRefNumRegexMatch;
          for (var nodeCounter = 0; nodeCounter < nodes.length; nodeCounter++) {
            node = nodes[nodeCounter];
            delete node.$;  // delete reference to xml schema
            node.nodeNumber = nodeCounter + 1;
            node.id = node.REFERENCE_NUMBER;
            // is there an OLD-format reference number in COMMENTS1?  If so, extract it.
            if ((node.COMMENTS1 !== null) && ( typeof node.COMMENTS1 !== 'undefined') && (node.COMMENTS1).match(/\[Old Reference # ([I]\.\d{1,3}\.[A-Z]\.\d{1,2})\]/gim) !== null) {
              node.oldRefNumDebug = node.COMMENTS1;
              oldRefNumRegexMatch = (node.COMMENTS1).match(/\[Old Reference # ([I]\.\d{1,3}\.[A-Z]\.\d{1,2})\]/gim);
              oldRefNumRegexReplace = oldRefNumRegexMatch[0].replace(/\[Old Reference # ([I]\.\d{1,3}\.[A-Z]\.\d{1,2})\]/gim, '$1');
              node.oldRefNum = oldRefNumRegexReplace.trim();
              // logger.debug(__filename, 'line', __line, 'node.nodeNumber = ', node.nodeNumber, '; node.oldRefNum = ', node.oldRefNum);
            }
          }
          concatNames(nodes);
          createNationality(nodes);
          getCommitteeInfo(data, committees);

          if (consoleLog && (node.nodeNumber % logModulus === 0)) {
            logger.debug(__filename, 'line', __line, 'node.nodeNumber = ', node.nodeNumber, '; JSON.stringify(data).substring(0, substringChars) = \n', JSON.stringify(data, null, ' ').substring(0, substringChars));
          }
          callback();
        },

        // update the data_consolidated_list.json file; write the intermediate file for debugging
        function (callback) {
          var writeJsonPathAndFileName = committeesJson[committee].writeJsonOutputDebuggingDirectory + 'data-collect-L' + __line + '-normzd1_data_consolidated_list.json';
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, writeJsonPathAndFileName);
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, committeesJson[committee].dataPath);
          callback();
        },

        // update the data_consolidated_list.json file; write the intermediate file for debugging
        function (callback) {
          callback();
        }
      ],
      function (err) {
        // if (consoleLog) { logger.debug( __filename, 'line', __line, ' wroteJson = ', trunc.n400(myResult));
        if (err) {
          logger.error(__filename, 'line', __line, '; Error: ' + err);
        }
      }
    )
    ;
  }
  ;

var getCommitteeInfo = function (data, committees) {
  var nodes = data.nodes;
  var node, nodeId, indivEntIdentifier, committeeIdentifier;
  var oldRefNumRegexMatch;
  var two_Digit_Country_ISO_Code;
  var committeeResNum;
  var subject_Matter_Abbreviated;

  for (var nodeCounter = 0; nodeCounter < nodes.length; nodeCounter++) {
    node = nodes[nodeCounter];
    nodeId = node.id;
    committeeIdentifier = nodeId.substring(0, 2);

    switch (committeeIdentifier) {
      case 'CD':
        node.two_Digit_Country_ISO_Code = 'CD';
        node.committeeResNum = "1533 (2004)";
        node.subject_Matter_Abbreviated = "Resolution 1533 (2004) concerning the Democratic Republic of the Congo";
        break;
      case 'CF':
        node.two_Digit_Country_ISO_Code = 'CF';
        node.committeeResNum = "2127 (2013)";
        node.subject_Matter_Abbreviated = "Resolution 2127 (2013) concerning the Central African Republic";
        break;
      case 'CI':
        node.two_Digit_Country_ISO_Code = 'CI';
        node.committeeResNum = "1572 (2004)";
        node.subject_Matter_Abbreviated = "Resolution 1572 (2004) concerning Côte d\'Ivoire";
        break;
      case 'GB':
        node.two_Digit_Country_ISO_Code = 'GB';
        node.committeeResNum = "2048 (2012)";
        node.subject_Matter_Abbreviated = "Resolution 2048 (2012) concerning Guinea-Bissau";
        break;
      case 'IQ':
        node.two_Digit_Country_ISO_Code = 'GB';
        node.committeeResNum = "1518 (2003)";
        node.subject_Matter_Abbreviated = "Resolution 1518 (2003) re: the former Iraqi regime";
        break;
      case 'IR':
        node.two_Digit_Country_ISO_Code = 'IR';
        node.committeeResNum = "1737 (2006)";
        node.subject_Matter_Abbreviated = "Resolution 1737 (2006) relating to the Islamic Republic of Iran.";
        break;
      case 'KP':
        node.two_Digit_Country_ISO_Code = 'KP';
        node.committeeResNum = "1718 (2006)";
        node.subject_Matter_Abbreviated = "Resolution 1718 (2006) relating to the Democratic People’s Republic of Korea (DPRK).";
        break;
      case 'LR':
        node.two_Digit_Country_ISO_Code = 'LR';
        node.committeeResNum = "1521 (2003)";
        node.subject_Matter_Abbreviated = "Resolution 1521 (2003) concerning Liberia";
        break;
      case 'LY':
        node.two_Digit_Country_ISO_Code = 'LY';
        node.committeeResNum = "1970 (2011)";
        node.subject_Matter_Abbreviated = "Resolution 1970 (2011) concerning Libya";
        break;
      case 'QD':
        node.two_Digit_Country_ISO_Code = 'non-State entity';
        node.committeeResNum = "1267 (1999) and 1989 (2011)";
        node.subject_Matter_Abbreviated = "Resolutions 1267 (1999) and 1989 (2011) concerning Al-Qaida and associated individuals and entities";
        break;

      case 'QE':
        node.two_Digit_Country_ISO_Code = 'non-State entity';
        node.committeeResNum = "1267 (1999) and 1989 (2011)";
        node.subject_Matter_Abbreviated = "Resolutions 1267 (1999) and 1989 (2011) concerning Al-Qaida and associated individuals and entities";
        break;
      case 'QI':
        node.two_Digit_Country_ISO_Code = 'non-State entity';
        node.committeeResNum = "1267 (1999) and 1989 (2011)";
        node.subject_Matter_Abbreviated = "Resolutions 1267 (1999) and 1989 (2011) concerning Al-Qaida and associated individuals and entities";
        break;

      case 'SD':
        node.two_Digit_Country_ISO_Code = 'SD';
        node.committeeResNum = "1591 (2005)";
        node.subject_Matter_Abbreviated = "Resolution 1591 (2005) concerning the Sudan";
        break;
      case 'SO':
        node.two_Digit_Country_ISO_Code = 'SO';
        node.committeeResNum = "751 (1992) / 1907 (2009)";
        node.subject_Matter_Abbreviated = "Resolutions 751 (1992) and 1907 (2009) concerning Somalia and Eritrea";
        break;
      case 'TA':
        node.two_Digit_Country_ISO_Code = 'TA';
        node.committeeResNum = "non-State entity";
        node.subject_Matter_Abbreviated = "Resolution 1988 (2011), Resolution 2082 (2012) re: Taliban/Afghanistan";
        break;

      case 'YE':
        node.two_Digit_Country_ISO_Code = 'YE';
        node.committeeResNum = "2140 (2014)";
        node.subject_Matter_Abbreviated = "Resolution 2140 (2014) re: Yemen.";
        break;

      case 'LB':
        node.two_Digit_Country_ISO_Code = 'LB';
        node.committeeResNum = "1636 (2005)";
        node.subject_Matter_Abbreviated = "Resolution 1636 (2005) re: February 2005 terrorist bombing in Beirut, Lebanon that killed former P.M. Hariri and 22 others.";
        break;

      default:
        // default code block
        logger.error(__filename, 'line', __line, '; no valid committee detected in ', nodeId);
        node.two_Digit_Country_ISO_Code = 'err';
        node.committeeResNum = "err";
        node.subject_Matter_Abbreviated = "No valid committee detected from node.id.";
    }

    indivEntIdentifier = nodeId.substring(2, 3).toLowerCase();
    if (indivEntIdentifier === 'e') {
      // logger.debug('e');
      node.indivOrEntFromId = 'e1';
    } else if (indivEntIdentifier === 'i') {
      // logger.debug('i');
      node.indivOrEntFromId = 'i1';
    } else if (node.indiv0OrEnt1 === 0) {
      node.indivOrEntFromId = 'i2';
    } else if (node.indiv0OrEnt1 === 1) {
      node.indivOrEntFromId = 'e2';

    } else {
      node.indivOrEntFromId = 'error';
      logger.error('; entity/indiv info missing from nodeId = ', nodeId, '; node.nodeNum =', node.nodeNumber);
      /*
       throw {
       name: 'MissingIdentifier',
       message: '; Parameter \'nodeId\' = ' + nodeId
       };
       */
    }
  }
};
/*
 var syncWriteFileXML = function (data, localFileNameAndPath) {
 //  var myFile = __dirname + '/../data/output/consolidated.xml';
 try {
 //    fse.writeFileSync(localFileNameAndPath, list_xml, fsOptions);
 fse.writeFileSync(localFileNameAndPath, data, fsOptions);
 if (consoleLog) {
 logger.debug(__filename, 'line', __line, '; data written to: ', localFileNameAndPath);
 logger.debug(__filename, 'line', __line, '; file contained: ', data.toString().substring(0, substringChars)); ///, false, null).trunc(truncateToNumChars));
 }
 } catch (err) {
 logger.error(__filename, 'line', __line, ' Error: ', err);
 }
 if (consoleLog) {
 logger.debug(__filename, 'line', __line, ' list_xml = \n', list_xml.toString().substring(0, substringChars));
 }
 };

 */

// parse the html narrative list files
// put html file names in narrativeUrlsArray
// write to json file: narrativeUrlsArrayLocalFileNameAndPath

var syncParseHtmlListPage = function (htmlString, indivOrEntityString) {
  logger.debug(__filename, ' line ', __line, '; running syncParseHtmlListPage (htmlString = ', htmlString.substring(0, 100), ', indivOrEntityString = ', indivOrEntityString, ')');
  if ((typeof htmlString === 'null') || (typeof htmlString === 'undefined')) {
    throw {
      name: 'MissingParameterError',
      message: '; Parameter \'htmlString\' = ' + htmlString
    };
    logger.error(__filename, ' line ', __line, 'Error: parameter htmlString missing');
  }

  if (utilities_aq_viz.errorPageReturned(htmlString)) {
    logger.error(__filename, ' line ', __line, 'Error: PageNotFoundError; Server returned: Error: Page Not Found');
    throw {
      name: 'PageNotFoundError',
      message: '; Server returned: ' + responseBody.match('Error: Page Not Found')
    }
  }
  // re 'handler', see the following lines below:
  //   var parser = new htmlparser.Parser(handler);
  //   parser.parseComplete(responseBody);
  var handler = new htmlparser.DefaultHandler(function (err, dom) {
    if (err) {
      logger.error(__filename, 'line', __line, 'Error: ' + err);
    } else {
      // soupselect happening here...
      // var titles = select(dom, 'a.title');
      rows = select(dom, 'table tr');
      var rowNum;
      var rawId;
      var cleanId;
      // loop through each table row
      var narrLink;
      for (var i = 0; i < rows.length; i++) {
        // skip the header row
        if (i === 0) {
          continue;
        }
        rowNum = i;
        row = rows[i];
        // sys.puts('row[' + i + '] = ' + sys.inspect(JSON.stringify(row)));
        narrLink = {};
        tds = select(row, 'td');
        // loop through each td/column in the row
        for (var j = 0; j < tds.length; j++) {
          td = tds[j];
          // get the id from the first td

          if (j === 0) {
            paragraph = select(td, 'p');

            if ((typeof paragraph !== 'null') && (typeof paragraph !== 'undefined') && (typeof paragraph[0].children !== 'null')) {
              try {
                // if  ((typeof paragraph[0] !== 'null')  && (typeof paragraph[0] !== 'undefined')) {
//                var ch0 = '';
//                var pp0 = '';
                rawId = paragraph[0].children[0].data;
//                pp0 = paragraph[0]; //.children[0].data;
//                ch0 = pp0.children[0]; // .data;
//                rawId = ch0.data; // paragraph[0].children[0].data;
                cleanId = getCleanId(rawId);
                narrLink.id = cleanId; // getCleanId(rawId); //paragraph[0].children[0].dat1a);
//                rawId = '';
//                cleanId = '';
//                pp0 = '';
                //               ch0 = '';
                // }
              } catch (err) {

                logger.error(__filename, 'line', __line, ' Error: ', err, '; rawId = ', rawId, '; paragraph = ', paragraph);
              }
            }
          }
          // if we are in the second td in the row...
          else if (j === 1) {
            paragraph = select(td, 'p');
            anchor = select(td, 'a');

            if (typeof paragraph !== 'undefined' && typeof paragraph[0] !== 'undefined') {
              //logger.debug( __filename, 'line', __line, 'paragraph = ', JSON.stringify(paragraph));
              if (typeof paragraph[0].children[0].attribs !== 'undefined') {
                try {
                  narrativeFileName = paragraph[0].children[0].attribs.href;
                  narrativeFileName = normalizeNarrativeFileName(narrativeFileName); //.replace(/\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
                  // narrativeFileName = narrativeFileName.replace(/http:\/\/dev.un.org\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
                  // http://dev.un.org/sc/committees/1267/
                  narrLink.narrativeFileName = narrativeFileName;
                } catch (err) {
                  logger.error(__filename, 'line', __line, '; paragraph[0].children[0] = ', paragraph[0].children[0]);
                  logger.error(__filename, 'line', __line, '; Error: paragraph[0].children[0].attribs is undefined; tr = ', i, '; td = ', j, err);
                }
              } else if (typeof anchor[0].attribs.href !== 'undefined') {
                narrLink.narrativeFileName = normalizeNarrativeFileName(narrativeFileName);
                narrLink.targetName = JSON.stringify(anchor[0].children[0].data);
              } else {
                narrLink.narrativeFileName = 'PLACEHOLDER0';
                logger.error(__filename, 'line', __line, '; Error: narrativeFileName for tr = ', i, '; td = ', j, 'is PLACEHOLDER0');
              }
              // if anchor inside of paragraph
              if (anchor[0].children[0].data !== 'u') {
                targetName = anchor[0].children[0].data;
              } else if (anchor[0].children[0].data === 'u') {
                underscore = select(td, 'u');
                targetName = JSON.stringify(underscore[0].children[0].data);
              } else {
                targetName = 'PLACEHOLDER1';
              }
              targetName = targetName.replace(/[\n\f\r\t]/gm, '');
              targetName = targetName.replace(/\s\s+/gm, ' ');
              targetName = targetName.trim();
              if (targetName === '') {
                narrLink.targetName = 'PLACEHOLDER2';
              } else {
                narrLink.targetName = targetName;
              }
              // end of if (typeof paragraph !== 'undefined' && typeof paragraph[0] !== 'undefined')
            } else if (typeof anchor[0].attribs.href !== 'undefined' && anchor[0].attribs.href !== '') {
              narrativeFileName = normalizeNarrativeFileName(anchor[0].attribs.href);
              narrLink.narrativeFileName = narrativeFileName;
              if (typeof anchor[0].children[0] !== 'undefined' && anchor[0].children[0].data !== '') {
                targetName = anchor[0].children[0].data;
                narrLink.targetName = targetName;
              }
            }
          }
        }
        narrLink.indivOrEntityString = indivOrEntityString;
        narrLink.rowNum = i;
        if (indivOrEntityString === 'indiv') {
          indivLinks.push(narrLink);
        }
        if (indivOrEntityString === 'entity') {
          entLinks.push(narrLink);
        }
        narrLink.urlNum = narrativeUrlsArray.length + 1;
        narrativeUrlsArray.push(narrLink);
      }
    }
  });

  var parser = new htmlparser.Parser(handler);
  parser.parseComplete(htmlString);
  if (indivOrEntityString === 'indiv') {
    writeMyFile(individualsJsonLocalOutputFileNameAndPath, JSON.stringify(indivLinks, null, ' '), fsOptions);
  }
  if (indivOrEntityString === 'entity') {
    writeMyFile(entitiesJsonLocalOutputFileNameAndPath, JSON.stringify(entLinks, null, ' '), fsOptions);
  }
  writeMyFile(narrativeUrlsArrayLocalFileNameAndPath, JSON.stringify(narrativeUrlsArray, null, ' '), fsOptions);
};

var normalizeNarrativeFileName = function (narrativeFileNameString) {
  // logger.debug( __filename, __line, '; narrativeFileNameString = ', narrativeFileNameString);
  var narrativeFileName1 = narrativeFileNameString.replace(/http:\/\/dev.un.org\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
  // var narrativeFileName1 = narrativeFileNameString.replace(/http:\/\/dev.un.org(\/sc\/committees\/1267\/NSQ.*\.shtml)/, '$1');
  // logger.debug( __filename, __line, '; narrativeFileName1 = ', narrativeFileName1);
  var narrativeFileName2 = narrativeFileName1.replace(/\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
  return narrativeFileName2.trim();
};

var cleanUpIds = function (nodes) {
  counter = 0;
  nodes.forEach(function (node) {
    counter++;
    // remove period from end of all reference numbers that have them; not all do.
    var refNumRegexMatch;
    try {
      refNumRegexMatch = (node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
      node.id = refNumRegexMatch[1].trim();
    } catch (err) {
      if (consoleLog) {
        logger.error(__filename, 'line', __line, '; Error: ', err, '; node =', node, '; node.id = ', node.id, '; counter = ', counter);
      }
    }
    //  clean up indiv id for consistency;  none should have trailing period.

    if ((node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/)[1].trim() !== node.id) {
      logger.error(__filename, 'line', __line, ' Error: ', err, '; Cannot parse node.REFERENCE_NUMBER');
      throw {
        name: 'IDError',
        message: '; Cannot parse node.REFERENCE_NUMBER'
      };
    }
    // for consistency, remove period from end of all reference numbers that have them; not all do.
    if (counter <= numObjectsToShow) {
      if (consoleLog) {
        logger.debug(__filename, 'line', __line, '; counter = ', counter, '; node.id = ', node.id);
//        logger.debug( __filename, 'line', __line, '; counter = ', counter, '; node with ids', node);
      }
    }
  });
};
var createIndivAliasString = function (singleAlias) {
  var aliasString, aliasName, aliasQuality; // = '';
  aliasName = singleAlias.ALIAS_NAME;
  aliasQuality = singleAlias.QUALITY;
  aliasString = aliasName + ' (' + aliasQuality + ')';
  return aliasString;
};

// some REFERENCE_NUMBERs in the source xml (including those in comments) have periods at the end; some don't; we remove all trailing periods for consistency.
var cleanUpRefNums = function (nodes) {
  counter = 0;
  nodes.forEach(function (node) {
    counter++;
    // var rawRefNum = node.REFERENCE_NUMBER.trim();
    // for consistency, remove period from end of all reference numbers that have them; not all do.
    var refNumRegexMatch;
    try {
      refNumRegexMatch = (node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
    } catch (err) {
      logger.error(__filename, 'line', __line, '; Error: ', err, '; node =', node, '; counter = ', counter);
    }
    try {
      node.REFERENCE_NUMBER = refNumRegexMatch[0].trim();
    } catch (err) {
      logger.error(__filename, 'line', __line, '; Error: ', err);
    }
    if (counter <= numObjectsToShow) {
      if (consoleLog) {
        logger.debug(__filename, 'line', __line, '; counter = ', counter, '; node.REFERENCE_NUMBER = ', node.REFERENCE_NUMBER);
      }
    }
  });
};

// legacy method
// create an array, connectedToId[], of linked-to ids in each node;
// create link objects for each link (source and target ids) and insert in each node
var addConnectionIdsArrayFromComments = function (nodes) {
  var comments;
  var linkRegexMatch;
  counter = 0;
  nodes.forEach(function (node) {
    node.connectionIdsFromCommentsSet = new Set();
    node.connectedToIdFromCommentsArray = [];
    node.links = [];
    node.linksSet = new Set();
    comments = node.COMMENTS1;

    var weHaveCommentsToParse = ((typeof comments !== 'null') && (typeof comments !== 'undefined') &&
    (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) !== 'undefined'));

    // if ((typeof comments !== 'undefined') && (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) !== 'undefined')) {
    if (weHaveCommentsToParse === true) {
      linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
      // we have at least one link in the comments
      if (linkRegexMatch !== null) {
        if (consoleLog && (node.nodeNumber % logModulus === 0)) {
          logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, '; node.id = ', node.id,
            '; node.name = ', node.name, '; has ', linkRegexMatch.length, 'link regex matches from comments');
        }
        // LOOP THROUGH EACH REGEX MATCH
        for (var linkFromCommentNumber = 0; linkFromCommentNumber < linkRegexMatch.length; linkFromCommentNumber++) {
          if (linkRegexMatch[linkFromCommentNumber] !== node.id) {
            node.connectionIdsFromCommentsSet.add(linkRegexMatch[linkFromCommentNumber]);
          }
        }
        node.connectionIdsFromCommentsSet.forEach(function (uniqueConnectionIdFromComments) {
          node.connectedToIdFromCommentsArray.push(uniqueConnectionIdFromComments);
          node.links.push(uniqueConnectionIdFromComments);
        });
      }
      if (consoleLog && (node.nodeNumber % logModulus === 0)) {
        logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, '; node.id = ', node.id, '; node.name = ', node.name, '; has node.connectionIdsFromCommentsSet set.length = ', node.connectionIdsFromCommentsSet.length);
      }
    } else {
      if (consoleLog && (node.nodeNumber % logModulus === 0)) {
        logger.debug(__filename, 'line', __line, '; counter = ', counter, '; node.id = ', node.id, '; node.name = ', node.name, '; has no comments to parse; node.COMMENTS1 = ', node.COMMENTS1);
      }
    }
  });
};

var addConnectionIdsArrayFromNarrative = function (node, narrative) {
  // ar nodeNarrFileName;
  var nodeNarrFileName = node.narrativeFileName;
  var linkRegexMatch;
  var narrFileName;
  // counter = 0;
  if (node.noLongerListed === 1) {
    logger.debug(__filename, 'line', __line, '; node summary = ', utilities_aq_viz.nodeSummary(node), ' is no longer listed.');
  }
  else {
    //  nodeNarrFileName = node.narrativeFileName;
    if (consoleLog) {
      logger.debug(__filename, 'line', __line, '; getting narrative file nodeNarrFileName = ', nodeNarrFileName, '\n truncateString(narrative) = ', truncateString(narrative), '; utilities_aq_viz.nodeSummary(node) = \n', utilities_aq_viz.nodeSummary(node));
    }
    // var narrWebPageAsString = utilities_aq_viz.forceUnicodeEncoding(narrative.toString());
    // trimmedNarrative = utilities_aq_viz.trimNarrative2(narrWebPageAsString, url);
    // trimmedLabeledNarrative = utilities_aq_viz.addFileLabel(trimmedNarrative, url);
    // writeNarrativesFilePath = __dirname + '/../data/narrative_summaries/' + nodeNarrFileName;
    // syncWriteHtmlFile(trimmedLabeledNarrative, writeNarrativesFilePath);
    // PARSE NARRATIVE FOR LINKS
    // addConnectionIdsArrayFromNarrative(node, narrative);

    node.connectionIdsFromNarrativeSet = new StrSet();
    node.connectedToIdFromNarrativeArray = [];
//    node.linksFromNarrArray = [];
//    node.linksSet = new Set();
    // narrative = node.Narrative1;

    var weHaveNarrativeToParse = ((typeof narrative !== 'null') && (typeof narrative !== 'undefined') &&
    (typeof narrative.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) !== 'undefined'));

    // if ((typeof Narrative !== 'undefined') && (typeof Narrative.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) !== 'undefined')) {
    if (weHaveNarrativeToParse === true) {
      linkRegexMatch = narrative.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
      // we have at least one link in the Narrative
      if (typeof linkRegexMatch !== 'null') {
        if (consoleLog && (node.nodeNumber % logModulus === 0)) {
          logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, '; node.id = ', node.id,
            '; node.name = ', node.name, '; has ', linkRegexMatch.length, 'link regex matches from Narrative');
        }
        // LOOP THROUGH EACH REGEX MATCH
        try {
          for (var linkFromNarrativeNumber = 0; linkFromNarrativeNumber < linkRegexMatch.length; linkFromNarrativeNumber++) {
            if (linkRegexMatch[linkFromNarrativeNumber] !== node.id) {
              node.connectionIdsFromNarrativeSet.add(linkRegexMatch[linkFromNarrativeNumber]);
            }
          }
        } catch (err) {
          logger.error(__filename, 'line', __line, '; Error: ', err);
        }
        node.connectionIdsFromNarrativeSet.forEach(function (uniqueConnectionIdFromNarrative) {
          node.connectedToIdFromNarrativeArray.push(uniqueConnectionIdFromNarrative);
          node.linksFromNarrArray.push(uniqueConnectionIdFromNarrative);
        });
      }
      if (consoleLog && (node.nodeNumber % logModulus === 0)) {
        logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, '; node.id = ', node.id, '; node.name = ', node.name, '; has node.connectionIdsFromNarrativeSet set.length = ', node.connectionIdsFromNarrativeSet.length);
      }
    } else {
      if (consoleLog && (node.nodeNumber % logModulus === 0)) {
        logger.debug(__filename, 'line', __line, '; counter = ', counter, '; node.id = ', node.id, '; node.name = ', node.name, '; has no narrative to parse.');
      }
    }
  }
};

// within each NODE, create array of connection objects with source and target
var addConnectionObjectsArrayFromComments = function (nodes) {
// for each node
  var connectionFromComments;
  // counter = 0;
  nodes.forEach(function (node) {
    // counter ++;
    node.connectionObjectsFromComments = [];
    var weHaveNodeConnectedToIdFromCommentsToParse = ((typeof node.connectedToIdFromCommentsArray !== 'null') && (typeof node.connectedToIdFromCommentsArray !== 'undefined'));
    if (weHaveNodeConnectedToIdFromCommentsToParse === true) {
      node.connectedToIdFromCommentsArray.forEach(function (connId) {
        if (node.id !== connId) {
          connectionFromComments = {};
          connectionFromComments.source = node.id;
          connectionFromComments.target = connId;
          node.connectionObjectsFromComments.push(connectionFromComments);
        }
        if (consoleLog) {
          if (node.nodeNumber % logModulus === 0) {
            logger.debug(__filename, 'line', __line, '; node.id = ', node.id, '; connectionFromComments = ', connectionFromComments);
          }
        }
      });
    }

  });
};

// within each NODE, create array of connection objects with source and target
var addConnectionObjectsArrayFromNarratives = function (nodes) {
// for each node
  var connectionFromNarrative; // the connection object
  counter = 0;
  nodes.forEach(function (node) {

    node.connectionObjectsFromNarrative = node.connectionObjectsFromNarrative || [];
    var weHaveNodeConnectedToIdFromNarrativeToParse = ((typeof node.connectedToIdFromNarrativeArray !== 'null') && (typeof node.connectedToIdFromNarrativeArray !== 'undefined'));
    if (weHaveNodeConnectedToIdFromNarrativeToParse === true) {
      node.connectedToIdFromNarrativeArray.forEach(function (connId) {
        if (node.id !== connId) {
          connectionFromNarrative = {};
          connectionFromNarrative.source = node.id;
          connectionFromNarrative.target = connId;
          node.connectionObjectsFromNarrative.push(connectionFromNarrative);
        }
        if (consoleLog) {
          if (node.nodeNumber % logModulus === 0) {
            logger.debug(__filename, 'line', __line, '; node.id = ', node.id, '; connectionFromNarrative = ', connectionFromNarrative);
          }
        }
      });
    }
  });
};

var concatNames = function (nodes) {
  counter = 0;
  nodes.forEach(function (node) {
    counter++;
    var name = '';
    var nameArray = [];
    var firstName = node.FIRST_NAME;
    var secondName = node.SECOND_NAME;
    var thirdName = node.THIRD_NAME;
    var fourthName = node.FOURTH_NAME;

    nameArray.push(node.FIRST_NAME);
    nameArray.push(node.SECOND_NAME);
    nameArray.push(node.THIRD_NAME);
    nameArray.push(node.FOURTH_NAME);
    var nameFromArray = nameArray.join(' ');

    if (firstName) {
      name = name.concat(firstName.trim());
    }
    if (secondName) {
      name = name.concat(' ', secondName.trim());
    }
    if (thirdName) {
      name = name.concat(' ', thirdName.trim());
    }
    if (fourthName) {
      name = name.concat(' ', fourthName.trim());
    }
    node.name = name.trim();
    if (consoleLog && (counter <= 10) && false) {
      logger.debug(__filename, 'line', __line, '; counter = ', counter, '; node.name = ', node.name, 'nameFromArray = ', nameFromArray);
    }
  });
};

var createNationality = function (nodes) {
  counter = 0;
  nodes.forEach(function (node) {
    counter++;
    if (typeof node.NATIONALITY !== 'undefined') {
      var nationality = node.NATIONALITY;
      if (typeof nationality.VALUE !== 'undefined') {
        node.natnlty = nationality.VALUE;
      }
    }
  });
};

// consolidate links from comments; remove duplicates, BUT DOES IT REALLY?
// create a top-level array of links containing a source and target
var consolidateLinksFromComments = function (data) {
  // if (consoleLog) { logger.debug( __filename, 'line',__line, '; data = ', data);
  if (consoleLog) {
    logger.debug(__filename, 'line', __line, '; data.nodes[0] = ', data.nodes[0]);
    logger.debug(__filename, 'line', __line, '; data.nodes[1] = ', data.nodes[1]);
  }
  data.links = [];
  var linksSet = new Set();
  // var linksMap = new Map();
  // var mapCounter = 1;
  var connectionObjectsFromCommentsCount = 0;
  (data.nodes).forEach(function (node) {
    if ((typeof node.connectionObjectsFromComments !== 'undefined') && (typeof node.connectionObjectsFromComments.length !== 'undefined') && (node.connectionObjectsFromComments.length > 0)) {
      connectionObjectsFromCommentsCount = connectionObjectsFromCommentsCount + node.connectionObjectsFromComments.length;
      node.connectionObjectsFromComments.forEach(function (conn) {
        if (linksSet.add(conn) === true) {
          data.links.push(conn);
        }
      });
    }
  });
  data.comments.links = data.links;
  if (consoleLog) {
    logger.debug(__filename, 'line', __line, '; connectionObjectsFromCommentsCount = ', connectionObjectsFromCommentsCount, '; linksSet.count = ', linksSet.count);
  }
  // linksSet = null;
};

// consolidate links from narratives; remove duplicates, BUT DOES IT REALLY?
// create a top-level array of links containing a source and target
var consolidateLinksFromNarrativeArray = function (data) {
  // if (consoleLog) { logger.debug( __filename, 'line',__line, '; data = ', data);
  data.links = [];
  var linksNarrSet = new Set();
  // var linksMap = new Map();
  // var mapCounter = 1;
  var connectionObjectsFromNarrativesCount = 0;
  (data.nodes).forEach(function (node) {
    if ((typeof node.connectionObjectsFromNarrative !== 'undefined') && (typeof node.connectionObjectsFromNarrative.length !== 'undefined') && (node.connectionObjectsFromNarrative.length > 0)) {
      connectionObjectsFromNarrativesCount = connectionObjectsFromNarrativesCount + node.connectionObjectsFromNarrative.length;
      node.connectionObjectsFromNarrative.forEach(function (conn) {
        if (linksNarrSet.add(conn) === true) {
          data.narratives.links.push(conn);
        }
      });
// node.linkCount = node.connectionObjectsFromNarrative.length;
    }
  });
  data.links = data.narratives.links;
  // data.comments.links = data.links;
  if (consoleLog) {
    logger.debug(__filename, 'line', __line, '; connectionObjectsFromNarrativesCount = ', connectionObjectsFromNarrativesCount, '; linksNarrSet.count = ', linksNarrSet.count);
  }
  // linksSet = null;
};

var checkNodeExistsById = function (nodeId) {
  var consoleLogValueToBeRestored = consoleLog;
  consoleLog = false;
  var nodeIdsSet = new StrSet();
  nodes.forEach(function (node) {
    nodeIdsSet.add(node.id);
  });
  if (!nodeIdsSet.exists(nodeId)) {
    logger.debug(__filename, 'line', __line, ', nodeId = ', nodeId, ' DOES NOT EXIST as as node. generateNarrFileNameFromId = ', utilities_aq_viz.generateNarrFileNameFromId(linkTarget), ';  missingNodesNarrativesCount = ', missingNodesNarrativesCount, '; nodeSummary = ', utilities_aq_viz.nodeSummary(node));
    return false;
  } else {
    return true;
  }

  consoleLog = consoleLogValueToBeRestored;
};

var checkTargetsExist = function (nodes, links) {
  var consoleLogValueToBeRestored = consoleLog;
  consoleLog = false;
  var nodeTargetIdsFromNarrativeSet = new StrSet();
  var nodeTargetIdsFromCommentsSet = new StrSet();
  var nodeIdsSet = new StrSet();
  nodes.forEach(function (node) {
    nodeIdsSet.add(node.id);
  });
  var missingNodesCommentsCount = 0;
  var missingNodesNarrativesCount = 0;
  nodes.forEach(function (node) {
    node.connectionObjectsFromComments.forEach(function (connectionFromComment) {
      if (!nodeIdsSet.exists(connectionFromComment.target)) {
        missingNodesCommentsCount++;
        logger.debug(__filename, 'line', __line, ', connectionFromComment: ', connectionFromComment, ' DOES NOT EXIST. missingNodesCommentsCount = ', missingNodesCommentsCount);
      }
    });
    node.linksFromNarrArray.forEach(function (linkTarget) {
      if (!nodeIdsSet.exists(linkTarget)) {
        missingNodesNarrativesCount++;
        logger.debug(__filename, 'line', __line, ', linkTarget = ', linkTarget, ' DOES NOT EXIST. generateNarrFileNameFromId = ', utilities_aq_viz.generateNarrFileNameFromId(linkTarget), ';  missingNodesNarrativesCount = ', missingNodesNarrativesCount, '; nodeSummary = ', utilities_aq_viz.nodeSummary(node));
      }
      nodeTargetIdsFromNarrativeSet.add(linkTarget);
    })
  });
  if (consoleLog) {
    logger.debug(__filename, 'line', __line, '; the total number of links between nodes is (i.e., links.length = ) ', links.length);
    logger.debug(__filename, 'line', __line, '; the total number of unique link target nodes from narratives is ', nodeTargetIdsFromNarrativeSet.count);
    logger.debug(__filename, 'line', __line, '; the total number of unique link target nodes from comments is ', nodeTargetIdsFromCommentsSet.count);
    logger.debug(__filename, 'line', __line, '; missingNodesCommentsCount = ', missingNodesCommentsCount);
    logger.debug(__filename, 'line', __line, '; missingNodesNarrativesCount = ', missingNodesNarrativesCount);
  }

  consoleLog = consoleLogValueToBeRestored;
};

var createIndivDateOfBirthString = function (d) {
  var dateString = '',
    rawDateString;
  if (typeof d['INDIVIDUAL_DATE_OF_BIRTH']['DATE'] !== 'undefined' && d['INDIVIDUAL_DATE_OF_BIRTH']['DATE'] !== '') {
    rawDateString = formatDate(d['INDIVIDUAL_DATE_OF_BIRTH']['DATE']);
    dateString += vizFormatDateSetup(rawDateString);
  } else if (typeof d['INDIVIDUAL_DATE_OF_BIRTH']['YEAR'] !== 'undefined') {
    dateString += d['INDIVIDUAL_DATE_OF_BIRTH']['YEAR'];
  }
  if (typeof d['INDIVIDUAL_DATE_OF_BIRTH']['TYPE_OF_DATE'] !== 'undefined' && d['INDIVIDUAL_DATE_OF_BIRTH']['TYPE_OF_DATE'] !== '') {
    dateString += ' (' + d['INDIVIDUAL_DATE_OF_BIRTH']['TYPE_OF_DATE'] + ')';
  }
  return dateString;
};

var createDateGeneratedMessage = function () {
  var dateListGeneratedString = data.dateGenerated;
  var dateListGenerated = new Date(dateListGeneratedString);
  dateFormat.masks.shortDate = 'mm-dd-yyyy';
  dateFormat.masks.friendly_display = 'dddd, mmmm dS, yyyy';
  generatedFileDateString = vizFormatDateSetup(dateListGenerated);
  var message = 'Collected consolidated.xml labeled as generated on: ' + dateListGeneratedString + ' [' + dateListGenerated + ']';
  data.message = message;
  logger.debug([__filename, ' line ', __line + '; ', message].join(''));
};

var createIndivPlaceOfBirthString = function (singlePob) {
  var pobString = '';
  if (typeof singlePob !== 'undefined' && singlePob !== '') {
    var keys = getKeys(singlePob);
    keys.forEach(function (key) {
        if (typeof singlePob[key] !== 'undefined' && singlePob[key] !== '') {
          pobString += singlePob[key];
          pobString += ', ';
        }
      }
    );
  }
  return pobString;
};

// for DOB, etc.
var formatDate = function (intlDateString) {
  var dateResultString;
  var date = new Date(intlDateString);
  dateFormat.masks.shortDate = 'mm-dd-yyyy';
  try {
    dateResultString = dateFormat(date, 'shortDate');
  } catch (err) {
    logger.error('769 Error: ', err, '; intlDateString = ', intlDateString);
  }
  // logger.debug(__filename + ' line ' + __line + '; ' + dateResultString);
  return dateResultString;
};

//  clean up ids for consistency;  none should have trailing period.
var getCleanId = function (referenceNumber) {
  var refNumRegexMatch;
  var result1, result2, result3;
// correct typos in narrative ids
  try {
    result1 = referenceNumber.replace(/\.\./gi, '.');
    result2 = result1.replace(/QIA/gi, 'QI.A');
    result3 = result2.replace(/Q\.E\.262\.08/gi, 'QI.E.262.08');
//    logger.debug(__filename, 'line', __line, '; refNumRegexMatch =', refNumRegexMatch, '; referenceNumber = ', referenceNumber);
  } catch (err) {
    logger.error(__filename, 'line', __line, '; Error: ', err, '; referenceNumber =', referenceNumber);
  }

  try {
    refNumRegexMatch = result3.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
    // logger.debug(__filename, 'line', __line, '; refNumRegexMatch =', refNumRegexMatch, '; referenceNumber = ', referenceNumber);
  } catch (err) {
    logger.error(__filename, 'line', __line, '; Error: ', err, '; referenceNumber =', referenceNumber, '; counter = ', counter);
  }
  return refNumRegexMatch[0].trim();
};

var getKeys = function (pob) {
  var keys = [];
  for (var key in pob) {
    keys.push(key);
//    logger.debug('pob[key] = ', pob[key]); //, '; pob[value]', pob.valueOf(key));
  }
  return keys;
};

// count the unique links for each node
var countLinks = function (data) {
  var linkCounter;
  // loop through each node
  data.nodes.forEach(function (node) {
    linkCounter = 0;
    // linkCounter = 0;
    var keySet = new Set();
    var keyAdded1, keyAdded2;
    var linkConcatKey1, linkConcatKey2;
    // loop through each link
    data.links.forEach(function (link) {
      // delete a link if source and target are the same
      if (link.source === link.target) {
        delete data.link;
        logger.debug(__filename, 'line', __line, 'deleted ', data.link, ' because link.source === link.target');
      } else {
        // increment the link count if the node.id is either the link source or link target
        if (node.id === link.source || node.id === link.target) {
          linkConcatKey1 = link.source + link.target;
          linkConcatKey2 = link.target + link.source;
          keyAdded1 = keySet.add(linkConcatKey1);
          keyAdded2 = keySet.add(linkConcatKey2);
          if (keyAdded1 && keyAdded2) {
            linkCounter++;
          }
        }
      }
    });
    node.linkCount = linkCounter;
//    node.linkCount = node.connectionObjectsFromNarrative.length;
    if (node.nodeNumber % logModulus === 0) {
      // logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, '; linkCounter = ', linkCounter);
//      logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, '; node.links.length = ', node.links.length, 'node.linksFromNarrArray.length = ', node.linksFromNarrArray.length, '; ', node.links.length, '/', node.linksFromNarrArray.length);
    }
  });
};

var processDateUpdatedArray = function (d) {
  var dateUpdatedArrayString = '';
  if (typeof d['LAST_DAY_UPDATED'] === 'undefined') {
    d.lastDateUpdatedCount = 0;
    //  return '';
  } else if (Object.prototype.toString.call(d['LAST_DAY_UPDATED']['VALUE']) === '[object Array]') {
    // logger.debug( __filename, 'line', __line, '; processDateUpdatedArray() found  Array!', d['LAST_DAY_UPDATED']);
    var lastDateUpdatedArray = d['LAST_DAY_UPDATED']['VALUE'];
    d.lastDateUpdatedCount = lastDateUpdatedArray.length;
    for (var i = 0; i < lastDateUpdatedArray.length; i++) {
      dateUpdatedArrayString += vizFormatDateSetup(lastDateUpdatedArray[i]);
      if (i < (lastDateUpdatedArray.length - 1)) {
        dateUpdatedArrayString += ', ';
      }
    }
  } else {
    d.lastDateUpdatedCount = 1;
    dateUpdatedArrayString += vizFormatDateSetup(d['LAST_DAY_UPDATED']['VALUE']);
  }
  return dateUpdatedArrayString;
};

var processAliasArray = function (d) {
  var aliasArrayString = '';
  if (!(d['INDIVIDUAL_ALIAS'])) {
    d.aliasCount = 0;
    return '';
  }
  if (Object.prototype.toString.call(d['INDIVIDUAL_ALIAS']) === '[object Array]') {
    // logger.debug( __filename, 'line', __line, '; processAliasArray() found  Array!', d['INDIVIDUAL_PLACE_OF_BIRTH']);
    var aliasArray = d['INDIVIDUAL_ALIAS'];
    d.aliasCount = aliasArray.length;
    for (var i = 0; i < aliasArray.length; i++) {
      aliasArrayString += createIndivAliasString(aliasArray[i]);
      aliasArrayString += '; ';
    }
  } else {
    d.aliasCount = 1;
    aliasArrayString += createIndivAliasString(d['INDIVIDUAL_ALIAS']);
  }
  return aliasArrayString;
};

var processPlaceOfBirthArray = function (d) {
  var pobArrayString = '';
  if (typeof d['INDIVIDUAL_PLACE_OF_BIRTH'] !== 'undefined') {
    if (Object.prototype.toString.call(d['INDIVIDUAL_PLACE_OF_BIRTH']) === '[object Array]') {
      // logger.debug( __filename, 'line', __line, ';  Array!', d['INDIVIDUAL_PLACE_OF_BIRTH']);
      var pobArray = d['INDIVIDUAL_PLACE_OF_BIRTH'];
      // var pobArrayString;
      for (var i = 0; i < pobArray.length; i++) {
        pobArrayString += createIndivPlaceOfBirthString(pobArray[i]);
        pobArrayString += '; ';
      }
    } else {
      pobArrayString += createIndivPlaceOfBirthString(d['INDIVIDUAL_PLACE_OF_BIRTH']);
    }
  }
  return pobArrayString;
};

var sortArrayOfStrings = function (arrayOfStrings) {
  arrayOfStrings.sort(function (stringA, stringB) {
    if (stringA > stringB) {
      return 1;
    }
    if (stringA < stringB) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
};

var syncGetHtmlAsUnicodeString = function (url) {
  // try {
  var res;
  res = requestSync('GET', url);
  var responseBody = res.body.toString();
  var htmlString = utilities_aq_viz.forceUnicodeEncoding(responseBody);
//  utilities_aq_viz.syncWriteMyFile(saveFilePath, narrative, fsOptions);
  return htmlString.trim();
  // } catch (err) {
  // logger.error('\n ', __filename, 'line', __line, '; Error: ', err);
  //}
};

// collect a named file from an Internet host and save it locally; specify indivOrEntityString equals a string either 'entity' or 'indiv'
// save to json file: narrativeLinksLocalFileNameAndPath
var syncWriteHtmlFile = function (htmlString, saveFilePath) {
  var unicodeHtmlString = utilities_aq_viz.forceUnicodeEncoding(htmlString);
  utilities_aq_viz.syncWriteMyFile(unicodeHtmlString, saveFilePath, fsOptions);
  return true;
};

var testMethod = function () {
  console.log("running testMethod");
};

var truncateString = function (inString) {
  var outString = '[TRUNCATED]' + inString.substring(0, substringChars) + '\n ... [CONSOLE LOG OUTPUT INTENTIONALLY TRUNCATED TO FIRST ' + substringChars + ' CHARACTERS]';
  return outString + ' ;-)';
};

var vizFormatDateSetup = function (dateString) {
  var m_names = ['January', 'February', 'March',
    'April', 'May', 'June', 'July', 'August', 'September',
    'October', 'November', 'December'];

  var d = new Date(dateString);
  var curr_date = d.getDate();
  var curr_month = d.getMonth();
  var curr_year = d.getFullYear();

  var vizDateString = curr_date + ' ' + m_names[curr_month]
    + ' ' + curr_year;
  // logger.debug('viz.js 947 vizFormatDate() dateString = ', dateString);
  return vizDateString.trim();
};

var writeMyFile = function (localFileNameAndPath, data, fsOptions) {
  try {
    fse.writeFileSync(localFileNameAndPath, data, fsOptions);
  } catch (err) {
    logger.error(__filename, 'line', __line, ' Error: ', err);
  }
};

start();

module.exports = {
  collect: collect
};


