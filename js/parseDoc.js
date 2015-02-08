// parseDoc.js
// modify collected narratives
//==========================

if (typeof define !== 'function') {
  var define = require('amdefine');
}

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
  linenums = require('./linenums.js'),
  inspect = require('object-inspect');
// var testDoc = require(__dirname + "/../data/narrative_summaries/NSQtest.json");
// jsonpatch = require('json-patch'),
//parseString = require('xml2js')
// .parseString;
var counter = 0;
var numObjectsToShow = 2;
var data = {};
var generatedFileDateString;
// var backbone =  require('backbone');
var Set = require("backpack-node").collections.Set;
var Bag = require("backpack-node").collections.Bag;
var Map = require("backpack-node").collections.Map;

var fsOptions = {
  flags: 'r+', encoding: 'utf-8', autoClose: true
};
var jsonFile = "";
var dateGenerated;
var consoleLog = true;

var parseDoc = function () {
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, "; running setupData.fixData()");
  }
  var functionCount = 0;
  var links = [];
  var aliasCount = 0;
  var aliasArray = [];
  var linkRegexMatch;
  var connection;
  var missing_ents;
  var missing_indivs;
  var ents = [];
  var indivs = [];
  var testDocFile;
//  var __filename = __filename || {};
//  var __line = __line || {};
  var consolidatedList;

  async.series([
      function (callback) {
        // read "raw" unprocessed json file
        var rawJsonNarrativeFileName = __dirname + "/../data/narrative_summaries/NSQtest.shtml";
        testDocFile = JSON.parse(fse.readFileSync(rawJsonNarrativeFileName));
        testDocFileStringified = JSON.stringify(testDocFile, null, " ");
        testDocFile.forEach(function (p) {
          p.children[0].find({"type": "text"});
          console.log("p = ", JSON.stringify(p, null, " "));
          console.log("p.children[0].length = ", p.children.length);
          //p.attribs.forEach(function (el1) {
          // p.children[].forEach(function (el1) {
           // console.log("el1 = ", JSON.stringify(el1, null, " "));
          // })

        })
        if (consoleLog) {
         // console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; read the test json narr file; testDocFileStringified = \n", testDocFileStringified);
        }
        callback();
      },

// last function; does nothing
      function (callback) {
        var dummy = function () {
          if (consoleLog) {
            console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
            console.log("\n ", __filename, "line", __line, "; last function; does nothing");
          }
          callback();
        }();
      }]
  );
};
parseDoc();

