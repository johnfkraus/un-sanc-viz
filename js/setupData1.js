// setupData1.js
// put data in arrays for d3, normalize
// each node in the main json data file (represented by the 'data' variable) contains data on a single individual or
// entity listed in the AQList.xml sanctions data file collected from the U.N. site located at http://www.un.org/sc/committees/1267/.
//==========================

// do we want lots of console.log messages for debugging (if so, set consoleLog = true)
var consoleLog = true;
var __filename = __filename || {};
var linenums = require('./linenums.js');
// var __line = __line || {};
if (typeof define !== 'function') {
  var define = require('amdefine');
}

//var narrFileName;
var collect = require('./collect.js'),
  missingNodes = require('./missing_nodes.js'),
  async = require('async'),
  trunc = require('./trunc.js'),
  re = require('request-enhanced'),
  logger = require('./libs/logger.js'),
  request = require('request'),
  fse = require('fs-extra'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect');
// var narrative_links_from_comments;
var utilities_aq_viz = require('./utilities_aq_viz');
var counter = 0;
var numObjectsToShow = 2;
var data = {};
var generatedFileDateString;
var Set = require('backpack-node').collections.Set;
var Bag = require('backpack-node').collections.Bag;
var Map = require('backpack-node').collections.Map;

var fsOptions = {
  flags: 'r+', encoding: 'utf-8', autoClose: true
};
var jsonFile = '';
var dateGenerated;

var fixData = function () {
  if (consoleLog) {
    console.log('\n ', __filename, 'line', __line, '; running setupData.fixData()');
  }
  var functionCount = 0;
  var linksFromComments = [];
  var linkRegexMatch;
  var missing_ents;
  var missing_indivs;
  var config;
  var consolidatedList;

  async.series([
      // read 'raw' unprocessed json file created from raw XML file data feed
      function (callback) {
        var rawJsonFileName = __dirname + '/../data/output/AQList-raw.json';
        consolidatedList = JSON.parse(fse.readFileSync(rawJsonFileName));
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; read the raw json data file');
        }
        callback();
      },

      // save the intermediate file for debugging
      function (callback) {
        saveJsonFile(consolidatedList, 'data01-loadedRaw.json');

        callback();
      },

      // misc normalization
      // put all the individual and entity nodes in a single array and add a property to identify node as indiv or ent
      // from local file, add no-longer-listed and otherwise missing ents and indivs to nodes
      // normalize indiv.indivDobString, indiv.indivPlaceOfBirthString, indiv.indivAliasString
      // archive a dated copy of AQList.xml for potential future time series analysis
      // normalize reference numbers, ids, name strings, nationality.
      function (callback) {
        data.entities = consolidatedList.CONSOLIDATED_LIST.ENTITIES.ENTITY;
        data.indivs = consolidatedList.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL;
        data.entities.forEach(function (entity) {
          entity.noLongerListed = 0;
        });
        data.indivs.forEach(function (indiv) {
          indiv.noLongerListed = 0;
        });
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
          // console.log('indiv.indivDobString = ', indiv.indivDobString);
        });
        data.entities = data.entities.concat(missingEnts);
        // data.entities = data.entities.concat(missingNodes.getMissingEnts());
        // indiv0OrEnt1 1 = entity; 0 = individual
        data.entities.forEach(function (entity) {
          entity.indiv0OrEnt1 = 1;
        });
        data.nodes = data.indivs.concat(data.entities);
        data.dateGenerated = formatMyDate(consolidatedList.CONSOLIDATED_LIST.$.dateGenerated);
        data.dateCollected = formatMyDate(new Date());
        data.nodes.forEach(function (node) {
          node.dateUpdatedString = processDateUpdatedArray(node);
          node.narrativeFileName = '';
        });

        var generatedFileDateString = dateFormat(data.dateGenerated, 'yyyy-mm-dd');
        var archiveFileNameAndPath = __dirname + '/../data/archive_historical/AQList-' + generatedFileDateString + '.xml';
//       archiveRawSource(archiveFile);
        collect.writeAQListXML(archiveFileNameAndPath);
        createDateGeneratedMessage();
        delete data.entities;
        delete data.indivs;
        consolidatedList = null;
        cleanUpRefNums(data.nodes);
        cleanUpIds(data.nodes);
        // node.id = getCleanId(node.REFERENCE_NUMBER);
        concatNames(data.nodes);
        createNationality(data.nodes);
        if (consoleLog) {
          console.log(__filename, 'line', __line, '; function #:', ++functionCount, '; put data into nodes array for d3');
          console.log(__filename, 'line', __line, '; JSON.stringify(data).substring(0, 800) = \n', JSON.stringify(data, null, ' ').substring(0, 800));
        }
        callback();
      },
      // save intermediate data file for debugging
      function (callback) {
        var saveJsonFileName = 'setupData1' + __line + '-flattened.json';
        saveJsonFile(data, saveJsonFileName); // 'setupData1' + __line + '-flattened.json');

        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; wrote file to: ', saveJsonFileName, ';  file contained (truncated): ', JSON.stringify(data, null, ' ').substring(0, 800), ' ... [CONSOLE LOG OUTPUT INTENTIONALLY TRUNCATED TO FIRST 2,400 CHARACTERS]\n\n');
        }
        callback();
      },

      // put nodes and node ids into a set
      // Re SET: https://www.npmjs.org/package/backpack-node
      function (callback) {
        counter = 0;
        var setOfNodes = new Set();
        var setOfNodeIds = new Set();
        data.nodes.forEach(function (node) {
          counter++;
          setOfNodes.add(node);
          setOfNodeIds.add(node.id);
          if (counter !== setOfNodeIds.count) {
            console.log('\n ', __filename, 'line', __line, '; node.id = ', node.id, '; counter = ', counter, '; setOfNodeIds.count = ', setOfNodeIds.count, '; \n(counter === setOfNodeIds.count) = ', counter === setOfNodeIds.count, '; node.id ', node.id, ' is a duplicate.');
            counter = counter - 1;
          }
        });
        if (consoleLog) {
          console.log(__filename, 'line', __line, '; function #:', ++functionCount, '; put nodes into a set', '; typeof data = ', typeof data,
            '; started with ', data.nodes.length, ' nodes in data.nodes array', '; counter = ', counter, '; setOfNodes.count = ', setOfNodes.count, '; setOfNodeIds.count = ', setOfNodeIds.count);
        }
        callback();
      },
      // put nodes into nodeBag
      // https://www.npmjs.org/package/backpack-node
      function (callback) {
        var nodeBag = new Bag();
        counter = 0;
        data.nodes.forEach(function (node) {

          if (consoleLog & counter < 40) {
            console.log(__filename, 'line', __line, '; counter = ', counter, '; node.id = ', node.id);
          }
          node.id = getCleanId(node.REFERENCE_NUMBER);
          if (!(node.id)) {
            node.id = 'NODE' + counter;
          }
          nodeBag.add(node.id, node);
          // console.log('\n ', __filename, 'line', __line, 'counter = ', counter ,'; nodeBag.length = ', nodeBag.count);
          if (consoleLog && counter < 40) {
            console.log(__filename, 'line', __line, 'Bag counter = ', counter);
          }
          counter++;
        });

        callback();
      },

      // save intermediate data file for debugging
      function (callback) {
        saveJsonFile(data, 'setupData1-data03nodeBag.json');
        callback();
      },

      // normalize node.id; put nodes into nodeBag2
      function (callback) {
        var nodeBag2 = new Bag();
        counter = 0;
        data.nodes.forEach(function (node) {
          node.id = getCleanId(node.REFERENCE_NUMBER);
          nodeBag2.add(node.id, node);
          counter++;
        });
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, 'nodeBag2 counter = ', counter, '; nodeBag2._map.count = ', nodeBag2._map.count);
        }
        callback();
      },

      // save intermediate data file for debugging
      function (callback) {
        saveJsonFile(data, 'setupData1-data05nodebagset.json');
        callback();
      },

      // ADD CONNECTION IDS ARRAY from comments
      function (callback) {
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; addConnectionIdsArrayFromComments(data.nodes)');
        }
        addConnectionIdsArrayFromComments(data.nodes);
        if (consoleLog) {
          console.log(data.nodes[1]);
        }
        callback();
      },
      /*
       // ADD CONNECTION IDS ARRAY from narratives
       function (callback) {
       if (consoleLog) {
       console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; addConnectionIdsArrayFromComments(data.nodes)');
       }
       addConnectionIdsArrayFromLongNarratives(data.nodes);
       if (consoleLog) {
       console.log(data.nodes[1]);
       }
       callback();
       },
       */

      // save intermediate file for debugging
      function (callback) {
        saveJsonFile(data, 'data06addConnectionIdsArray.json');
        callback();
      },

      // ADD CONNECTION OBJECTS ARRAY
      function (callback) {
        addConnectionObjectsArrayFromComments(data.nodes);
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; addConnectionObjectsArrayFromComments');
          console.log(data.nodes[1]);
        }
        callback();
      },

      function (callback) {
        saveJsonFile(data, 'data07addConnectionOBJECTSarray.json');
        callback();
      },

      // CONSOLIDATE LINKS INTO LINKS ARRAY
      function (callback) {
        consolidateLinksFromComments(data);
        if (consoleLog) {
          console.log('\n 283 function #:', ++functionCount, '; consolidate linksFromComments into linksFromComments array');
          console.log('\n ', __filename, 'line', __line, '; data.nodes[1] = ', data.nodes[1]);
          console.log('\n ', __filename, 'line', __line, '; data.linksFromComments.length = ', data.linksFromComments.length);
        }
        callback();
      },
      // save intermediate data file for debugging
      function (callback) {
        saveJsonFile(data, 'setupData1-data08aconsolidateLinksFromComments.json');
        callback();
      },

      // stringify and save json data for later processing
      function (callback) {
        if (consoleLog) {
          console.log(__filename, 'line', __line, '; function #:', ++functionCount, '; save clean json file');
        }
        // var saveJson = function () {
        try {
          var myFile = __dirname + '/../data/output/AQList-clean.json';
          var myJsonData = JSON.stringify(data, null, ' ');
          fse.writeFileSync(myFile, myJsonData, fsOptions);
          if (consoleLog) {
            console.log(__filename, 'line', __line, ';  file written to: ', myFile, ';  file contained: ', truncateString(JSON.stringify(myJsonData, null, ' '), 200));
          }
        } catch (e) {
          console.log(__filename, 'line', __line, ';  Error: ', e);
          callback();
        }
        callback();
      },

      // read the main json file containing nodes and links
      function (callback) {
        var cleanJsonFileName = __dirname + '/../data/output/AQList-clean.json';
        try {
          var buffer = fse.readFileSync(cleanJsonFileName); //, fsOptions); //, function (err, data) {
          data = JSON.parse(buffer);
        } catch (err) {
          console.log('\n ', __filename, 'line', __line, '; Error: ', err);
        }
        if (consoleLog) {
          console.log(__filename, 'line', __line, '; function #:', ++functionCount);
          console.log(__filename, 'line', __line, '; data read from: \n', cleanJsonFileName);
          console.log(__filename, 'line', __line, '; data = \n', trunc.truncn(JSON.stringify(data), 200));
        }
        callback();
      },

      // read json file containing config
      function (callback) {
        var configJsonFileName = __dirname + '/../data/input/config.json';
        var buffer = fse.readFileSync(configJsonFileName); //, fsOptions); //, function (err, data) {
        config = JSON.parse(buffer);
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount);
          console.log('\n ', __filename, 'line', __line, '; config data read from: \n', configJsonFileName);
          console.log('\n ', __filename, 'line', __line, '; config = \n', trunc.truncn(JSON.stringify(config), 200));
        }
        callback();
      },
      /*
       // using links from data file, parse the narratives
       function (callback) {
       var longNarrativeFileNameMissing;
       var narrative;
       var narrCounter = 0;
       var responseString;
       var readFilePath;
       var node;
       var nodeNarrFileName;
       console.log('\n ', __filename, 'line', __line, '; function #2:', ++functionCount, '; ');
       // read the data file
       try {
       data = JSON.parse(fse.readFileSync(__dirname + '/../data/output/AQList-clean.json'));
       } catch (err) {
       console.log('\n ', __filename, 'line', __line, '; Error: ', err);
       }
       nodes = data.nodes;
       for (var ldi = 0; ldi < nodes.length; ldi++) {
       // narrCounter++;
       node = nodes[ldi];
       longNarrativeFileNameMissing = (typeof(node.narrativeFileName) === 'null' || typeof(node.narrativeFileName) === 'undefined');
       if (longNarrativeFileNameMissing) {
       console.log('\n ', __filename, 'line', __line, '; ldi = ', ldi, '; longNarrativeMissing = ', longNarrativeFileNameMissing, '\n node.narrativeFileName = ', node.narrativeFileName, '; node = ', node, "\n\n");
       node.narrativeFileName = generateNarrFileName(node);
       }

       nodeNarrFileName = node.narrativeFileName;
       readFilePath = __dirname + '/../data/narrative_summaries/' + nodeNarrFileName;
       try {
       narrative = fse.readFileSync(readFilePath, fsOptions);
       console.log('\n ', __filename, 'line', __line, '; getting file ldi = ', ldi, '; readFilePath = ', readFilePath, '\n narrative.substring(0, 300) = ', narrative.substring(0, 300), " [INTENTIONALLY TRUNCATED TO FIRST 300 CHARACTERS]");
       } catch (err) {
       console.log('\n ', __filename, 'line', __line, '; Error: ', err);
       }

       // do something with the long narrative file

       }
       callback();
       },
       */
      // COUNT LINKS
      function (callback) {
        countLinksFromComments(data);
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; countLinks2');
          console.log('\n ', __filename, 'line', __line, '; data.nodes[1] = ', data.nodes[1]);
        }
        callback();
      },

      // CHECK TARGETS EXIST
      function (callback) {
        var nodes = data.nodes;
        var linksFromComments = data.linksFromComments;
        checkTargetsExist(nodes, linksFromComments);
        callback();
      },
      // number the nodes starting with zero; COUNT NODES, PRINT NODE IDS
      function (callback) {
        numberTheNodes(data);
        var nodeCounter = 0;
        data.nodes.forEach(function (node) {
          nodeCounter++;
          if (consoleLog && (nodeCounter % 17) === 1) {
            console.log(__filename, 'line', __line, '; node #', nodeCounter, 'node.id = ', node.id);
          }
        });
        callback();
      },

      // which node has the most links?
      function (callback) {
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount);
          console.log('\n ', __filename, 'line', __line, '; data.nodes[155] = ', data.nodes[155]);
        }
        counter = 0;
        var maxLinkCount = 0;
        var maxLinkId = '';
        data.nodes.forEach(function (node) {
          counter++;
          if (node.linksFromCommentsCount > maxLinkCount) {
            maxLinkCount = node.linksFromCommentsCount;
            maxLinkId = node.id;
          }
        });
        data.maxLinksFromComments = {'count': maxLinkCount, 'id': maxLinkId};
