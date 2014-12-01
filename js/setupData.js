// setupData.js
// put data in arrays for d3
//==========================

if (typeof define !== 'function') {
  var define = require('amdefine');
}
var missingNodes = require('./missing_nodes.js');
var logger = require('./libs/logger.js');
var trunc = require('./trunc.js');

var async = require('async'),
  re = require('request-enhanced'),
  request = require('request'),
  fse = require('fs-extra'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect');
// jsonpatch = require('json-patch'),
//parseString = require('xml2js')
// .parseString;
var truncateToNumChars = 400;
var counter = 0;
var numObjectsToShow = 2;
var data;
var generatedFileDateString;
// var backbone =  require('backbone');
var Set = require("backpack-node").collections.Set;
var Bag = require("backpack-node").collections.Bag;
//console.log("\n __dirname = ", __dirname + '\n');
// var counter = 0;

var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};

var jsonFile = "";
var getJsonFile = function () {
  return jsonFile;
};
var dateGenerated;
// var data;
// data.nodes = [];
var consoleLog = false;

var fixData = function () {
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, "; running setupData.fixData()");
  }
  var functionCount = 0;
  // var nodes = [];
  var newData = {};
  var aliases;
  var comments = "";
  var links = [];
  var connectedToId;
  var aliasCount = 0;
  var aliasArray = [];
  var linkRegexMatch;
  var connection;
  var source;
  var target;
  var missing_ents;
  var missing_indivs;
  var ents = [];
  var indivs = [];

  async.series([
    function (callback) {
      // read json file   
      var rawJsonFileName = __dirname + "/../data/output/AQList-raw.json";

      jsonFile = fse.readFileSync(rawJsonFileName); //, fsOptions); //, function (err, data) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; jsonFile = \n", trunc.truncn(JSON.stringify(jsonFile), 200));
      }
      // saveJsonFile("data1.json");
      callback();
    },
    function (callback) {
      saveJsonFile(JSON.stringify(jsonFile), "data1.json");
      callback();
    },
    function (callback) {
      // get missing nodes
      missing_ents = missingNodes.getMissingEnts();
      // if (consoleLog) { console.log("\n ", __filename, "line", "line", __line, "; missing_ents = ", missing_ents);
      missing_indivs = missingNodes.getMissingIndivs();
      // if (consoleLog) { console.log("\n ", __filename, "line", "line", __line, "; missing_indivs = ", missing_indivs);
      callback();
    },
    function (callback) {
      // rearrange the data into arrays for d3
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function 2#:", ++functionCount, "; re-arrange data");
      }
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; jsonFile = \n", trunc.n400(JSON.stringify(jsonFile)));
      }
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; typeof jsonFile = \n", (typeof jsonFile));
      }
      var aliases;
      var comments = "";
      var connectedToId;
      var aliasCount = 0;
      var aliasArray = [];
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; typeof data= ", (typeof jsonFile));
      }
      if (consoleLog) {
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
      if (true) {
        // <!-- date generated -->
        console.log("\n ", __filename, "line", __line, "; typeof conList = ", (typeof conList), "; dateAqListGeneratedString = ", dateAqListGeneratedString, "; dateAqListGenerated = ", dateAqListGenerated);
      }
      // PROCESS ENTITIES
      // put entities in data.ents array
      counter = 0;
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; conList.ENTITIES.ENTITY.length = ", conList.ENTITIES.ENTITY.length);
      }
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; conList.INDIVIDUALS.INDIVIDUAL.length = ", conList.INDIVIDUALS.INDIVIDUAL.length);
      }
      missing_ents.forEach(function (ent) {
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; missing_ents ent = ", ent);
        }
        if (consoleLog) {
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
      }
      if (consoleLog) {
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
      conList.INDIVIDUALS.INDIVIDUAL.forEach(function (indiv) {
        counter++;
        if (counter <= numObjectsToShow) {
          if (consoleLog) {
            console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; util.inspect(indiv, false, null) = ", util.inspect(indiv, false, null));
          }
        }
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
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; ents.length = ", ents.length);
      }
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; indivs.length = ", indivs.length);
      }
      data = conList;
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; typeof data = ", typeof data);
      }
      // saveJsonFile("data2.json");
      callback();
    },

    function (callback) {
      saveJsonFile(data, "data2.json");
      callback();
    },

    function (callback) {
      // entities and indivs were in separate arrays; the two arrays are merged into a single array of 'nodes'
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; put ents and indivs into nodes array");
      }
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; typeof data = ", typeof data);
      }