/*
 ,
 // save the file for debugging
 function (callback) {
 saveJsonFile(consolidatedList, "data01-loadedRaw.json");
 callback();
 },
 // put all the nodes in a single array
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
 // console.log("indiv.indivDobString = ", indiv.indivDobString);
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
 });

 var generatedFileDateString = dateFormat(data.dateGenerated, "yyyy-mm-dd");
 var archiveFileNameAndPath = __dirname + "/../data/archive/AQList-" + generatedFileDateString + ".xml";
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
 console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; put data into nodes array for d3");
 console.log("\n ", __filename, "line", __line, "; jsonFile = \n", trunc.truncn(JSON.stringify(jsonFile), 200));
 }
 callback();
 },
 // save intermediate data file for debugging
 function (callback) {
 saveJsonFile(data, "data02-flattened.json");
 callback();
 },

 // put nodes and node ids into a set
 function (callback) {
 // SET: https://www.npmjs.org/package/backpack-node
 counter = 0;
 var setOfNodes = new Set();
 var setOfNodeIds = new Set();
 data.nodes.forEach(function (node) {
 counter++;
 setOfNodes.add(node);
 setOfNodeIds.add(node.id);
 if (counter !== setOfNodeIds.count) {
 console.log("\n ", __filename, "line", __line, "; node.id = ", node.id, "; counter = ", counter, "; setOfNodeIds.count = ", setOfNodeIds.count, "; \n(counter === setOfNodeIds.count) = ", counter === setOfNodeIds.count, "; node.id ", node.id, " is a duplicate.");
 counter = counter - 1;
 }
 });
 if (consoleLog) {
 console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; put nodes into a set");
 console.log("\n ", __filename, "line", __line, "; typeof data = ", typeof data);
 console.log("\n ", __filename, "line", __line, "; started with ", data.nodes.length, " nodes in data.nodes array");
 console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; setOfNodes.count = ", setOfNodes.count);
 console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; setOfNodeIds.count = ", setOfNodeIds.count);
 }
 callback();
 },
 // put entities and indivs into a bag
 // https://www.npmjs.org/package/backpack-node
 function (callback) {
 var nodeBag = new Bag();
 counter = 0;
 data.nodes.forEach(function (node) {
 counter++;
 if (consoleLog) {
 console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; node.id = ", node.id);
 }
 if (!(node.id)) {
 node.id = "NODE" + counter;
 }
 nodeBag.add(node.id, node);
 // console.log("\n ", __filename, "line", __line, "counter = ", counter ,"; nodeBag.length = ", nodeBag.count);
 });
 if (consoleLog) {
 console.log("\n ", __filename, "line", __line, "Bag counter = ", counter);
 //      console.log("\n ", __filename, "line", __line, "; nodeBag = ", nodeBag);
 }
 callback();
 },
 // save intermediate data file for debugging
 function (callback) {
 saveJsonFile(data, "data05nodeBag.json");
 callback();
 },
 function (callback) {
 saveJsonFile(data, "data06myBag.json");
 callback();
 },

 function (callback) {
 var nodeBag2 = new Bag();
 counter = 0;
 data.nodes.forEach(function (node) {
 counter++;
 if (consoleLog) {
 console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; ent.id = ", ent.id);
 }
 node.id = getCleanId(node.REFERENCE_NUMBER);
 nodeBag2.add(node.id, node);
 });
 if (consoleLog) {
 console.log("\n ", __filename, "line", __line, "nodeBag2 counter = ", counter, "; nodeBag2._map.count = ", nodeBag2._map.count);
 }
 callback();
 },
 // save intermediate data file for debugging
 function (callback) {
 saveJsonFile(data, "data06nodebagset.json");
 callback();
 },

 // ADD CONNECTION IDS ARRAY
 function (callback) {
 if (consoleLog) {
 console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; addConnectionIdsArrayFromComments(data.nodes)");
 }
 addConnectionIdsArrayFromComments(data.nodes);
 if (consoleLog) {
 console.log(data.nodes[1]);
 }
 callback();
 },

 function (callback) {
 saveJsonFile(data, "data5addconnidsarray.json");
 callback();
 },

 // ADD CONNECTION OBJECTS ARRAY
 function (callback) {

 addConnectionObjectsArray(data.nodes);
 if (consoleLog) {
 console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; addConnectionObjectsArray");
 console.log(data.nodes[1]);
 }
 callback();
 },

 function (callback) {
 saveJsonFile(data, "data6addconnectionOBJECTSarray.json");
 callback();
 },

 function (callback) {
 consolidateLinks(data);
 if (consoleLog) {
 console.log("\n 283 function #:", ++functionCount, "; consolidate links into links array");
 console.log("\n ", __filename, "line", __line, "; data.nodes[1] = ", data.nodes[1]);
 console.log("\n ", __filename, "line", __line, "; data.links.length = ", data.links.length);
 }
 callback();
 },

 function (callback) {
 //  addLinksArray(data.nodes);
 // countSourceTarget(data.nodes, data.links);
 if (consoleLog) {
 //  console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; addLinksArray(data.nodes)");
 //  console.log("\n ", __filename, "line", __line, "; data.nodes[1] = ", data.nodes[1]);
 }
 callback();
 },

 // COUNT LINKS
 function (callback) {
 countLinks(data);
 if (consoleLog) {
 console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; countLinks2");
 console.log("\n ", __filename, "line", __line, "; data.nodes[1] = ", data.nodes[1]);
 }
 callback();
 },

 function (callback) {
 //      addLinksSet(data);
 if (consoleLog) {
 //      console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; addLinkSet");
 }
 callback();
 },

 function (callback) {
 checkTargetsExist(data.nodes, data.links);
 callback();
 },

 function (callback) {
 var nodeCounter = 0;
 data.nodes.forEach(function (node) {
 nodeCounter++;
 if (consoleLog) {
 console.log(__filename, "line", __line, "; node #", nodeCounter, "node.id = ", node.id);
 }
 });
 callback();
 },

 function (callback) {
 if (consoleLog) {
 console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
 console.log("\n ", __filename, "line", __line, "; data.nodes[1] = ", data.nodes[1]);
 }
 counter = 0;
 data.links.forEach(function (link) {
 counter++;
 if (counter <= numObjectsToShow) {
 if (consoleLog) {
 console.log("\n ", __filename, "line", __line, "; 296 counter = ", counter, "; link = ", link);
 }
 }
 });
 callback();
 },
 // comment
 function (callback) {
 if (consoleLog) {
 console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; save clean json file");
 }
 // var saveJson = function () {
 try {
 var myFile = __dirname + "/../data/output/AQList-clean.json";
 var myJsonData = JSON.stringify(data, null, " ");
 // if (consoleLog) { console.log("myJsonData =", myJsonData);
 fse.writeFileSync(myFile, myJsonData, fsOptions);
 if (consoleLog) {
 console.log("\n ", __filename, "line", __line, ";  file written to: ", myFile, ";  file contained: ", trunc.n400(util.inspect(myJsonData, false, null)));
 }
 } catch (e) {
 console.log("\n ", __filename, "line", __line, ";  Error: ", e);
 callback();
 }
 callback();
 },

 // stringify
 function (callback) {
 var myJsonData = JSON.stringify(data, null, " ");
 if (consoleLog) {
 console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; save clean json file");
 console.log("\n ", __filename, "line", __line, "; data.nodes.length = ", data.nodes.length);
 console.log("\n ", __filename, "line", __line, "; data.links.length = ", data.links.length);
 }
 callback();
 */

