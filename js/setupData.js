// setupData.js
// put data in arrays for d3
//==========================

if (typeof define !== 'function') {
  var define = require('amdefine');
}
var missingNodes = require('./missing_nodes.js');
var logger = require('./libs/logger.js');
var trunc = require('./trunc.js');

var async = require('async'), re = require('request-enhanced'), request = require('request'), fse = require('fs-extra'), util = require('util'), dateFormat = require('dateformat'), inspect = require('object-inspect');
// jsonpatch = require('json-patch'),
//parseString = require('xml2js')
// .parseString;
// var truncateToNumChars = 400;
var counter = 0;
var numObjectsToShow = 2;
var data;
var generatedFileDateString;
// var backbone =  require('backbone');
var Set = require("backpack-node").collections.Set;
var Bag = require("backpack-node").collections.Bag;

var fsOptions = {
  flags: 'r+', encoding: 'utf-8', autoClose: true
};
var jsonFile = "";
var dateGenerated;
var consoleLog = false;
var fixData = function () {
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, "; running setupData.fixData()");
  }
  var functionCount = 0;
  // var newData = {};
  // var aliases;
  // var comments = "";
  var links = [];
  // var connectedToId;
  var aliasCount = 0;
  var aliasArray = [];
  var linkRegexMatch;
  var connection;
  // var source;
  // var target;
  var missing_ents;
  var missing_indivs;
  var ents = [];
  var indivs = [];
  async.series([

    function (callback) {
      // read "raw" unprocessed json file
      var rawJsonFileName = __dirname + "/../data/output/AQList-raw.json";
      jsonFile = fse.readFileSync(rawJsonFileName); //, fsOptions); //, function (err, data) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; jsonFile = \n", trunc.truncn(JSON.stringify(jsonFile), 200));
      }
      callback();
    },

    function (callback) {
      saveJsonFile(JSON.parse(jsonFile), "data01-loadedRaw.json");
      callback();
    },

    function (callback) {
      // get missing nodes from missing_nodes.js file
      missing_ents = missingNodes.getMissingEnts();
      missing_indivs = missingNodes.getMissingIndivs();
      if (consoleLog) {
        console.log("\n ", __filename, "line", "line", __line, "; missing_ents = ", missing_ents);
        console.log("\n ", __filename, "line", "line", __line, "; missing_indivs = ", missing_indivs);
      }
      callback();
    },
    // comment
    function (callback) {
      // rearrange the data into arrays for d3
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function 2#:", ++functionCount, "; re-arrange data");
        console.log("\n ", __filename, "line", __line, "; jsonFile = \n", trunc.n400(JSON.stringify(jsonFile)));
        console.log("\n ", __filename, "line", __line, "; typeof jsonFile = \n", (typeof jsonFile));
      }
      var aliases;
      var comments = "";
      var connectedToId;
      var aliasCount = 0;
      var aliasArray = [];
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; typeof data= ", (typeof jsonFile));
        console.log("\n ", __filename, "line", __line, ";  data.length = ", (jsonFile.length));
      }
      var conList = JSON.parse(jsonFile).CONSOLIDATED_LIST;
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; typeof conList = ", (typeof conList));
      }
      var dateAqListGeneratedString = JSON.parse(jsonFile).CONSOLIDATED_LIST.$.dateGenerated;
      var dateAqListGenerated = new Date(dateAqListGeneratedString);
      dateFormat.masks.friendly_display = "dddd, mmmm dS, yyyy";
      generatedFileDateString = dateFormat(dateAqListGenerated, "fullDate");
      var message = "Collected AQList.xml labeled as generated on: " + dateAqListGeneratedString + " [" + dateAqListGenerated + "]";
      logger.log_message(message);
      if (consoleLog) {
        // <!-- date generated -->
        console.log("\n ", __filename, "line", __line, "; typeof conList = ", (typeof conList), "; dateAqListGeneratedString = ", dateAqListGeneratedString, "; dateAqListGenerated = ", dateAqListGenerated);
      }
      // PROCESS ENTITIES
      // put entities in data.ents array
      counter = 0;
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; conList.ENTITIES.ENTITY.length = ", conList.ENTITIES.ENTITY.length);
        console.log("\n ", __filename, "line", __line, "; conList.INDIVIDUALS.INDIVIDUAL.length = ", conList.INDIVIDUALS.INDIVIDUAL.length);
      }
      missing_ents.forEach(function (ent) {
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; missing_ents ent = ", ent);
          console.log("\n ", __filename, "line", __line, "; missing_ents ent = ", ent);
        }
        conList.ENTITIES.ENTITY.push(ent);
      });
      conList.ENTITIES.ENTITY.forEach(function (ent) {
        counter++;
        if (counter <= numObjectsToShow) {
          if (consoleLog) {
            console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; util.inspect(ent, false, null) = ", util.inspect(ent, false, null));
          }
        }
        ents.push(ent);
      });
      conList.ents = ents;
      conList.ENTITIES = null; // .ENTITY.forEach(function (ent) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; typeof ents = ", typeof ents);
        console.log("\n ", __filename, "line", __line, "; ents.length = ", ents.length);
      }
      // put indivs in data.indivs array
      missing_indivs.forEach(function (indiv) {
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; missing_indiv indiv = ", indiv);
        }
        conList.INDIVIDUALS.INDIVIDUAL.push(indiv);
      });
      counter = 0;

      inspectSomeArrayObjects(conList.INDIVIDUALS.INDIVIDUAL, 4);

      conList.INDIVIDUALS.INDIVIDUAL.forEach(function (indiv) {
        indivs.push(indiv);
      });
      conList.indivs = indivs;
      conList.INDIVIDUALS = null; //.INDIVIDUAL.forEach(function (indiv)
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; indivs.length = ", indivs.length);
      }
      // entities and indivs in separate arrays each go into a single array of 'nodes'
      // create an identifier to distinguish indivs from entities
      ents.forEach(function (ent) {
        // 1 = entity; 0 = individual
        ent.indiv0OrEnt1 = 1;
      });
      indivs.forEach(function (indiv) {
        // 1 = entity; 0 = individual
        indiv.indiv0OrEnt1 = 0;
      });
      data = conList;

      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; ents.length = ", ents.length);
        console.log("\n ", __filename, "line", __line, "; indivs.length = ", indivs.length);
        console.log("\n ", __filename, "line", __line, "; typeof data = ", typeof data);
      }
      callback();
    },

    function (callback) {
      saveJsonFile(data, "data2.json");
      callback();
    },

    // entities and indivs were in separate arrays; the two arrays are merged into a single array of 'nodes'
    function (callback) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; put ents and indivs into nodes array");
        console.log("\n ", __filename, "line", __line, "; typeof data = ", typeof data);
      }
      data.nodes = ents.concat(indivs);
      data.nodes = ents.concat(indivs);
      data.nodes = data.nodes.concat(missing_ents);
      data.nodes = data.nodes.concat(missing_indivs);
      cleanUpRefNums(data.nodes);
      cleanUpIds(data.nodes);

      var nodes = data.nodes;
      nodes.forEach(function (node) {
        counter++;
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; ent.id = ", ent.id);
        }
        node.id = getCleanId(node.REFERENCE_NUMBER);

      });
      concatNames(data.nodes);
      data.dateGenerated = generatedFileDateString; // data.CONSOLIDATED_LIST.$.dateGenerated;
      counter = 0;