// SET
      // https://www.npmjs.org/package/backpack-node
      counter = 0;
      var setOfNodes = new Set();
      data.ents.forEach(function (ent) {
        counter++;
        setOfNodes.add(ent);
      });
      data.indivs.forEach(function (indiv) {
        counter++;
        setOfNodes.add(indiv);
      });
      missing_ents.forEach(function (missing_ent) {
        counter++;
        setOfNodes.add(missing_ent);
      });
      missing_indivs.forEach(function (missing_indiv) {
        counter++;
        setOfNodes.add(missing_indiv);
      });
      console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; setOfNodes.count = ", setOfNodes.count);

      // nodeBag!
// https://www.npmjs.org/package/backpack-node
      var nodeBag = new Bag();
      counter = 0;
      data.ents.forEach(function (ent) {
        counter++;
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; ent.id = ", ent.id);
        }
        if (!(ent.id)) {
          ent.id = counter;
          //var errorMessage = "no id error " + JSON.stringify(ent);
          //throw errorMessage;
          nodeBag.add(ent.id, ent);
        } else {
          nodeBag.add(ent.id, ent);
        }

        // console.log("\n ", __filename, "line", __line, "counter = ", counter ,"; nodeBag.length = ", nodeBag.count);
      });

      data.indivs.forEach(function (indiv) {
        counter++;
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; indiv.id = ", indiv.id);
        }
        if (!(indiv.id)) {
          indiv.id = counter;
        }
        nodeBag.add(indiv.id, indiv);
        //       console.log("\n ", __filename, "line", __line, "counter = ", counter ,"; nodeBag.length = ", nodeBag.count);
      });
      missing_ents.forEach(function (missing_ent) {
        counter++;
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; missing_ent.id = ", missing_ent.id);
        }
        if (!(missing_ent.id)) {
          missing_ent.id = counter;
        }
        nodeBag.add(missing_ent.id, missing_ent);
      });
      missing_indivs.forEach(function (missing_indiv) {
        counter++;
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; missing_indiv.id = ", missing_indiv.id);
        }
        if (!(missing_indiv.id)) {
          missing_indiv.id = counter;
        }
        nodeBag.add(missing_indiv.id, missing_indiv);
      });
      console.log("\n ", __filename, "line", __line, "Bag counter = ", counter);