// END OF ASYNC ARRAY
// END OF ASYNC ARRAY

var formatMyDate = function (dateString) {
  var now = new Date();
  dateFormat.masks.friendly_detailed = "dddd, mmmm dS, yyyy, h:MM:ss TT";
  dateFormat.masks.friendly_display = "dddd, mmmm dS, yyyy";
  dateFormat.masks.file_generated_date = "yyyy-mm-dd";
  dateFormat.masks.common = "mm-dd-yyyy";
// Basic usage
// dateFormat.masks.hammerTime = 'yyyy-mm-dd-HHMMss';
// var displayDateString = dateFormat(now, "friendly_display");
// Saturday, June 9th, 2007, 5:46:21 PM
// var fileDateString = dateFormat(now, "hammerTime");
//    var dateAqListGeneratedString = data.dateGenerated;
  var date = new Date(dateString);
//    dateFormat.masks.friendly_display = "dddd, mmmm dS, yyyy";
  var formattedDate = dateFormat(date, "common");
//    var message = "Collected AQList.xml labeled as generated on: " + dateAqListGeneratedString + " [" + dateAqListGenerated + "]";
//    data.message = message;
  logger.log_message(__filename + " line " + __line + "; formattedDate = " + formattedDate);
  return formattedDate;
};

var cleanUpIds = function (nodes) {
  counter = 0;
  nodes.forEach(function (node) {
    counter++;
    var rawRefNum = node.REFERENCE_NUMBER;
    // remove period from end of all reference numbers that have them; not all do.
    var refNumRegexMatch;
    try {
      refNumRegexMatch = (node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
    } catch (error) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; Error: ", error, "; node =", node, "; counter = ", counter);
      }
    }
    //  clean up indiv id for consistency;  none should have trailing period.
    node.id = refNumRegexMatch[1].trim();
    if ((node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/)[1].trim() !== node.id) {
      throw "id error";
    }
    // remove period from end of all reference numbers that have them; not all do.
    if (counter <= numObjectsToShow) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; node with ids", node);
      }
    }
  });
};

