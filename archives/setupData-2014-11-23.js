if(typeof define !== 'function') {
  var define = require('amdefine');
}
var trunc = require('./trunc.js');
var truncateToNumChars = 400;
var counter = 0;
var numObjectsToShow = 2;

var async = require('async'),
  re = require('request-enhanced'),
  request = require('request'),
  fs = require('fs'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect'),
      jsonpatch = require('json-patch'),
  parseString = require('xml2js')
    .parseString;

// console.log("\n __dirname = ", __dirname + '\n');
var counter = 0;

var cleanUpIds = function(nodes) {
  counter = 0;
  nodes.forEach(function(node) {
    counter++;
    var rawRefNum = node.REFERENCE_NUMBER;
    // remove period from end of all reference numbers that have them; not all do.
    refNumRegexMatch = (node.REFERENCE_NUMBER)
      .match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
    var id = refNumRegexMatch[0];
    //  clean up indiv id for consistency;  none should have trailing period.
    node.id = id;
    if(counter <= numObjectsToShow) {
      console.log("29 node with ids", node);
    }
  });
};

// create a links array in each entity/indiv containing ids of related parties
var addLinksArray = function(nodes) {
  data.nodes.forEach(function(node) {
    node.links = [];
    comments = node.COMMENTS1;
    if((typeof comments != 'undefined') && (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) != 'undefined')) {
      linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
      // console.log("91 linkRegexMatch = ", linkRegexMatch);
      if((typeof(linkRegexMatch) !== 'undefined') && (linkRegexMatch !== null)) {
        for(var l = 0; l < linkRegexMatch.length; l++) {
          node.links.push(linkRegexMatch[l]);
        }
      }
      // console.log("node with links", node);
    }
  });
};

// create an array of connection ids in each indiv/entity  
var addConnectionIdsArray = function(nodes) {
  nodes.forEach(function(node) {
    node.connectedToId = [];
    comments = node.COMMENTS1;
    if((typeof comments != 'undefined') && (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) != 'undefined')) {
      linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
      // console.log("133 linkRegexMatch = ", linkRegexMatch);
      if((typeof(linkRegexMatch) !== 'undefined') && (linkRegexMatch !== null)) {
        for(var l = 0; l < linkRegexMatch.length; l++) {
          node.connectedToId.push(linkRegexMatch[l]);
        }
      }
      // console.log("136 node with array of links", node);
    }
  });
};

// create array of connection objects with source and target
var addConnectionObjectsArray = function(nodes) {
  nodes.forEach(function(node) {
    node.connections = [];
    var connection = {};
    if((typeof node.connectedToId != 'undefined') && (typeof node.connectedToId.length != 'undefined') && (node.connectedToId.length > 0)) {
      var id = node.id;
      for(var l = 0; l < node.connectedToId.length; l++) {
        if(id !== node.connectedToId) {
          connection.source = id;
          connection.target = node.connectedToId[l];
          node.connections.push(connection);
        }
      }
    }
  });
};

// consolidate links; remove duplicates
// create array of connection objects with source and target
var consolidateLinks = function(data) {
  data.links = [];
  (data.nodes).forEach(function(node) {
    if((typeof node.connections != 'undefined') && (typeof node.connections.length != 'undefined') && (node.connections.length > 0)) {
      node.connections.forEach(function(conn) {
        data.links.push(conn);
      });
    }
  });
};
// count the links      
var countLinks = function(nodes) {
  nodes.forEach(function(node) {
    if((typeof node.connections != 'undefined') && (typeof node.connections.length != 'undefined')) {
      node.linkCount = node.connections.length;
    }
  });
};

var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};

var jsonFile = "";
var getJsonFile = function() {
  return jsonFile;
};

var data = {};
data.nodes = [];


