// setupData2.js
// parse the links now that the narrative files have been collected
// reads AQList-clean.json
// produces AQ-clean-links.json
//==========================

// do we want lots of console.log messages for debugging (if so, set consoleLog = true)
var consoleLog = true;
if (typeof define !== 'function') {
  var define = require('amdefine');
}
var linenums = require('./linenums.js');
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
var narrative_links;
// jsonpatch = require('json-patch'),
//parseString = require('xml2js')
// .parseString;
var counter = 0;
var numObjectsToShow = 2;
var data;
var generatedFileDateString;
// var backbone =  require('backbone');
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
  var links = [];
  var aliasCount = 0;
  var aliasArray = [];
  var linkRegexMatch;
  var connection;
  var missing_ents;
  var missing_indivs;
  var config;
//  var __filename = __filename || {};
//  var __line = __line || {};
  // var consolidatedList;

  async.series([
      function (callback) {
        // read 'raw' unprocessed json file created from XML file
        var rawJsonFileName = __dirname + '/../data/output/AQList-clean.json';
        data = JSON.parse(fse.readFileSync(rawJsonFileName));
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; read the raw json data file');
        }
        callback();
      },

 /*
      // ADD CONNECTION IDS ARRAY
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
*/
      // ADD CONNECTION IDS ARRAY
      function (callback) {
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; addConnectionIdsArrayFromComments(data.nodes)');
        }
        addConnectionIdsArrayFromLongNarratives(data.nodes);
        if (consoleLog) {
          console.log(data.nodes[314]);
        }
        callback();
      },
      // save intermediate file for debugging
      function (callback) {
        saveJsonFile(data, 'data88linksStuff.json');
        callback();
      },

      // ADD CONNECTION OBJECTS ARRAY
      function (callback) {
        addConnectionObjectsArray(data.nodes);
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; addConnectionObjectsArray');
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
        consolidateLinks(data);
        if (consoleLog) {
          console.log('\n 283 function #:', ++functionCount, '; consolidate links into links array');
          console.log('\n ', __filename, 'line', __line, '; data.nodes[1] = ', data.nodes[1]);
          console.log('\n ', __filename, 'line', __line, '; data.links.length = ', data.links.length);
        }
        callback();
      },
      // save intermediate data file for debugging
      function (callback) {
        saveJsonFile(data, 'data08aconsolidateLinks.json');
        callback();
      },

      // stringify and save json data
      function (callback) {
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; save clean json file');
        }
        // var saveJson = function () {
        try {
          var myFile = __dirname + '/../data/output/AQList-clean-links.json';
          var myJsonData = JSON.stringify(data, null, ' ');
          // if (consoleLog) { console.log('myJsonData =', myJsonData);
          fse.writeFileSync(myFile, myJsonData, fsOptions);
          if (consoleLog) {
            console.log('\n ', __filename, 'line', __line, ';  file written to: ', myFile, ';  file contained: ', trunc.n400(util.inspect(myJsonData, false, null)));
          }
        } catch (e) {
          console.log('\n ', __filename, 'line', __line, ';  Error: ', e);
          callback();
        }
        callback();
      },

      // read the main json file containing nodes and links
      function (callback) {
        var cleanJsonFileName = __dirname + '/../data/output/AQList-clean-links.json';
        try {
          var buffer = fse.readFileSync(cleanJsonFileName); //, fsOptions); //, function (err, data) {
          data = JSON.parse(buffer);
        } catch (err) {
          console.log('\n ', __filename, 'line', __line, '; Error: ', err);
        }
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount);
          console.log('\n ', __filename, 'line', __line, '; data read from: \n', cleanJsonFileName);
          console.log('\n ', __filename, 'line', __line, '; data = \n', trunc.truncn(JSON.stringify(data), 200));
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

      // COUNT LINKS
      function (callback) {
        countLinks(data);
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; countLinks2');
          console.log('\n ', __filename, 'line', __line, '; data.nodes[1] = ', data.nodes[1]);
        }
        callback();
      },

      function (callback) {
//      addLinksSet(data);
        if (consoleLog) {
          //      console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; addLinkSet');
        }
        callback();
      },
      // CHECK TARGETS EXIST
      function (callback) {
        checkTargetsExist(data.nodes, data.links);
        callback();
      },
      // COUNT NODES, PRINT NODE IDS
      function (callback) {
        var nodeCounter = 0;
        data.nodes.forEach(function (node) {
          nodeCounter++;
          if (consoleLog) {
            console.log(__filename, 'line', __line, '; node #', nodeCounter, 'node.id = ', node.id);
          }
        });
        callback();
      },

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
          if (node.linkCount > maxLinkCount) {
            maxLinkCount = node.linkCount;
            maxLinkId = node.id;
          }
         });
        console.log('\n ', __filename, 'line', __line, '; counter = ', counter, '; maxLinkId = ', maxLinkId, '; maxLinkCount = ', maxLinkCount);
        counter = 0;
        data.links.forEach(function (link) {
          counter++;
          if (counter <= numObjectsToShow) {
            if (consoleLog) {
              console.log('\n ', __filename, 'line', __line, '; counter = ', counter, '; link/varlink = ', link);
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
        try {
          var myFileNameAndPath = __dirname + '/../data/output/AQList-clean.json';
          var myJsonData = JSON.stringify(data, null, ' ');
          // if (consoleLog) { console.log('myJsonData =', myJsonData);
          fse.writeFileSync(myFileNameAndPath, myJsonData, fsOptions);
          if (consoleLog) {
            console.log('\n ', __filename, 'line', __line, ';  file written to: ', myFileNameAndPath, ';  file contained myJsonData = ', myJsonData);
          }
        } catch (e) {
          console.log('\n ', __filename, 'line', __line, ';  Error: ', e);
          callback();
        }
        callback();
      },

      // placeholder
      function (callback) {
        // var myJsonData = JSON.stringify(data, null, ' ');
        if (consoleLog) {
          console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; STRINGIFY json');
          console.log('\n ', __filename, 'line', __line, '; data.nodes.length = ', data.nodes.length);
          console.log('\n ', __filename, 'line', __line, '; data.links.length = ', data.links.length);
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
          callback();
        }();
      }]
  );
};