// some REFERENCE_NUMBERs in the source xml (including those in comments) have periods at the end; some don't; we remove all trailing periods for consistency.
var cleanUpRefNums = function (nodes) {
  counter = 0;
  nodes.forEach(function (node) {
    counter++;
    var rawRefNum = node.REFERENCE_NUMBER.trim();
    // for consistency, remove period from end of all reference numbers that have them; not all do.
    var refNumRegexMatch;
    try {
      refNumRegexMatch = (node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
    } catch (error) {
      console.log("\n ", __filename, "line", __line, "; Error: ", error, "; node =", node, "; counter = ", counter);
    }
    try {
      node.REFERENCE_NUMBER = refNumRegexMatch[0].trim();
    } catch (err) {

    }
    if (counter <= numObjectsToShow) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; node with ids", node);
      }
    }
  });
};

//  clean up ids for consistency;  none should have trailing period.
var getCleanId = function (referenceNumber) {
  var refNumRegexMatch;
  try {
    refNumRegexMatch = referenceNumber.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
  } catch (error) {
    console.log("\n ", __filename, "line", __line, "; Error: ", error, "; node =", node, "; counter = ", counter);
  }
  return refNumRegexMatch[0].trim();
};

var concatNames = function (nodes) {
  counter = 0;
  nodes.forEach(function (node) {
    counter++;
    var name = "";
    var firstName = node.FIRST_NAME;
    var secondName = node.SECOND_NAME;
    var thirdName = node.THIRD_NAME;
    var fourthName = node.FOURTH_NAME;
    if (firstName) {
      name = name.concat(firstName.trim());
    }
    if (secondName) {
      name = name.concat(" ", secondName.trim());
    }
    if (thirdName) {
      name = name.concat(" ", thirdName.trim());
    }
    if (fourthName) {
      name = name.concat(" ", fourthName.trim());
    }
    node.name = name.trim();
    if (counter <= 10) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; node with name", node);
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
// create an array of links within each entity/indiv containing ids of related parties
var addLinksArray = function (nodes) {
  var comments;
  var linkRegexMatch;
  data.nodes.forEach(function (node) {

    node.linkedIds = [];
    comments = node.COMMENTS1;
    if ((typeof comments != 'undefined') && (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) != 'undefined')) {
      linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
      // if (consoleLog) { console.log("91 linkRegexMatch = ", linkRegexMatch);
      if ((typeof(linkRegexMatch) !== 'undefined') && (linkRegexMatch !== null)) {
        for (var n = 0; n < linkRegexMatch.length; n++) {
          if (node.id === linkRegexMatch[n].trim()) {
            // don't include a link from a node to itself
            if (consoleLog) {
              console.log("node id error" + node.id + " ===  " + linkRegexMatch[n].trim());
              throw "node links to itself error";
            }
          } else {
            node.linkedIds.push(linkRegexMatch[n].trim());
          }
        }
      }
    }
  });
};

// create an array of ids in each indiv/entity
var addConnectionIdsArray = function (nodes) {
  var loopStop;
  var comments;
  var linkRegexMatch;
  nodes.forEach(function (node) {
    node.connectionIdsSet = new Set();
    node.connectedToId = [];
    node.links = [];
    node.linkSet = new Set();
    comments = node.COMMENTS1;
    if ((typeof comments !== 'undefined') && (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) !== 'undefined')) {
      linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
      if (linkRegexMatch !== null) {
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; node.id = ", node.id, "; node.name = ", node.name, "; has ", linkRegexMatch.length, "link regex matches");
        }
        // LOOP THROUGH EACH REGEX MATCH
        for (var link = 0; link < linkRegexMatch.length; link++) {
          if (linkRegexMatch[link] !== node.id) {
            loopStop = false;
            node.connectionIdsSet.add(linkRegexMatch[link]);
          }
        }
        node.connectionIdsSet.forEach(function (uniqueConnectionId) {
          node.connectedToId.push(uniqueConnectionId);
          node.links.push(uniqueConnectionId);
        });
      }
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; node.id = ", node.id, "; node.name = ", node.name, "; has connectionIdsSet set: ", connectionIds);
      }
    }
  });
};

// within each NODE, create array of connection objects with source and target
var addConnectionObjectsArray = function (nodes) {
// for each node
  var connection;
  nodes.forEach(function (node) {
    node.connections = [];
    node.connectedToId.forEach(function (connId) {
      if (node.id !== connId) {
        connection = {};
        connection.source = node.id;
        connection.target = connId;
        node.connections.push(connection);
      }
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; id = ", id, "; connection = ", connection);
      }
    })
  })
};