//      console.log("\n ", __filename, "line", __line, "; nodeBag = ", nodeBag);
      counter = 0;
    /*
      nodeBag.forEach(function (item) {
        counter++;
        console.log(counter, "Key: " + item.key, " Value: " + item.value);
      });
*/
      data.nodes = ents.concat(indivs);
      data.nodes = ents.concat(indivs);
      data.nodes = data.nodes.concat(missing_ents);
      data.nodes = data.nodes.concat(missing_indivs);


      var myBag = new Bag();
      myBag.add(1, data.nodes[1]);
      myBag.add(2, "b");
      myBag.add(2, "c");

      myBag.forEach(function (item)
      {
        console.log("Key: " + item.key);
        console.log("Value: " + item.value);
      });


      var nodeBag2 = new Bag();
      counter = 0;
      var nodes = data.nodes;
      nodes.forEach(function (node) {
        counter++;
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; ent.id = ", ent.id);
        }
      //  if (!(node.id)) {
          // node.id = counter;
          node.id = getCleanId(node.REFERENCE_NUMBER);
      //  }
          //var errorMessage = "no id error " + JSON.stringify(ent);
          //throw errorMessage;
          nodeBag2.add(node.id, node);

      });
      console.log("\n ", __filename, "line", __line, "nodeBag2 counter = ", counter,"; nodeBag2._map.count = ", nodeBag2._map.count);

      var buckets = nodeBag2._map._buckets;
      buckets.forEach(function (item)
      {
        console.log("Key: " + item.key);
        console.log("Value: " + item.value);
      });


      concatNames(data.nodes);
      data.dateGenerated = generatedFileDateString; // data.CONSOLIDATED_LIST.$.dateGenerated;
      counter = 0;
      data.nodes.forEach(function (node) {
        counter++;
        if (counter <= numObjectsToShow) {
          if (consoleLog) {
            console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; node = ", node);
          }
        }
      });
      data.ents = null;
      data.indivs = null;
      ents = null;
      indivs = null;
      callback();
    }

    ,
    function (callback) {
      saveJsonFile(data, "data3addMissingNodes-concatNames.json");
      callback();
    }

    ,

    function (callback) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; clean up Ids");
      }
      cleanUpIds(data.nodes);
      callback();
    }

    ,

    function (callback) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; create nationality");
      }
      createNationality(data.nodes);
      callback();
    }

    ,

    function (callback) {
      saveJsonFile(data, "data4cleanupids.json");
      callback();
    }

    ,

    function (callback) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; addConnectionIdsArray(data.nodes)");
      }
      addConnectionIdsArray(data.nodes);
      if (consoleLog) {
        console.log(data.nodes[1]);
      }
      callback();
    }

    ,

    function (callback) {
      saveJsonFile(data, "data5addconnidsarray.json");
      callback();
    }

    ,

    function (callback) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; addConnectionObjectsArray");
      }
      addConnectionObjectsArray(data.nodes);
      if (consoleLog) {
        console.log(data.nodes[1]);
      }
      callback();
    }

    ,
    function (callback) {
      saveJsonFile(data, "data6addconnectionOBJECTSarray.json");
      callback();
    }

    ,

    function (callback) {
      if (consoleLog) {
        console.log("\n 283 function #:", ++functionCount, "; consolidate links into links array");
      }
      consolidateLinks(data);
      if (consoleLog) {
        console.log(data.links[1]);
      }
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; data.links.length = ", data.links.length);
      }
      callback();
    }

    ,

    function (callback) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; addLinksArray(data.nodes)");
      }
      addLinksArray(data.nodes);
      countSourceTarget(data.nodes, data.links);
      if (consoleLog) {
        console.log(data.nodes[1]);
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
      }
      // countLinks(data.nodes);
      if (consoleLog) {
        console.log(data.nodes[1]);
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
          console.log("\n ", __filename, "line", __line, ";  file written to: ", myFile);
        }
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, ";  file contained: ", trunc.n400(util.inspect(myJsonData, false, null)));
        }
      } catch (e) {
        console.log("\n ", __filename, "line", __line, ";  Error: ", e);
        callback();
      }
      callback();
    },
    function (callback) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; save clean json file");
      }
      // var saveJson = function () {
      var myJsonData = JSON.stringify(data, null, " ");
      // if (consoleLog) { console.log("myJsonData =", myJsonData);
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; data.nodes.length = ", data.nodes.length);
      }
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; data.links.length = ", data.links.length);
      }
      callback();
    },
    function (callback) {
      var dummy = function () {
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
        }
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; last function");
        }
        callback();
      }();
    }]);
};