//      data.ents = null;
//      data.indivs = null;
//      ents = null;
//      indivs = null;
      callback();
    },
    // save intermediate data file for debugging
    function (callback) {
      saveJsonFile(data, "data03consolidateNodesIntoOneArray.json");
      callback();
    },

    // put nodes into a set
    function (callback) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; put ents and indivs into nodes array");
        console.log("\n ", __filename, "line", __line, "; typeof data = ", typeof data);
      }
      // SET
      // https://www.npmjs.org/package/backpack-node
      counter = 0;
      var setOfNodes = new Set();
      data.nodes.forEach(function (node) {
        counter++;
        setOfNodes.add(node);
      });
      console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; setOfNodes.count = ", setOfNodes.count);
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

      console.log("\n ", __filename, "line", __line, "Bag counter = ", counter);
//      console.log("\n ", __filename, "line", __line, "; nodeBag = ", nodeBag);
      callback();
    },

    // save intermediate data file for debugging
    function (callback) {
      saveJsonFile(data, "data05nodeBag.json");
      callback();
    },

    function (callback) {
      counter = 0;
      var myBag = new Bag();
      myBag.add(1, data.nodes[1]);
      myBag.add(2, "b");
      myBag.add(2, "c");

      myBag.forEach(function (item) {
        console.log("Key: " + item.key);
        console.log("Value: " + item.value);
      });
      callback();
    },

    // save intermediate data file for debugging
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
      saveJsonFile(data, "data04nodebagset.json");
      callback();
    },

    function (callback) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; clean up Ids");
      }
      cleanUpIds(data.nodes);
      callback();
    },

    function (callback) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; create nationality");
      }
      createNationality(data.nodes);
      callback();
    },

    function (callback) {
      saveJsonFile(data, "data4cleanupids.json");
      callback();
    },

    // ADD CONNECTION IDS ARRAY
    function (callback) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; addConnectionIdsArray(data.nodes)");
      }
      addConnectionIdsArray(data.nodes);
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
      addLinksArray(data.nodes);
      countSourceTarget(data.nodes, data.links);
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; addLinksArray(data.nodes)");
        console.log("\n ", __filename, "line", __line, "; data.nodes[1] = ", data.nodes[1]);
      }
      callback();
    },

    // COUNT LINKS
    function (callback) {
      countLinks(data.nodes);
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; countLinks2");
        console.log("\n ", __filename, "line", __line, "; data.nodes[1] = ", data.nodes[1]);
      }
      callback();
    },

    function (callback) {
      addLinksSet(data);
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; addLinkSet");
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
    }
  ]);
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
    // remove period from end of all reference numbers that have them; not all do.
    var refNumRegexMatch;
    try {
      refNumRegexMatch = (node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
    } catch (error) {

      console.log("\n ", __filename, "line", __line, "; Error: ", error, "; node =", node, "; counter = ", counter);

    }
    //  clean up indiv id for consistency;  none should have trailing period.
    node.REFERENCE_NUMBER = refNumRegexMatch[0].trim();
//    if ((node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/)[0] !== node.id) {
//      throw "id error";
//     }
    // remove period from end of all reference numbers that have them; not all do.
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
      var nn = node.NATIONALITY;
      if (typeof nn.VALUE !== 'undefined') {
        node.natnlty = nn.VALUE;
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

// create an array of connection ids in each indiv/entity  
var addConnectionIdsArray = function (nodes) {
  var loopStop;
  var comments;
  var linkRegexMatch;
  nodes.forEach(function (node) {
    var connectionIds = new Set();
    node.connectedToId = [];
    comments = node.COMMENTS1;
    if ((typeof comments !== 'undefined') && (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) !== 'undefined')) {
      linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
      if (linkRegexMatch !== null) {
        //linkRegexMatch.forEach(function(match) {
// LOOP THROUGH EACH REGEX MATCH
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; node.id = ", node.id, "; node.name = ", node.name, "; has ", linkRegexMatch.length, "link regex matches");
        }
        for (var l = 0; l < linkRegexMatch.length; l++) {
          if (linkRegexMatch[l] !== node.id) {
            loopStop = false;
            connectionIds.add(linkRegexMatch[l]);
            while (loopStop = false) {
              for (var m = 0; m < node.connectedToId.length; m++) {
                if (linkRegexMatch[l] === node.connectedToId[m]) {
                  loopStop = true;
                }
              }
              node.connectedToId.push(linkRegexMatch[l]);
              node.links.push(linkRegexMatch[l]);
            }
          }
        }
      }
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; node.id = ", node.id, "; node.name = ", node.name, "; has connectionIds set: ", connectionIds);
      }
    }
    node.linkSetArray = [];
    connectionIds.forEach(function (linkId) {
      node.linkSetArray.push(linkId);
    });

    node.connectionSet = connectionIds;
    node.connectedToId = node.linkSetArray;
  });
};