// consolidate links; remove duplicates, BUT DOES IT REALLY?
// create a top-level array of links containing a source and target
var consolidateLinks = function (data) {
  // if (consoleLog) { console.log("\n ", __filename, "line",__line, "; data = ", data);
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, "; data.nodes[0] = ", data.nodes[0]);
    console.log("\n ", __filename, "line", __line, "; data.nodes[1] = ", data.nodes[1]);
  }
  data.links = [];
  var linkSet = new Set();
  // var linksMap = new Map();
  // var mapCounter = 1;
  var connectionsCount = 0;
  (data.nodes).forEach(function (node) {
    if ((typeof node.connections != 'undefined') && (typeof node.connections.length != 'undefined') && (node.connections.length > 0)) {
      connectionsCount = connectionsCount + node.connections.length;
      node.connections.forEach(function (conn) {
        if (linkSet.add(conn) === true) {
          data.links.push(conn);
        }
      });
    }
  });
  if (consoleLog) {
    console.log(__filename, "line", __line, "; connectionsCount = ", connectionsCount, "; linkSet.count = ", linkSet.count);
  }
  linkSet = null;
};

// count the unique links for each node
var countLinks = function (data) {
  data.nodes.forEach(function (node) {
    var linkCounter = 0;
    var keySet = new Set();
    var keyAdded1, keyAdded2;
    var linkConcatKey1, linkConcatKey2;
    data.links.forEach(function (link) {
      // delete a link if source and target are the same
      if (link.source === link.target) {
        delete data.link;
        console.log(__filename, "line", __line, "deleted ", data.link, " because link.source === link.target");
      } else {
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
  });
};
var checkTargetsExist = function (nodes, links) {
  var nodeTargetIdsSet = new Set();
  nodes.forEach(function (node) {
    node.connectedToId.forEach(function (connectionId) {
      nodeTargetIdsSet.add(connectionId);
    })
  });
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, "; the number of unique target / link nodes is ", nodeTargetIdsSet.count);
  }
  links.forEach(function (link) {
    if (nodeTargetIdsSet.exists(link.target)) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; ", link.target, " exists.");
      }
    } else {
      // if (consoleLog) {
      console.log("\n ", __filename, "line", __line, ", link.target: ", link.target, " DOES NOT EXIST.");
      // }
      throw "missing target error";
    }
  });
};

// put links into a set
// https://www.npmjs.org/package/backpack-node
// within each node create a Set() of ids of related/linked parties
var addSourceTargetArray = function (data) {
  var comments;
  var linkRegexMatch;
  var sourceTarget;
  var count;
  data.nodes.forEach(function (node) {
    node.sourceTargetArray = [];
    comments = node.COMMENTS1;
    if ((typeof comments !== 'undefined') && (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) !== 'undefined')) {
      linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
      // if (consoleLog) { console.log("91 linkRegexMatch = ", linkRegexMatch);
      if ((typeof(linkRegexMatch) !== 'undefined') && (linkRegexMatch !== null)) {
        for (var n = 0; n < linkRegexMatch.length; n++) {
          if (node.id !== linkRegexMatch[n].trim()) {
            // don't include a link from a node to itself
            sourceTarget = {};
            sourceTarget.source = node.id;
            sourceTarget.target = linkRegexMatch[n].trim();
            data.links.push(sourceTarget);
          }
        }
      }
    }
  });
};