//        data.maxLinks = null;
//        data.maxLinks.count = maxLinkCount;
//        data.maxLinks.id = maxLinkId;
        console.log('\n ', __filename, 'line', __line, '; counter = ', counter, '; maxLinkId = ', maxLinkId, '; maxLinkCount = ', maxLinkCount);
        counter = 0;
        data.linksFromComments.forEach(function (linkFromComments) {
          counter++;
          if (counter <= numObjectsToShow) {
            if (consoleLog) {
              console.log('\n ', __filename, 'line', __line, '; counter = ', counter, '; linkFromComments/varlink = ', linkFromComments);
            }
          }
        });
        callback();
      },

      // stringify and save json data
      function (callback) {
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; save clean json file');
        }
        // var saveJson = function () {
        try {
          var myFileNameAndPath = __dirname + '/../data/output/AQList-clean.json';
          var myJsonData = JSON.stringify(data, null, ' ');
          fse.writeFileSync(myFileNameAndPath, myJsonData, fsOptions);
          if (consoleLog) {
            console.log(__filename, 'line', __line, ';  file written to: ', myFileNameAndPath, ';  file contained myJsonData = ', truncateString(myJsonData));
          }
        } catch (e) {
          console.log('\n ', __filename, 'line', __line, ';  Error: ', e);
          callback();
        }
        callback();
      },

      // last function; does nothing
      function (callback) {
        var dummy = function () {
          if (consoleLog) {
            console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount);
            console.log('\n ', __filename, 'line', __line, '; last function; does nothing');
          }

        }();
        callback();
      }]
  );
};