var cleanUpIds = function (nodes) {
  counter = 0;
  nodes.forEach(function (node) {
    counter++;
    //   var rawRefNum = node.REFERENCE_NUMBER;
//    if (consoleLog) { console.log("\n ", __filename, "line", __line, "; node.FIRST_NAME = ", node.FIRST_NAME, , "; node =", node, "; counter = ", counter);
    var rawRefNum = node.REFERENCE_NUMBER;
    // remove period from end of all reference numbers that have them; not all do.
    var refNumRegexMatch;
    try {
      refNumRegexMatch = (node.REFERENCE_NUMBER)
        .match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
    } catch (error) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; Error: ", error, "; node =", node, "; counter = ", counter);
      }
    }

    // var id =
    //  clean up indiv id for consistency;  none should have trailing period.
    node.id = refNumRegexMatch[0];
    if ((node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/)[0] !== node.id) {
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

//  clean up indiv id for consistency;  none should have trailing period.
var getCleanId = function (referenceNumber) {
    // remove period from end of all reference numbers that have them; not all do.
    var refNumRegexMatch;
    try {
      refNumRegexMatch = referenceNumber
        .match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
    } catch (error) {
        console.log("\n ", __filename, "line", __line, "; Error: ", error, "; node =", node, "; counter = ", counter);
    }
    return refNumRegexMatch[0];
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
      name = name.concat(firstName);
    }
    if (secondName) {
      name = name.concat(" ", secondName);
    }
    if (thirdName) {
      name = name.concat(" ", thirdName);
    }
    if (fourthName) {
      name = name.concat(" ", fourthName);
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
        //node.NATIONALITY.forEach(function (nat) {
        node.natnlty = nn.VALUE;
        //});
      }
    }
  });
};
// create a links array in each entity/indiv containing ids of related parties
var addLinksArray = function (nodes) {
  var comments;
  var linkRegexMatch;
  data.nodes.forEach(function (node) {
    node.links = [];
    comments = node.COMMENTS1;
    if ((typeof comments != 'undefined') && (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) != 'undefined')) {
      linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
      // if (consoleLog) { console.log("91 linkRegexMatch = ", linkRegexMatch);
      if ((typeof(linkRegexMatch) !== 'undefined') && (linkRegexMatch !== null)) {
        for (var n = 0; n < linkRegexMatch.length; n++) {
          if (node.id === linkRegexMatch[n]) {

            if (consoleLog) {
              console.log("node id error" + node.id + " ===  " + linkRegexMatch[n]);
            }
          } else {
            node.links.push(linkRegexMatch[n]);
          }
        }
      }
      // if (consoleLog) { console.log("node with links", node);
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
    if ((typeof comments != 'undefined') && (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) != 'undefined')) {
      linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
      // if (consoleLog) { console.log("133 linkRegexMatch = ", linkRegexMatch);
      if ((typeof(linkRegexMatch) !== 'undefined') && (linkRegexMatch !== null)) {
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

// create array of connection objects with source and target
var addConnectionObjectsArray = function (nodes) {
// for each node
  var connection;
  nodes.forEach(function (node) {
    node.connections = [];
    // var connection;
//    if((typeof node.connectedToId != 'undefined') && (typeof node.connectedToId.length != 'undefined') && (node.connectedToId.length > 0)) {
    var id = node.id;
    node.connectedToId.forEach(function (connId) {

      if (id !== connId) {
        connection = {};
        connection.source = id;
        connection.target = connId;
      }
      for (var c = 0; c < node.connections.length; c++) {
        if (connId === node.connections[c]) {
          return
        }
      }

      node.connections.push(connection);
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; id = ", id, "; connection = ", connection);
      }
    })

  })
};

// consolidate links; remove duplicates, BUT DOES IT REALLY?
// create array of connection objects with source and target
var consolidateLinks = function (data) {
  // if (consoleLog) { console.log("\n ", __filename, "line",__line, "; data = ", data);
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, "; data.nodes[0] = ", data.nodes[0]);
  }
  if (consoleLog) {
    console.log("\n ", __filename, "line", "line", "line", __line, "; data.nodes[1] = ", data.nodes[1]);
  }

  data.links = [];
  (data.nodes)
    .forEach(function (node) {
      if ((typeof node.connections != 'undefined') && (typeof node.connections.length != 'undefined') && (node.connections.length > 0)) {
        node.connections.forEach(function (conn) {
          data.links.push(conn);
        });
      }
    });
};
// count the links      

var countLinks = function (nodes) {
  nodes.forEach(function (node) {
    if ((typeof node.connections != 'undefined') && (typeof node.connections.length != 'undefined')) {
      node.linkCount = node.connections.length;
    }
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

var countSourceTarget = function (nodes, links) {
  var tarCount = 0;
  var souCount = 0;
  nodes.forEach(function (node) {
    // for(var n in nodes) {
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, ";  node = ", node);
    }
    if (consoleLog) {
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

      node.linkCount = node.sourceCount + node.targetCount;
    });
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, "; node.sourceCount = ", node.sourceCount);
    }
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, "; node.targetCount = ", node.targetCount);
    }
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, "; tarCount = ", tarCount);
    }
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, "; souCount = ", souCount);
    }
  })
};

var saveJsonFile = function (jsonData, fileName) {
/// if (consoleLog) { console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; save clean json file");
// var saveJson = function () {
  try {
    var myFile = __dirname + "/../data/output/" + fileName;
    var myJsonData = JSON.stringify(jsonData, null, " ");
    // if (consoleLog) { console.log("myJsonData =", myJsonData);
    fse.writeFileSync(myFile, myJsonData, fsOptions);
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, ";  file written to: ", myFile);
    }
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, ";  file contained: ", trunc.n400(util.inspect(myJsonData, false, null)));
    }

  } catch (e) {
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, ";  Error: ", e);
    }

  }
};