// END OF ASYNC ARRAY
// END OF ASYNC ARRAY

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
        console.log('\n ', __filename, 'line', __line, '; Error: ', error, '; node =', node, '; counter = ', counter);
      }
    }
    //  clean up indiv id for consistency;  none should have trailing period.
    node.id = refNumRegexMatch[1].trim();
    if ((node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/)[1].trim() !== node.id) {
      throw 'id error';
    }
    // remove period from end of all reference numbers that have them; not all do.
    if (counter <= numObjectsToShow) {
      if (consoleLog) {
        console.log('\n ', __filename, 'line', __line, '; counter = ', counter, '; node with ids', node);
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
      console.log('\n ', __filename, 'line', __line, '; Error: ', error, '; node =', node, '; counter = ', counter);
    }
    try {
      node.REFERENCE_NUMBER = refNumRegexMatch[0].trim();
    } catch (err) {

    }
    if (counter <= numObjectsToShow) {
      if (consoleLog) {
        console.log('\n ', __filename, 'line', __line, '; counter = ', counter, '; node with ids', node);
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
    console.log('\n ', __filename, 'line', __line, '; Error: ', error, '; node =', node, '; counter = ', counter);
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
        console.log('\n ', __filename, 'line', __line, '; node with name', node);
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
  throw commenterror;
  var loopStop;
  var comments;
  var linkRegexMatch;
  counter = 0;
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
          console.log('\n ', __filename, 'line', __line, '; counter = ', counter, '; node.id = ', node.id, '; node.name = ', node.name, '; has ', linkRegexMatch.length, 'link regex matches');
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
        if (counter % 17 === 0) {
          console.log('\n ', __filename, 'line', __line, '; counter = ', counter, '; node.id = ', node.id, '; node.name = ', node.name, '; has node.connectionIdsSet set: ', node.connectionIdsSet);
        }
      }
      counter++;
    }
  });
};

// for each node, collect and save ids of all other nodes linked to said node
// collect the ids from the long narrative stored in separate shtml documents on the U.N. site.
// if the long narrative associated with a node cannot be found, look in the COMMENTS1 field from the AQList.xml file
// create an array of linked node ids in each indiv/entity node
// create link object for each linked node containing source and target fields, each such field containing the id of the two linked nodes.
var addConnectionIdsArrayFromLongNarratives = function (nodes) {
  var loopStop;
  var comments;
  var linkRegexMatch;
  var nodeNarrFileName;
  nodes.forEach(function (node) {
    node.connectionIdsSet = new Set();
    node.connectedToId = [];
    node.links = [];
    node.linkSet = new Set();
    comments = node.COMMENTS1;
    nodeNarrFileName = node.narrativeFileName;

    if ((typeof nodeNarrFileName !== 'null') && (typeof nodeNarrFileName !== 'undefined') && (typeof nodeNarrFileName.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) !== 'undefined')) {
      var commentsUndefined = ((typeof comments === 'undefined') || (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) === 'undefined'))
      {
        if (commentsUndefined !== true) {
          linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
        } else {
          node.COMMENTS1 = '';
        }
        if (linkRegexMatch !== null) {
          if (consoleLog) {
            console.log('\n ', __filename, 'line', __line, '; node.id = ', node.id, '; node.name = ', node.name, '; has ', linkRegexMatch.length, 'link regex matches');
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
          if (counter % 17 === 0) {
            console.log('\n ', __filename, 'line', __line, '; counter = ', counter, '; node.id = ', node.id, '; node.name = ', node.name, '; has node.connectionIdsSet set: ', node.connectionIdsSet);
          }
        }
        counter++;
      }
    }

  });
};