var fixData = function() {
  var functionCount = 0;
  var nodes = [];
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
  var ents = [];
  var indivs = [];

  async.series([
    function(callback) {
      // collect json file
      (function() {
        console.log("\n 69 function 1#:", ++functionCount, "; collect json file");
        jsonFile = fs.readFileSync(__dirname + "/../data/output/AQList-raw.json", fsOptions);
        console.log("\n 71 jsonFile = \n", trunc.n400(jsonFile.toString()));
        data = JSON.parse(jsonFile);
        callback();
      })();
    },
    function(callback) {
      // rearrange the data into arrays for d3
      (function() {
        console.log("\n 78 function 2#:", ++functionCount, "; re-arrange data");
        // var newData = {};
        var aliases;
        var comments = "";
        // var links = [];
        var connectedToId;
        var aliasCount = 0;
        var aliasArray = [];
        var conList = data.CONSOLIDATED_LIST;

        console.log("\n 63 typeof conList = ", typeof conList);
        // console.log("\n 64 util.inspect(conList, false, null) = ", util.inspect(conList, false, null));
        // put entities in data.ents array
        counter = 0;
        conList.ENTITIES.ENTITY.forEach(function(ent) {
          counter++;
          if(counter <= numObjectsToShow) {
            console.log("\n 107 counter = ", counter, "; util.inspect(ent, false, null) = ", util.inspect(ent, false, null));
          }
          ents.push(ent);
        });
        console.log("\n 210 typeof ents = ", typeof ents);
        console.log("\n 80 ents.length = ", ents.length);
        // put indivs in data.indivs array
        counter = 0;
        conList.INDIVIDUALS.INDIVIDUAL.forEach(function(indiv) {
          counter++;
          if(counter <= numObjectsToShow) {
            console.log("\n 118 counter = ", counter, "; util.inspect(indiv, false, null) = ", util.inspect(indiv, false, null));
          }
          indivs.push(indiv);
        });
        console.log("\n 122 indivs.length = ", indivs.length);
        // entities and indivs in separate arrays each go into a single array of 'nodes'
        // create an identifier to distinguish indivs from entities
        ents.forEach(function(ent) {
          // 1 = entity; 0 = individual
          ent.indiv0OrEnt1 = 1;
        });
        indivs.forEach(function(indiv) {
          // 1 = entity; 0 = individual
          indiv.indiv0OrEnt1 = 0;
        });
        callback();
      })();
    },
    function(callback) {
      // entities and indivs were in separate arrays; the two arrays are merged into a single array of 'nodes'
      (function() {
        console.log("\n 238 function #:", ++functionCount, "; put ents and indivs into nodes array");
        data.nodes = ents.concat(indivs);
        data.dateGenerated = data.CONSOLIDATED_LIST.$.dateGenerated;
        
        counter = 0;
        data.nodes.forEach(function(node) {          
            counter++;
            if(counter <= numObjectsToShow) {
              console.log("244 counter = ", counter, "; node = ", node);
            }          
        });
        ents = null;
        indivs = null;
                data.CONSOLIDATED_LIST.INDIVIDUALS = null;
                        data.CONSOLIDATED_LIST.ENTITIES = null; 
        data.CONSOLIDATED_LIST = null;
        // Remove property, result: {}
        jsonpatch.apply(data, [{op: 'remove', path: '/CONSOLIDATED_LIST'}]);

        callback();
      })();

    },
    function(callback) {
      (function() {
        console.log("\n 255 function #:", ++functionCount, "; clean up Ids");
        cleanUpIds(data.nodes);
        callback();
      })();
    },
    function(callback) {
      (function() {
        console.log("\n 262 function #:", ++functionCount, "; addLinksArray(data.nodes)");
        addLinksArray(data.nodes);
        console.log(data.nodes[1]);
        callback();
      })();
    },
    function(callback) {
      (function() {
        console.log("\n 269function #:", ++functionCount, "; addConnectionIdsArray(data.nodes)");

        addConnectionIdsArray(data.nodes);
        console.log(data.nodes[1]);
        callback();
      })();
    },
    function(callback) {
      (function() {
        console.log("\n 276 function #:", ++functionCount, "; addConnectionObjectsArray");
        addConnectionObjectsArray(data.nodes);
        console.log(data.nodes[1]);
        callback();
      })();
    },
    function(callback) {
      (function() {
        console.log("\n 283 function #:", ++functionCount, "; consolidate links into links array");
        consolidateLinks(data);
        console.log(data.links[1]);
        callback();
      })();
    },
    function(callback) {
      (function() {
        console.log("\n 290 function #:", ++functionCount);
        countLinks(data.nodes);
        console.log(data.nodes[1]);
        counter = 0;
        data.links.forEach(function(link) {
          counter++;
          if(counter <= numObjectsToShow) {
            console.log("\n 296 counter = ", counter, "; link = ", link);
          }
        });
        callback();
      })();
    },
        function (callback) {

      console.log("\n function 4#:", ++functionCount, "; save clean json file");
      
          (function() {
          // var saveJson = function () {
        try {
          var myFile = __dirname + "/../data/output/AQList-clean.json";
          var myJsonData = JSON.stringify(data);
          // console.log("myJsonData =", myJsonData);
          fs.writeFileSync(myFile, myJsonData, fsOptions);
          console.log("212 file written to: ", myFile);
          console.log("213 file contained: ", trunc.n400(util.inspect(myJsonData, false, null)));
          
        } catch (e) {
          console.log('218 Error: ', e);
          callback();
        }
        callback();
      })();
    },
  
    function(callback) {
      var dummy = function() {
        console.log("\n function #:", ++functionCount);
        console.log("last function");
        callback();
      }();
    }
  ]);
};