var missing_nodes = [{
  "name": "Fahd Mohammed Ahmed al-Quso (no longer listed)",
  "id": "QI.A.288.10",
  "REFERENCE_NUMBER": "QI.A.288.10",
  "COMMENTS1": "",
  "indiv0OrEnt1": 0

}, {
  "name": "Usama Bin Laden (no longer listed)",
  "id": "QI.B.8.01",
  "REFERENCE_NUMBER": "QI.B.8.01",
  "COMMENTS1": "",
  "indiv0OrEnt1": 0
}, {
  "name": "International Islamic Relief Organization, Philippines, branch offices (no longer listed)",
  "id": "QE.I.126.06",
  "REFERENCE_NUMBER": "QE.I.126.06",
  "COMMENTS1": "",
  "indiv0OrEnt1": 1
}, {
  "name": "Wa&apos;el Hamza Abd al-Fatah Julaidan (no longer listed)",
  "id": "QI.J.79.02",
  "REFERENCE_NUMBER": "QI.J.79.02",
  "COMMENTS1": "",
  "indiv0OrEnt1": 0
}];

var missing_ents0 = [{
  "name": "International Islamic Relief Organization, Philippines, branch offices (no longer listed)",
  "FIRST_NAME": "International Islamic Relief Organization, Philippines, branch offices (no longer listed)",
  "id": "QE.I.126.06",
  "REFERENCE_NUMBER": "QE.I.126.06",
  "COMMENTS1": "",
  "indiv0OrEnt1": 1
}, {
  "name": "Aid Organization of the Ulema, Pakistan (no longer listed)",
  "FIRST_NAME": "Aid Organization of the Ulema, Pakistan (no longer listed)",
  "id": "QE.A.73.02",
  "REFERENCE_NUMBER": "QE.A.73.02",
  "COMMENTS1": "Until 21 Oct. 2008, this entity appeared also as &quot;Aid Organization of the Ulema, Pakistan&quot; (QE.A.73.02.), listed on 24 Apr. 2002 and amended on 25 Jul. 2006. The two entries Al Rashid Trust (QE.A.5.01.) and Aid Organization of the Ulema, Pakistan (QE.A.73.02.) were consolidated into this entity on 21 Oct. 2008. Founded by Mufti Rashid Ahmad Ledahyanoy (QI.L.30.01). Associated with Jaish-i-Mohammed (QE.J.19.01). Banned in Pakistan since Oct. 2001. Despite the closure of its offices in Pakistan in February 2007 it has continued its activities. Review pursuant to Security Council resolution 1822 (2008) was concluded on 6 May 2010.",
  "indiv0OrEnt1": 1
}, {
  "name": "Benevolence International Fund  (no longer listed)",
  "FIRST_NAME": "Benevolence International Fund  (no longer listed)",
  "id": "QE.B.94.02",
  "REFERENCE_NUMBER": "QE.B.94.02",
  "COMMENTS1": "",
  "indiv0OrEnt1": 1
}];

// MISSING INDIVIDUALS