// within each NODE, create array of connection objects with source and target
var addConnectionObjectsArray = function (nodes) {
// for each node
  var connection;
  counter = 0;
  nodes.forEach(function (node) {
    // counter ++;
    node.connections = [];
    node.connectedToId.forEach(function (connId) {
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
    })
  })
};

// consolidate links; remove duplicates, BUT DOES IT REALLY?
// create a top-level array of links containing a source and target
var consolidateLinks = function (data) {
  // if (consoleLog) { console.log('\n ', __filename, 'line',__line, '; data = ', data);
  if (consoleLog) {
    console.log('\n ', __filename, 'line', __line, '; data.nodes[0] = ', data.nodes[0]);
    console.log('\n ', __filename, 'line', __line, '; data.nodes[1] = ', data.nodes[1]);
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
    console.log(__filename, 'line', __line, '; connectionsCount = ', connectionsCount, '; linkSet.count = ', linkSet.count);
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
        console.log(__filename, 'line', __line, 'deleted ', data.link, ' because link.source === link.target');
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
    console.log('\n ', __filename, 'line', __line, '; the number of unique target / link nodes is ', nodeTargetIdsSet.count);
  }
  links.forEach(function (link) {
    if (nodeTargetIdsSet.exists(link.target)) {
      if (consoleLog) {
        console.log('\n ', __filename, 'line', __line, '; ', link.target, ' exists.');
      }
    } else {
      // if (consoleLog) {
      console.log('\n ', __filename, 'line', __line, ', link.target: ', link.target, ' DOES NOT EXIST.');
      // }
      throw 'missing target error';
    }
  });
};

/*
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
 // if (consoleLog) { console.log('91 linkRegexMatch = ', linkRegexMatch);
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
 */
/*
 var countSourceTarget = function (nodes, links) {
 var tarCount = 0;
 var souCount = 0;
 nodes.forEach(function (node) {
 // for(var n in nodes) {
 if (consoleLog) {
 console.log('\n ', __filename, 'line', __line, ';  node = ', node);
 console.log('\n ', __filename, 'line', __line, ';  node.id = ', node.id);
 }
 node['sourceCount'] = 0;
 node['targetCount'] = 0;
 links.forEach(function (link) {
 if (link.source == node.id) {
 if (consoleLog) {
 console.log('\n ', __filename, 'line', __line, '; ', link.source, ' == ', node.id, ' TRUE');
 }
 node.sourceCount++; // = nodes[n].sourceCount + 1;
 souCount++;
 }
 if (link.target == node.id) {
 if (consoleLog) {
 console.log('\n ', __filename, 'line', __line, '; ', link.target, ' == ', node.id, ' TRUE');
 }
 node.targetCount++; // = node.targetCount + 1;
 tarCount++;
 }
 //      node.linkCount = node.sourceCount + node.targetCount;
 });
 if (consoleLog) {
 console.log('\n ', __filename, 'line', __line, '; node.sourceCount = ', node.sourceCount);
 console.log('\n ', __filename, 'line', __line, '; node.targetCount = ', node.targetCount);
 console.log('\n ', __filename, 'line', __line, '; tarCount = ', tarCount);
 console.log('\n ', __filename, 'line', __line, '; souCount = ', souCount);
 }
 })
 };
 */
var saveJsonFile = function (jsonData, fileName) {
  try {
    var myFile = __dirname + '/../data/output/' + fileName;
    var myJsonData = JSON.stringify(jsonData, null, ' ');
    fse.writeFileSync(myFile, myJsonData, fsOptions);
    if (consoleLog) {
      console.log('\n ', __filename, 'line', __line, ';  file written to: ', myFile);
//      console.log('\n ', __filename, 'line', __line, ';  file contained: ', trunc.n400(util.inspect(myJsonData, false, null)));
      console.log('\n ', __filename, 'line', __line, ';  file contained: ', myJsonData.substring(0, 2400), ' ... [INTENTIONALLY TRUNCATED TO 2,400 CHARACHTERS]');
    }
  } catch (e) {
    if (consoleLog) {
      console.log('\n ', __filename, 'line', __line, ';  Error: ', e);
    }
  }
};
/*
 // inspect some array objects, but not too many
 var inspectSomeArrayObjects = function (array, numOfObjectsToShow) {
 array.forEach(function (object) {
 counter++;
 if (counter <= numOfObjectsToShow) {
 console.log('\n ', __filename, 'line', __line, '; counter = ', counter, '; object = \n', util.inspect(object, false, null));
 }
 });
 };
 */
/*
 var archiveRawSource = function (fileNameAndPath) {
 collect.writeAQListXML(fileNameAndPath);
 return true;
 };
 */
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

var generateNarrFileName = function (node) {
  var id = node.id.trim();
  var idSplit = id.split('.');
  var narrFileName = 'NSQ' + idSplit[0].substring(1, 2) + idSplit[2] + idSplit[3] + '.shtml';
  console.log('\n ', __filename, 'line', __line, '; id = ', id, '; generated narrFileName = ', narrFileName);
  return narrFileName;
};

module.exports = {
  fixData: fixData
};

// fixData();