// END OF ASYNC ARRAY

var formatMyDate = function (dateString) {
  var now = new Date();
  dateFormat.masks.friendly_detailed = 'dddd, mmmm dS, yyyy, h:MM:ss TT';
  dateFormat.masks.friendly_display = 'dddd, mmmm dS, yyyy';
  dateFormat.masks.file_generated_date = 'yyyy-mm-dd';
  dateFormat.masks.common = 'mm-dd-yyyy';
// Basic usage
// dateFormat.masks.hammerTime = 'yyyy-mm-dd-HHMMss';
// var displayDateString = dateFormat(now, 'friendly_display');
// Saturday, June 9th, 2007, 5:46:21 PM
// var fileDateString = dateFormat(now, 'hammerTime');
//    var dateAqListGeneratedString = data.dateGenerated;
  var date = new Date(dateString);
//    dateFormat.masks.friendly_display = 'dddd, mmmm dS, yyyy';
  var formattedDate = dateFormat(date, 'common');
//    var message = 'Collected AQList.xml labeled as generated on: ' + dateAqListGeneratedString + ' [' + dateAqListGenerated + ']';
//    data.message = message;
  logger.log_message(__filename + ' line ' + __line + '; formattedDate = ' + formattedDate);
  return formattedDate;
};

var cleanUpIds = function (nodes) {
  counter = 0;
  nodes.forEach(function (node) {
    counter++;
    // var rawRefNum = node.REFERENCE_NUMBER;
    // remove period from end of all reference numbers that have them; not all do.
    var refNumRegexMatch;
    try {
      refNumRegexMatch = (node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
    } catch (error) {
      if (consoleLog) {
        console.log('\n ', __filename, 'line', __line, '; Error: ', error, '; node =', node, '; counter = ', counter);
      }
    }
    //  clean up indiv id for consistency;  none should have trailing period.
    node.id = refNumRegexMatch[1].trim();
    if ((node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/)[1].trim() !== node.id) {
      throw 'id error';
    }
    // for consistency, remove period from end of all reference numbers that have them; not all do.
    if (counter <= numObjectsToShow) {
      if (consoleLog) {
        console.log(__filename, 'line', __line, '; counter = ', counter, '; node.id = ', node.id);
//        console.log('\n ', __filename, 'line', __line, '; counter = ', counter, '; node with ids', node);
      }
    }
  });
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
    } catch (error) {
      console.log('\n ', __filename, 'line', __line, '; Error: ', error, '; node =', node, '; counter = ', counter);
    }
    try {
      node.REFERENCE_NUMBER = refNumRegexMatch[0].trim();
    } catch (err) {

    }
    if (counter <= numObjectsToShow) {
      if (consoleLog) {
        console.log(__filename, 'line', __line, '; counter = ', counter, '; node.REFERENCE_NUMBER = ', node.REFERENCE_NUMBER);
      }
    }
  });
};