var missing_indivs0 = [{
  "name": "Fahd Mohammed Ahmed al-Quso (no longer listed)",
  "id": "QI.A.288.10",
  "REFERENCE_NUMBER": "QI.A.288.10",
  "indiv0OrEnt1": 0,
  "DATAID": "empty001",
  "VERSIONNUM": "10",
  "FIRST_NAME": "Fahd Mohammed Ahmed al-Quso",
  "SECOND_NAME": "",
  "THIRD_NAME": "(no longer listed)",
  "UN_LIST_TYPE": "Al-Qaida",
  "LISTED_ON": "2016-10-06T00:00:00",
  "NAME_ORIGINAL_SCRIPT": "نشوان عبد الرزاق عبد الباقي",
  "COMMENTS1": "comments",
  "NATIONALITY": {
    "VALUE": ""
  },
  "LIST_TYPE": {
    "VALUE": "UN List"
  },
  "LAST_DAY_UPDATED": {
    "VALUE": [
      "2007-05-14T00:00:00",
      "2007-07-27T00:00:00"
    ]
  },
  "INDIVIDUAL_ALIAS": [{
    "QUALITY": "poor",
    "ALIAS_NAME": "Good Time Charlie"
  }],
  "INDIVIDUAL_ADDRESS": "",
  "INDIVIDUAL_DATE_OF_BIRTH": {
    "TYPE_OF_DATE": "type of date",
    "YEAR": "year of birth"
  },
  "INDIVIDUAL_PLACE_OF_BIRTH": {
    "CITY": "city name",
    "STATE_PROVINCE": "state province"
  },
  "INDIVIDUAL_DOCUMENT": "",
  "SORT_KEY": "__AAA",
  "SORT_KEY_LAST_MOD": "2007-07-27T00:00:00"
}, {
  "name": "Usama Bin Laden",
  "id": "QI.B.8.01",
  "REFERENCE_NUMBER": "QI.B.8.01",
  "indiv0OrEnt1": 0,
  "DATAID": "empty002",
  "VERSIONNUM": "10",
  "FIRST_NAME": "Usama Bin Laden",
  "SECOND_NAME": "",
  "THIRD_NAME": "(no longer listed)",
  "UN_LIST_TYPE": "Al-Qaida",
  "LISTED_ON": "2016-10-06T00:00:00",
  "NAME_ORIGINAL_SCRIPT": "نشوان عبد الرزاق عبد الباقي",
  "COMMENTS1": "comments",
  "NATIONALITY": {
    "VALUE": ""
  },
  "LIST_TYPE": {
    "VALUE": "UN List"
  },
  "LAST_DAY_UPDATED": {
    "VALUE": [
      "2007-05-14T00:00:00",
      "2007-07-27T00:00:00"
    ]
  },
  "INDIVIDUAL_ALIAS": [{
    "QUALITY": "poor",
    "ALIAS_NAME": "Good Time Charlie"
  }],
  "INDIVIDUAL_ADDRESS": "",
  "INDIVIDUAL_DATE_OF_BIRTH": {
    "TYPE_OF_DATE": "type of date",
    "YEAR": "year of birth"
  },
  "INDIVIDUAL_PLACE_OF_BIRTH": {
    "CITY": "city name",
    "STATE_PROVINCE": "state province"
  },
  "INDIVIDUAL_DOCUMENT": "",
  "SORT_KEY": "__AAA",
  "SORT_KEY_LAST_MOD": "2007-07-27T00:00:00"
}, {
  "name": "Wa&apos;el Hamza Abd al-Fatah Julaidan",
  "id": "QI.J.79.02",
  "REFERENCE_NUMBER": "QI.J.79.02",
  "indiv0OrEnt1": 0,
  "DATAID": "empty003",
  "VERSIONNUM": "10",
  "FIRST_NAME": "Wa&apos;el Hamza Abd al-Fatah Julaidan",
  "SECOND_NAME": "",
  "THIRD_NAME": "(no longer listed)",
  "UN_LIST_TYPE": "Al-Qaida",
  "LISTED_ON": "2016-10-06T00:00:00",
  "NAME_ORIGINAL_SCRIPT": "نشوان عبد الرزاق عبد الباقي",
  "COMMENTS1": "comments",
  "NATIONALITY": {
    "VALUE": ""
  },
  "LIST_TYPE": {
    "VALUE": "UN List"
  },
  "LAST_DAY_UPDATED": {
    "VALUE": [
      "2007-05-14T00:00:00",
      "2007-07-27T00:00:00"
    ]
  },
  "INDIVIDUAL_ALIAS": [{
    "QUALITY": "poor",
    "ALIAS_NAME": "Good Time Charlie"
  }],
  "INDIVIDUAL_ADDRESS": "",
  "INDIVIDUAL_DATE_OF_BIRTH": {
    "TYPE_OF_DATE": "type of date",
    "YEAR": "year of birth"
  },
  "INDIVIDUAL_PLACE_OF_BIRTH": {
    "CITY": "city name",
    "STATE_PROVINCE": "state province"
  },
  "INDIVIDUAL_DOCUMENT": "",
  "SORT_KEY": "__AAA",
  "SORT_KEY_LAST_MOD": "2007-07-27T00:00:00"
}, {
  "DATAID": "empty004",
  "VERSIONNUM": "10",
  "FIRST_NAME": "Wali Ur Rehman",
  "SECOND_NAME": "",
  "THIRD_NAME": "(no longer listed)",
  "UN_LIST_TYPE": "Al-Qaida",
  "REFERENCE_NUMBER": "QI.U.287.10",
  "LISTED_ON": "2016-10-06T00:00:00",
  "NAME_ORIGINAL_SCRIPT": "نشوان عبد الرزاق عبد الباقي",
  "COMMENTS1": "Wali Ur Rehman is the Emir of Tehrik-e Taliban (TTP) (QE.T.132.11) for South Waziristan",
  "NATIONALITY": {
    "VALUE": ""
  },
  "LIST_TYPE": {
    "VALUE": "UN List"
  },
  "LAST_DAY_UPDATED": {
    "VALUE": [
      "2007-05-14T00:00:00",
      "2007-07-27T00:00:00"
    ]
  },
  "INDIVIDUAL_ALIAS": [{
    "QUALITY": "poor",
    "ALIAS_NAME": "Ugly Wali"
  }],
  "INDIVIDUAL_ADDRESS": "",
  "INDIVIDUAL_DATE_OF_BIRTH": {
    "TYPE_OF_DATE": "type of date",
    "YEAR": "year of birth"
  },
  "INDIVIDUAL_PLACE_OF_BIRTH": {
    "CITY": "city name",
    "STATE_PROVINCE": "state province"
  },
  "INDIVIDUAL_DOCUMENT": "",
  "SORT_KEY": "__AAAxxx",
  "SORT_KEY_LAST_MOD": "2007-07-27T00:00:00"

}, {
  "DATAID": "empty005",
  "VERSIONNUM": "10",
  "FIRST_NAME": "Wali Ur Rehman",
  "SECOND_NAME": "",
  "THIRD_NAME": "(no longer listed)",
  "UN_LIST_TYPE": "Al-Qaida",
  "REFERENCE_NUMBER": "QI.M.286.10",
  "LISTED_ON": "2016-10-06T00:00:00",
  "NAME_ORIGINAL_SCRIPT": "نشوان عبد الرزاق عبد الباقي",
  "COMMENTS1": "Tehrik-e Taliban (TTP) (QE.T.132.11) is based in the tribal areas along the Afghanistan/Pakistan border. Formed in 2007, its leader is Hakimullah Mehsud.",
  "NATIONALITY": {
    "VALUE": ""
  },
  "LIST_TYPE": {
    "VALUE": "UN List"
  },
  "LAST_DAY_UPDATED": {
    "VALUE": [
      "2007-05-14T00:00:00",
      "2007-07-27T00:00:00"
    ]
  },
  "INDIVIDUAL_ALIAS": [{
    "QUALITY": "poor",
    "ALIAS_NAME": "Ugly Haki"
  }],
  "INDIVIDUAL_ADDRESS": "",
  "INDIVIDUAL_DATE_OF_BIRTH": {
    "TYPE_OF_DATE": "type of date",
    "YEAR": "year of birth"
  },
  "INDIVIDUAL_PLACE_OF_BIRTH": {
    "CITY": "city name",
    "STATE_PROVINCE": "state province"
  },
  "INDIVIDUAL_DOCUMENT": "",
  "SORT_KEY": "__AAAxxx",
  "SORT_KEY_LAST_MOD": "2007-07-27T00:00:00"
}
  , {
    "DATAID": "empty006",
    "VERSIONNUM": "10",
    "FIRST_NAME": "Mufti Rashid Ahmad Ledahyanoy",
    "SECOND_NAME": "",
    "THIRD_NAME": "(no longer listed)",
    "UN_LIST_TYPE": "Al-Qaida",
    "REFERENCE_NUMBER": "QI.L.30.01",
    "LISTED_ON": "",
    "NAME_ORIGINAL_SCRIPT": "",
    "COMMENTS1": " Founder of the Al Rashid Trust (QE.A.5.01). Until 21 Oct. 2008, the Al Rashid Trust appeared also as &quot;Aid Organization of the Ulema, Pakistan&quot; (QE.A.73.02.).",
    "NATIONALITY": {
      "VALUE": ""
    },
    "LIST_TYPE": {
      "VALUE": "UN List"
    },
    "LAST_DAY_UPDATED": {
      "VALUE": [
        "1900-05-14T00:00:00",
        "1900-07-27T00:00:00"
      ]
    },
    "INDIVIDUAL_ALIAS": [{
      "QUALITY": "poor",
      "ALIAS_NAME": "Good Time Rashid"
    }],
    "INDIVIDUAL_ADDRESS": "",
    "INDIVIDUAL_DATE_OF_BIRTH": {
      "TYPE_OF_DATE": "type of date",
      "YEAR": "year of birth"
    },
    "INDIVIDUAL_PLACE_OF_BIRTH": {
      "CITY": "city name",
      "STATE_PROVINCE": "state province"
    },
    "INDIVIDUAL_DOCUMENT": "",
    "SORT_KEY": "RashidAhmadLedahyanoy",
    "SORT_KEY_LAST_MOD": "2007-07-27T00:00:00"
  },
  {
    "DATAID": "empty007",
    "VERSIONNUM": "10",
    "FIRST_NAME": "Najmiddin Kamolitdinovich Jalolov",
    "SECOND_NAME": "",
    "THIRD_NAME": "(no longer listed)",
    "UN_LIST_TYPE": "Al-Qaida",
    "REFERENCE_NUMBER": "QI.J.240.08",
    "LISTED_ON": "2016-10-06T00:00:00",
    "NAME_ORIGINAL_SCRIPT": "",
    "COMMENTS1": "Leader of ",
    "NATIONALITY": {
      "VALUE": ""
    },
    "LIST_TYPE": {
      "VALUE": "UN List"
    },
    "LAST_DAY_UPDATED": {
      "VALUE": [
        "2007-05-14T00:00:00",
        "2007-07-27T00:00:00"
      ]
    },
    "INDIVIDUAL_ALIAS": [{
      "QUALITY": "poor",
      "ALIAS_NAME": "Good Time ...."
    }],
    "INDIVIDUAL_ADDRESS": "",
    "INDIVIDUAL_DATE_OF_BIRTH": {
      "TYPE_OF_DATE": "type of date",
      "YEAR": "year of birth"
    },
    "INDIVIDUAL_PLACE_OF_BIRTH": {
      "CITY": "city name",
      "STATE_PROVINCE": "state province"
    },
    "INDIVIDUAL_DOCUMENT": "",
    "SORT_KEY": "__AAA",
    "SORT_KEY_LAST_MOD": "2007-07-27T00:00:00"
  }, {
    "DATAID": "empty008",
    "VERSIONNUM": "10",
    "FIRST_NAME": "Suhayl Fatilloevich Buranov",
    "SECOND_NAME": "",
    "THIRD_NAME": "(no longer listed)",
    "UN_LIST_TYPE": "Al-Qaida",
    "REFERENCE_NUMBER": "QI.B.239.08",
    "LISTED_ON": "2016-10-06T00:00:00",
    "NAME_ORIGINAL_SCRIPT": "",
    "COMMENTS1": "Leader of ...",
    "NATIONALITY": {
      "VALUE": ""
    },
    "LIST_TYPE": {
      "VALUE": "UN List"
    },
    "LAST_DAY_UPDATED": {
      "VALUE": [
        "1900-05-14T00:00:00",
        "1900-07-27T00:00:00"
      ]
    },
    "INDIVIDUAL_ALIAS": [{
      "QUALITY": "poor",
      "ALIAS_NAME": "Good Time ...."
    }],
    "INDIVIDUAL_ADDRESS": "",
    "INDIVIDUAL_DATE_OF_BIRTH": {
      "TYPE_OF_DATE": "type of date",
      "YEAR": "year of birth"
    },
    "INDIVIDUAL_PLACE_OF_BIRTH": {
      "CITY": "city name",
      "STATE_PROVINCE": "state province"
    },
    "INDIVIDUAL_DOCUMENT": "",
    "SORT_KEY": "__AAA",
    "SORT_KEY_LAST_MOD": "2007-07-27T00:00:00"
  }];