// var readJsonFile = function () {
// jsonFile = fs.readFileSync(__dirname + "/../data/output/AQList-raw.json", options);

//  console.log("\n32 jsonFile = \n", trunc.n400(jsonFile.toString()));
//}

// readJsonFile();
// console.log("\n 64 jsonFile = \n",  trunc.n400(jsonFile.toString()));
//console.log("33 jsonFile.inspect = \n", jsonFile.inspect.toString()
//  .trunc(399));

//  called once to clean up raw data and switch links to
//  point to node instances
//  Returns modified data
/*
var setupData = function(data) {

  var nodes = [];
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
  var conList = data.CONSOLIDATED_LIST;
  var ents = [];
  var indivs = [];
  data.ents = ents;
  data.indivs = indivs;
  console.log("\n 63 typeof conList = ", typeof conList);
  console.log("\n 64 util.inspect(conList, false, null) = ", util.inspect(conList, false, null));
  // console.log("\n 64 conList = ",conList.toString().trunc(truncateToNumChars));
  // console.log("\n 65 conList = ",util.inspect(conList).toString().trunc(truncateToNumChars));
  // var individuals = data.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL;
  // var entities = data.CONSOLIDATED_LIST.ENTITIES.ENTITY;
  // var indivs = conList.INDIVIDUALS.INDIVIDUAL;
  // var ents = conList.ENTITIES.ENTITY;

  counter = 0;
  conList.ENTITIES.ENTITY.forEach(function(ent) {
    counter++;
    if(counter <= numObjectsToShow) {
      console.log("\n 74 counter = ", counter, "; util.inspect(ent, false, null) = ", util.inspect(ent, false, null));
    }
    data.ents.push(ent);
  });

  console.log("typeof ents = ", typeof ents);
  console.log("\n 80 data.ents.length = ", data.ents.length);

  counter = 0;
  conList.INDIVIDUALS.INDIVIDUAL.forEach(function(indiv) {
    counter++;
    if(counter <= numObjectsToShow) {
      console.log("\n 86 counter = ", counter, "; util.inspect(indiv, false, null) = ", util.inspect(indiv, false, null));
    }
    data.indivs.push(indiv);
  });
  console.log("\n 90 data.indivs.length = ", data.indivs.length);

  // for consistency, indivs will be identified by ids derived by removing any trailing period from REFERENCE_NUMBER
  var cleanUpIds = function(nodes) {
    nodes.forEach(function(node) {
      var rawRefNum = node.REFERENCE_NUMBER;
      // remove period from end of all reference numbers that have them; not all do.
      refNumRegexMatch = (node.REFERENCE_NUMBER)
        .match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
      var id = refNumRegexMatch[0];
      //  clean up indiv id for consistency;  none should have trailing period.
      node.id = id;
      console.log("105 node with ids", node);
    });
  };
  cleanUpIds(data.indivs);
  cleanUpIds(data.ents);

};
*/
// setupData(data);
// fixData();

// setupData(jsonFile);
module.exports = {
  
  fixData: fixData

};