// within each node, create array of connection objects with source and target
var addConnectionObjectsArray = function (nodes) {
// for each node
  var connection;
  nodes.forEach(function (node) {
    node.connections = [];
    // var id = node.id;
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
    console.log("\n ", __filename, "line", "line", "line", __line, "; data.nodes[1] = ", data.nodes[1]);
  }
  data.links = [];
  (data.nodes).forEach(function (node) {
    // data.links = [];
    if ((typeof node.connections != 'undefined') && (typeof node.connections.length != 'undefined') && (node.connections.length > 0)) {
      node.connections.forEach(function (conn) {
        data.links.push(conn);
      });
    }
  });
};

// count the links
/*
 var countLinks2 = function (nodes) {
 nodes.forEach(function (outerNode) {

 outerNode.linkCount2 = 0;
 var outerLoopNodeId = outerNode.id;

 nodes.forEach(function (innerNode) {
 var innerLoopNodeId = innerNode.id;
 var innerNodeLinksIdsArray = innerNode.linkedIds;
 if (outerLoopNodeId != innerLoopNodeId) {
 innerNodeLinksIdsArray.forEach(function (innerNodeLinkId) {
 if (innerNodeLinkId === outerLoopNodeId) {
 outerNode.linkCount2++;
 }
 });
 }
 });

 // if ((typeof node.connections != 'undefined') && (typeof node.connections.length != 'undefined')) {
 // node.linkCount = node.connections.length;
 if (consoleLog) {
 console.log("\n ", __filename, "line", __line, "; outerNode.id = ", outerNode.id, "; outerNode.linkCount2 =  ", outerNode.linkCount2);
 }

 });
 };
 */
// count the links
var countLinks = function (nodes) {
  nodes.forEach(function (node) {
    node.linkCount = node.linkedIds.length;
//    if ((typeof node.connections != 'undefined') && (typeof node.connections.length != 'undefined')) {
//      node.linkCount = node.connections.length;
//    }
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
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; ", link.target, " DOES NOT EXIST.");
      }
      throw "missing target error";
    }
  });
};

// put links into a set
// https://www.npmjs.org/package/backpack-node

// create an array of links within each entity/indiv containing ids of related parties
var addLinksSet = function (data) {
  var comments;
  var linkRegexMatch;
  var setOfLinks;
var count;
  data.nodes.forEach(function (node) {
    node.linkSet = null;
    // var node.linkSet;

    setOfLinks = new Set();
    data.links.forEach(function (link) {
      if (link.source === node.id) {
        if (link.target !== node.id) {
          setOfLinks.add(link.target);
        }
      }
      if (link.target === node.id) {
        if (link.source !== node.id) {
          setOfLinks.add(link.source);
        }
      }
    });

    if (true) {
      console.log("\n ", __filename, "line", __line, ";  setOfLinks.count = ", setOfLinks.count);

    }

    node.linkSet = setOfLinks;
    node.linkSetCount = setOfLinks.count;
    //count = setOfLinks.count();

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

var inspectSomeArrayObjects = function (array, numOfObjectsToShow) {
  array.forEach(function (object) {
    counter++;
    if (counter <= numOfObjectsToShow) {
      console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; object = \n", util.inspect(object, false, null));
    }
  });
};

module.exports = {
  fixData: fixData
};