/*

 var empty_indiv = [{
 "DATAID": "empty000",
 "VERSIONNUM": "10",
 "FIRST_NAME": "first name",
 "SECOND_NAME": "",
 "THIRD_NAME": "(no longer listed)",
 "UN_LIST_TYPE": "Al-Qaida",
 "REFERENCE_NUMBER": "QI.TBD",
 "LISTED_ON": "2016-10-06T00:00:00",
 "NAME_ORIGINAL_SCRIPT": "",
 "COMMENTS1": "comments",
 "NATIONALITY": {
 "VALUE": ""
 },
 "LIST_TYPE": {
 "VALUE": "UN List"
 },
 "LAST_DAY_UPDATED": {
 "VALUE": [
 "2007-05-14T00:00:00",
 "2007-07-27T00:00:00"
 ]
 },
 "INDIVIDUAL_ALIAS": [{
 "QUALITY": "poor",
 "ALIAS_NAME": "Good Time ...."
 }],
 "INDIVIDUAL_ADDRESS": "",
 "INDIVIDUAL_DATE_OF_BIRTH": {
 "TYPE_OF_DATE": "type of date",
 "YEAR": "year of birth"
 },
 "INDIVIDUAL_PLACE_OF_BIRTH": {
 "CITY": "city name",
 "STATE_PROVINCE": "state province"
 },
 "INDIVIDUAL_DOCUMENT": "",
 "SORT_KEY": "__AAA",
 "SORT_KEY_LAST_MOD": "2007-07-27T00:00:00"
 }];
 */

module.exports = {
  fixData: fixData
};