//  clean up ids for consistency;  none should have trailing period.
var getCleanId = function (referenceNumber) {
  var refNumRegexMatch;
  try {
    refNumRegexMatch = referenceNumber.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
  } catch (err) {
    console.log('\n ', __filename, 'line', __line, '; Error: ', err, '; referenceNumber =', referenceNumber, '; counter = ', counter);
  }
  return refNumRegexMatch[0].trim();
};

var concatNames = function (nodes) {
  counter = 0;
  nodes.forEach(function (node) {
    counter++;
    var name = '';
    var firstName = node.FIRST_NAME;
    var secondName = node.SECOND_NAME;
    var thirdName = node.THIRD_NAME;
    var fourthName = node.FOURTH_NAME;
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
    if (counter <= 10) {
      if (consoleLog) {
        console.log(__filename, 'line', __line, '; node.name = ', node.name);
      }
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
/*
 // create an array of links within each entity/indiv containing ids of related parties
 var addLinksArray = function (nodes) {
 var comments;
 var linkRegexMatch;
 data.nodes.forEach(function (node) {

 node.linkedIds = [];
 comments = node.COMMENTS1;
 if ((typeof comments != 'undefined') && (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) != 'undefined')) {
 linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
 // if (consoleLog) { console.log('91 linkRegexMatch = ', linkRegexMatch);
 if ((typeof(linkRegexMatch) !== 'undefined') && (linkRegexMatch !== null)) {
 for (var n = 0; n < linkRegexMatch.length; n++) {
 if (node.id === linkRegexMatch[n].trim()) {
 // don't include a link from a node to itself
 if (consoleLog) {
 console.log('node id error' + node.id + ' ===  ' + linkRegexMatch[n].trim());
 throw 'node links to itself error';
 }
 } else {
 node.linkedIds.push(linkRegexMatch[n].trim());
 }
 }
 }
 }
 });
 };
 */
// legacy method
// create an array, connectedToId[], of linked-to ids in each node;
// create link objects for each link (source and target ids) and insert in each node
var addConnectionIdsArrayFromComments = function (nodes) {
  // throw commenterror;
  var loopStop;
  var comments;
  var linkRegexMatch;
  counter = 0;
  nodes.forEach(function (node) {
    node.connectionIdsFromCommentsSet = new Set();
    node.connectedToIdFromCommentsArray = [];
    node.linksFromComments = [];
    node.linksFromCommentsSet = new Set();
    comments = node.COMMENTS1;

    var weHaveCommentsToParse = ((typeof comments !== 'null') && (typeof comments !== 'undefined') &&
    (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) !== 'undefined'));

    // if ((typeof comments !== 'undefined') && (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) !== 'undefined')) {
    if (weHaveCommentsToParse === true) {
      linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
      if (linkRegexMatch !== null) {
        if (consoleLog & counter < 40) {
          console.log(__filename, 'line', __line, '; counter = ', counter, '; node.id = ', node.id,
            '; node.name = ', node.name, '; has ', linkRegexMatch.length, 'link regex matches');
        }
        // LOOP THROUGH EACH REGEX MATCH
        for (var linkFromCommentNumber = 0; linkFromCommentNumber < linkRegexMatch.length; linkFromCommentNumber++) {
          if (linkRegexMatch[linkFromCommentNumber] !== node.id) {
            loopStop = false;

            node.connectionIdsFromCommentsSet.add(linkRegexMatch[linkFromCommentNumber]);
          }
        }
        node.connectionIdsFromCommentsSet.forEach(function (uniqueConnectionIdFromComments) {

          node.connectedToIdFromCommentsArray.push(uniqueConnectionIdFromComments);
          node.linksFromComments.push(uniqueConnectionIdFromComments);
        });
      }
      if (consoleLog) {
        if (counter % 17 === 0) {
          console.log(__filename, 'line', __line, '; counter = ', counter, '; node.id = ', node.id, '; node.name = ', node.name, '; has node.connectionIdsFromCommentsSet set: ', node.connectionIdsFromCommentsSet);
        }
      }
      counter++;
    } else {
      console.log(__filename, 'line', __line, '; counter = ', counter, '; node.id = ', node.id, '; node.name = ', node.name, '; has no comments to parse; node.COMMENTS1 = ', node.COMMENTS1);
    }
  });
};

// within each NODE, create array of connection objects with source and target
var addConnectionObjectsArrayFromComments = function (nodes) {
// for each node
  var connectionFromComments;
  counter = 0;
  nodes.forEach(function (node) {
    // counter ++;
    node.connectionsFromComments = [];
    var weHaveNodeConnectedToIdFromCommentsCommentsToParse = ((typeof node.connectedToIdFromComments !== 'null') && (typeof node.connectedToIdFromComments !== 'undefined'));
    if (weHaveNodeConnectedToIdFromCommentsCommentsToParse === true) {
      node.connectedToIdFromComments.forEach(function (connId) {
        if (node.id !== connId) {
          connection = {};
          connection.source = node.id;
          connection.target = connId;
          node.connections.push(connection);
        }
        if (consoleLog) {
          if (counter < 10) {
            console.log('\n ', __filename, 'line', __line, '; counter++ = ', counter++, '; node.id = ', node.id, '; connection = ', connection);
          }
        }
      });
    }

  });
};
// consolidate links; remove duplicates, BUT DOES IT REALLY?
// create a top-level array of links containing a source and target
var consolidateLinksFromComments = function (data) {
  // if (consoleLog) { console.log('\n ', __filename, 'line',__line, '; data = ', data);
  if (consoleLog) {
    console.log('\n ', __filename, 'line', __line, '; data.nodes[0] = ', data.nodes[0]);
    console.log('\n ', __filename, 'line', __line, '; data.nodes[1] = ', data.nodes[1]);
  }
  data.linksFromComments = [];
  var linksFromCommentsSet = new Set();
  // var linksMap = new Map();
  // var mapCounter = 1;
  var connectionsFromCommentsCount = 0;
  (data.nodes).forEach(function (node) {
    if ((typeof node.connectionsFromComments != 'undefined') && (typeof node.connectionsFromComments.length != 'undefined') && (node.connectionsFromComments.length > 0)) {
      connectionsFromCommentsCount = connectionsFromCommentsCount + node.connectionsFromComments.length;
      node.connectionsFromComments.forEach(function (conn) {
        if (linksFromCommentsSet.add(conn) === true) {
          data.linksFromComments.push(conn);
        }
      });
    }
  });
  if (consoleLog) {
    console.log(__filename, 'line', __line, '; connectionsFromCommentsCount = ', connectionsFromCommentsCount, '; linksFromCommentsSet.count = ', linksFromCommentsSet.count);
  }
  linksFromCommentsSet = null;
};

// count the unique links for each node
var countLinksFromComments = function (data) {
  data.nodes.forEach(function (node) {
    var linkFromCommentCounter = 0;
    var keySet = new Set();
    var keyAdded1, keyAdded2;
    var linkConcatKey1, linkConcatKey2;

    var weHaveDataLinksFromCommentsToParse = ((typeof data.linksFromComments !== 'null') && (typeof data.linksFromComments !== 'undefined'));

    if (weHaveDataLinksFromCommentsToParse === true) {
      data.linksFromComments.forEach(function (linkFromComment) {
        // delete a link if source and target are the same
        if (linkFromComment.source === linkFromComment.target) {
          delete linkFromComment;
          console.log(__filename, 'line', __line, 'deleted linkFromComment = ', linkFromComment, ' because linkFromComment.source === linkFromComment.target');
        } else {
          if (node.id === linkFromComment.source || node.id === linkFromComment.target) {
            linkConcatKey1 = linkFromComment.source + linkFromComment.target;
            linkConcatKey2 = linkFromComment.target + linkFromComment.source;
            keyAdded1 = keySet.add(linkConcatKey1);
            keyAdded2 = keySet.add(linkConcatKey2);
            if (keyAdded1 && keyAdded2) {
              linkFromCommentCounter++;
            }
          }
        }
      });
    }
    node.linkFromCommentCounter = linkFromCommentCounter;
  });
};

// number the nodes starting with zero
var numberTheNodes = function (data) {
  counter = 0;
  data.nodes.forEach(function (node) {
    node.nodeNumber = counter;
    counter++;
  });
};

var checkTargetsExist = function (nodes, linksFromComments) {
  var nodeTargetIdsFromCommentsSet = new Set();
  nodes.forEach(function (node) {
    node.connectedToIdFromCommentsArray.forEach(function (connectionIdFromComments) {
      nodeTargetIdsFromCommentsSet.add(connectionIdFromComments);
    })
  });
  if (consoleLog) {
    console.log('\n ', __filename, 'line', __line, '; the number of unique target / link nodes is ', nodeTargetIdsFromCommentsSet.count);
  }
  linksFromComments.forEach(function (linkFromComment) {
    if (nodeTargetIdsFromCommentsSet.exists(linkFromComment.target)) {
      if (consoleLog) {
        console.log('\n ', __filename, 'line', __line, '; ', linkFromComment.target, ' exists.');
      }
    } else {
      // if (consoleLog) {
      console.log('\n ', __filename, 'line', __line, ', linkFromComment.target: ', linkFromComment.target, ' DOES NOT EXIST.');
      // }
      throw 'missing target error';
    }
  });
};

var saveJsonFile = function (jsonData, fileName) {
  try {
    var myFile = __dirname + '/../data/output/' + fileName;
    var myJsonData = JSON.stringify(jsonData, null, ' ');
    fse.writeFileSync(myFile, myJsonData, fsOptions);
    if (consoleLog) {
      console.log('\n ', __filename, 'line', __line, '; saveJsonFile() wrote file to: ', myFile, ';  file contained (truncated): ', myJsonData.substring(0, 400), ' ... [CONSOLE LOG OUTPUT INTENTIONALLY TRUNCATED TO FIRST 400 CHARACTERS]\n\n');
    }
  } catch (e) {
    if (consoleLog) {
      console.log('\n ', __filename, 'line', __line, ';  Error: ', e);
    }
  }
};

var createDateGeneratedMessage = function () {
  var dateAqListGeneratedString = data.dateGenerated;
  var dateAqListGenerated = new Date(dateAqListGeneratedString);
  dateFormat.masks.shortDate = 'mm-dd-yyyy';
  dateFormat.masks.friendly_display = 'dddd, mmmm dS, yyyy';
  generatedFileDateString = vizFormatDateSetup(dateAqListGenerated);
  var message = 'Collected AQList.xml labeled as generated on: ' + dateAqListGeneratedString + ' [' + dateAqListGenerated + ']';
  data.message = message;
  logger.log_message(__filename + ' line ' + __line + '; ' + message);
};

var processPlaceOfBirthArray = function (d) {
  var pobArrayString = '';
  if (typeof d['INDIVIDUAL_PLACE_OF_BIRTH'] !== 'undefined') {
    if (Object.prototype.toString.call(d['INDIVIDUAL_PLACE_OF_BIRTH']) === '[object Array]') {
      // console.log('\n ', __filename, 'line', __line, ';  Array!', d['INDIVIDUAL_PLACE_OF_BIRTH']);
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

var getKeys = function (pob) {
  var keys = [];
  for (var key in pob) {
    keys.push(key);
//    console.log('pob[key] = ', pob[key]); //, '; pob[value]', pob.valueOf(key));
  }
  return keys;
};

var processDateUpdatedArray = function (d) {
  var dateUpdatedArrayString = '';
  if (typeof d['LAST_DAY_UPDATED'] === 'undefined') {
    d.lastDateUpdatedCount = 0;
    //  return '';
  } else if (Object.prototype.toString.call(d['LAST_DAY_UPDATED']['VALUE']) === '[object Array]') {
    // console.log('\n ', __filename, 'line', __line, '; processDateUpdatedArray() found  Array!', d['LAST_DAY_UPDATED']);
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
    // console.log('\n ', __filename, 'line', __line, '; processAliasArray() found  Array!', d['INDIVIDUAL_PLACE_OF_BIRTH']);
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

var createIndivAliasString = function (singleAlias) {
  var aliasString, aliasName, aliasQuality; // = '';
  aliasName = singleAlias.ALIAS_NAME;
  aliasQuality = singleAlias.QUALITY;
  aliasString = aliasName + ' (' + aliasQuality + ')';
  return aliasString;
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

var truncateString = function (inString, numCharacters) {
  var outString = '[TRUNCATED]' + inString.substring(0, numCharacters) + '\n ... [CONSOLE LOG OUTPUT INTENTIONALLY TRUNCATED TO FIRST' + numCharacters + '400 CHARACTERS]';
  return outString;
}

// for DOB, etc.
var formatDate = function (intlDateString) {
  var dateResultString;
  var date = new Date(intlDateString);
  dateFormat.masks.shortDate = 'mm-dd-yyyy';
  try {
    dateResultString = dateFormat(date, 'shortDate');
  } catch (err) {
    console.log('769 Error: ', err, '; intlDateString = ', intlDateString);
  }
  // logger.log_message(__filename + ' line ' + __line + '; ' + dateResultString);
  return dateResultString;
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
  // console.log('viz.js 947 vizFormatDate() dateString = ', dateString);
  return vizDateString;
};
/*
 var generateNarrFileName = function (node) {
 var id = node.id.trim();
 var idSplit = id.split('.');
 var narrFileName = 'NSQ' + idSplit[0].substring(1, 2) + idSplit[2] + idSplit[3] + '.shtml';
 console.log('\n ', __filename, 'line', __line, '; id = ', id, '; generated narrFileName = ', narrFileName);
 return narrFileName;
 };
 */
module.exports = {
  fixData: fixData
};

// fixData();