var countSourceTarget = function (nodes, links) {
  var tarCount = 0;
  var souCount = 0;
  nodes.forEach(function (node) {
    // for(var n in nodes) {
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, ";  node = ", node);
      console.log("\n ", __filename, "line", __line, ";  node.id = ", node.id);
    }
    node['sourceCount'] = 0;
    node['targetCount'] = 0;
    links.forEach(function (link) {
      if (link.source == node.id) {
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; ", link.source, " == ", node.id, " TRUE");
        }
        node.sourceCount++; // = nodes[n].sourceCount + 1;
        souCount++;
      }
      if (link.target == node.id) {
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; ", link.target, " == ", node.id, " TRUE");
        }
        node.targetCount++; // = node.targetCount + 1;
        tarCount++;
      }
//      node.linkCount = node.sourceCount + node.targetCount;
    });
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, "; node.sourceCount = ", node.sourceCount);
      console.log("\n ", __filename, "line", __line, "; node.targetCount = ", node.targetCount);
      console.log("\n ", __filename, "line", __line, "; tarCount = ", tarCount);
      console.log("\n ", __filename, "line", __line, "; souCount = ", souCount);
    }
  })
};

var saveJsonFile = function (jsonData, fileName) {
  try {
    var myFile = __dirname + "/../data/output/" + fileName;
    var myJsonData = JSON.stringify(jsonData, null, " ");
    fse.writeFileSync(myFile, myJsonData, fsOptions);
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, ";  file written to: ", myFile);
      console.log("\n ", __filename, "line", __line, ";  file contained: ", trunc.n400(util.inspect(myJsonData, false, null)));
    }
  } catch (e) {
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, ";  Error: ", e);
    }
  }
};

// inspect some array objects, but not too many
var inspectSomeArrayObjects = function (array, numOfObjectsToShow) {
  array.forEach(function (object) {
    counter++;
    if (counter <= numOfObjectsToShow) {
      console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; object = \n", util.inspect(object, false, null));
    }
  });
};

var archiveRawSource = function (fileNameAndPath) {
  collect.writeAQListXML(fileNameAndPath);
  return true;
};

var createDateGeneratedMessage = function () {
  var dateAqListGeneratedString = data.dateGenerated;
  var dateAqListGenerated = new Date(dateAqListGeneratedString);
  dateFormat.masks.shortDate = "mm-dd-yyyy";
  dateFormat.masks.friendly_display = "dddd, mmmm dS, yyyy";
  generatedFileDateString = vizFormatDateSetup(dateAqListGenerated);
  var message = "Collected AQList.xml labeled as generated on: " + dateAqListGeneratedString + " [" + dateAqListGenerated + "]";
  data.message = message;
  logger.log_message(__filename + " line " + __line + "; " + message);
};

var processPlaceOfBirthArray = function (d) {
  var pobArrayString = "";
  if (typeof d["INDIVIDUAL_PLACE_OF_BIRTH"] !== 'undefined') {
    if (Object.prototype.toString.call(d["INDIVIDUAL_PLACE_OF_BIRTH"]) === '[object Array]') {
      // console.log("\n ", __filename, "line", __line, ";  Array!", d["INDIVIDUAL_PLACE_OF_BIRTH"]);
      var pobArray = d["INDIVIDUAL_PLACE_OF_BIRTH"];
      // var pobArrayString;
      for (var i = 0; i < pobArray.length; i++) {
        pobArrayString += createIndivPlaceOfBirthString(pobArray[i]);
        pobArrayString += "; ";
      }
    } else {
      pobArrayString += createIndivPlaceOfBirthString(d["INDIVIDUAL_PLACE_OF_BIRTH"]);
    }
  }
  return pobArrayString;
};

var createIndivPlaceOfBirthString = function (singlePob) {
  var pobString = "";
  if (typeof singlePob !== 'undefined' && singlePob !== "") {
    var keys = getKeys(singlePob);
    keys.forEach(function (key) {
        if (typeof singlePob[key] !== 'undefined' && singlePob[key] !== "") {
          pobString += singlePob[key];
          pobString += ", ";
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
//    console.log("pob[key] = ", pob[key]); //, "; pob[value]", pob.valueOf(key));
  }
  return keys;
};

var processDateUpdatedArray = function (d) {
  var dateUpdatedArrayString = "";
  if (typeof d["LAST_DAY_UPDATED"] === 'undefined') {
    d.lastDateUpdatedCount = 0;
    //  return "";
  } else if (Object.prototype.toString.call(d["LAST_DAY_UPDATED"]["VALUE"]) === '[object Array]') {
    // console.log("\n ", __filename, "line", __line, "; processDateUpdatedArray() found  Array!", d["LAST_DAY_UPDATED"]);
    var lastDateUpdatedArray = d["LAST_DAY_UPDATED"]["VALUE"];
    d.lastDateUpdatedCount = lastDateUpdatedArray.length;
    for (var i = 0; i < lastDateUpdatedArray.length; i++) {
      dateUpdatedArrayString += vizFormatDateSetup(lastDateUpdatedArray[i]);
      if (i < (lastDateUpdatedArray.length - 1)) {
        dateUpdatedArrayString += ", ";
      }
    }
  } else {
    d.lastDateUpdatedCount = 1;
    dateUpdatedArrayString += vizFormatDateSetup(d["LAST_DAY_UPDATED"]["VALUE"]);
  }
  return dateUpdatedArrayString;
};

var processAliasArray = function (d) {
  var aliasArrayString = "";
  if (!(d["INDIVIDUAL_ALIAS"])) {
    d.aliasCount = 0;
    return "";
  }
  if (Object.prototype.toString.call(d["INDIVIDUAL_ALIAS"]) === '[object Array]') {
    // console.log("\n ", __filename, "line", __line, "; processAliasArray() found  Array!", d["INDIVIDUAL_PLACE_OF_BIRTH"]);
    var aliasArray = d["INDIVIDUAL_ALIAS"];
    d.aliasCount = aliasArray.length;
    for (var i = 0; i < aliasArray.length; i++) {
      aliasArrayString += createIndivAliasString(aliasArray[i]);
      aliasArrayString += "; ";
    }
  } else {
    d.aliasCount = 1;
    aliasArrayString += createIndivAliasString(d["INDIVIDUAL_ALIAS"]);
  }
  return aliasArrayString;
};

var createIndivAliasString = function (singleAlias) {
  var aliasString, aliasName, aliasQuality; // = "";
  aliasName = singleAlias.ALIAS_NAME;
  aliasQuality = singleAlias.QUALITY;
  aliasString = aliasName + " (" + aliasQuality + ")";
  return aliasString;
};

var createIndivDateOfBirthString = function (d) {
  var dateString = "",
    rawDateString;
  if (typeof d["INDIVIDUAL_DATE_OF_BIRTH"]["DATE"] !== 'undefined' && d["INDIVIDUAL_DATE_OF_BIRTH"]["DATE"] !== "") {
    rawDateString = formatDate(d["INDIVIDUAL_DATE_OF_BIRTH"]["DATE"]);
    dateString += vizFormatDateSetup(rawDateString);
  } else if (typeof d["INDIVIDUAL_DATE_OF_BIRTH"]["YEAR"] !== 'undefined') {
    dateString += d["INDIVIDUAL_DATE_OF_BIRTH"]["YEAR"];
  }
  if (typeof d["INDIVIDUAL_DATE_OF_BIRTH"]["TYPE_OF_DATE"] !== 'undefined' && d["INDIVIDUAL_DATE_OF_BIRTH"]["TYPE_OF_DATE"] !== "") {
    dateString += " (" + d["INDIVIDUAL_DATE_OF_BIRTH"]["TYPE_OF_DATE"] + ")";
  }
  return dateString;
};

// for DOB, etc.
var formatDate = function (intlDateString) {
  var dateResultString;
  var date = new Date(intlDateString);
  dateFormat.masks.shortDate = "mm-dd-yyyy";
  try {
    dateResultString = dateFormat(date, "shortDate");
  } catch (err) {
    console.log("769 Error: ", err, "; intlDateString = ", intlDateString);
  }
  // logger.log_message(__filename + " line " + __line + "; " + dateResultString);
  return dateResultString;
};

var vizFormatDateSetup = function (dateString) {
  var m_names = new Array("January", "February", "March",
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December");

  var d = new Date(dateString);
  var curr_date = d.getDate();
  var curr_month = d.getMonth();
  var curr_year = d.getFullYear();

  var dateString = curr_date + " " + m_names[curr_month]
    + " " + curr_year;
  // console.log("viz.js 947 vizFormatDate() dateString = ", dateString);
  return dateString;
};

module.exports = {
  parseDoc: parseDoc
};
