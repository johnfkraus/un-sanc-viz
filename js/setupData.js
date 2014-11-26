// setupData.js
// put data in arrays for d3
//==========================

if(typeof define !== 'function') {
  var define = require('amdefine');
}

var async = require('async'),
  re = require('request-enhanced'),
  request = require('request'),
  fse = require('fs-extra'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect'),
  jsonpatch = require('json-patch'),
  parseString = require('xml2js')
    .parseString;

var trunc = require('./trunc.js');
var truncateToNumChars = 400;
var counter = 0;
var numObjectsToShow = 2;

// console.log("\n __dirname = ", __dirname + '\n');
var counter = 0;

var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};

var jsonFile = "";
var getJsonFile = function() {
  return jsonFile;
};
var dateGenerated;
// var data;
// data.nodes = [];

var fixData = function() {
  console.log("\n ", __filename, "line", __line, "; running setupData.fixData()");
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
  var ents = [];
  var indivs = [];

  async.series([
    function(callback) {
      // read json file   
      var rawJsonFileName = __dirname + "/../data/output/AQList-raw.json";
      var descr = "; reading raw json file: " + rawJsonFileName;
      console.log("\n ", __filename, "line", __line, "; function 1#:", ++functionCount, descr, fsOptions);
      jsonFile = fse.readFileSync(rawJsonFileName); //, fsOptions); //, function (err, data) {
      console.log("\n ", __filename, "line", __line, "; jsonFile = \n", trunc.truncn(JSON.stringify(jsonFile),200)); 
      callback();
    },
    function(callback) {
      // rearrange the data into arrays for d3
      console.log("\n ", __filename, "line", __line, "; function 2#:", ++functionCount, "; re-arrange data");
      console.log("\n ", __filename, "line", __line, "; jsonFile = \n", trunc.n400(JSON.stringify(jsonFile)));
      console.log("\n ", __filename, "line", __line, "; typeof jsonFile = \n", (typeof jsonFile));

      // var newData = {};
      // data = JSON.stringify(jsonFile);
      var aliases;
      var comments = "";
      // var links = [];
      var connectedToId;
      var aliasCount = 0;
      var aliasArray = [];
            console.log("\n ", __filename, "line", __line, "; typeof data= ", (typeof jsonFile));
                 console.log("\n ", __filename, "line", __line, ";  data.length = ", (jsonFile.length));
      var conList = JSON.parse(jsonFile).CONSOLIDATED_LIST;
      var dateGenerated = JSON.parse(jsonFile).CONSOLIDATED_LIST.$.dateGenerated;

      console.log("\n ", __filename, "line", __line, "; typeof conList = ", (typeof conList));
            console.log("\n ", __filename, "line", __line, "; typeof conList = ", (typeof conList),"; dateGenerated = ", dateGenerated);
      // PROCESS ENTITIES
      // put entities in data.ents array
      counter = 0;
      console.log("\n ", __filename, "line", __line, "; conList.ENTITIES.ENTITY.length = ", conList.ENTITIES.ENTITY.length);
      console.log("\n ", __filename, "line", __line, "; conList.INDIVIDUALS.INDIVIDUAL.length = ", conList.INDIVIDUALS.INDIVIDUAL.length);

      missing_ents.forEach(function(ent) {
        console.log("\n ", __filename, "line", __line, "; missing_ents ent = ", ent);
        console.log("\n ", __filename, "line", __line, "; missing_ents ent = ", ent);
        conList.ENTITIES.ENTITY.push(ent);
      });
      conList.ENTITIES.ENTITY.forEach(function(ent) {
        counter++;
        if(counter <= numObjectsToShow) {
          console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; util.inspect(ent, false, null) = ", util.inspect(ent, false, null));
        }
        ents.push(ent);
      });
      console.log("\n ", __filename, "line", __line, "; typeof ents = ", typeof ents);
      console.log("\n ", __filename, "line", __line, "; ents.length = ", ents.length);
      // put indivs in data.indivs array
      missing_indivs.forEach(function(indiv) {
        console.log("\n ", __filename, "line", __line, "; missing_indiv indiv = ", indiv);

        conList.INDIVIDUALS.INDIVIDUAL.push(indiv);
      });
      counter = 0;
      conList.INDIVIDUALS.INDIVIDUAL.forEach(function(indiv) {
        counter++;
        if(counter <= numObjectsToShow) {
          console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; util.inspect(indiv, false, null) = ", util.inspect(indiv, false, null));
        }
        indivs.push(indiv);
      });
      console.log("\n ", __filename, "line", __line, "; indivs.length = ", indivs.length);
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
      console.log("\n ", __filename, "line", __line, "; ents.length = ", ents.length);
      console.log("\n ", __filename, "line", __line, "; indivs.length = ", indivs.length);
data = conList;
console.log("\n ", __filename, "line", __line, "; typeof data = ", typeof data);
      
      
      
      callback();
    },
    function(callback) {
      // entities and indivs were in separate arrays; the two arrays are merged into a single array of 'nodes'
      (function() {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; put ents and indivs into nodes array");
         console.log("\n ", __filename, "line", __line, "; typeof data = ", typeof data);
        
        data.nodes = ents.concat(indivs);
        data.nodes = data.nodes.concat(missing_nodes);

        concatNames(data.nodes);

        data.dateGenerated = dateGenerated; // data.CONSOLIDATED_LIST.$.dateGenerated;

        counter = 0;
        data.nodes.forEach(function(node) {
          counter++;
          if(counter <= numObjectsToShow) {
            console.log("\n ", __filename, "line", __line, "; counter = ", counter, "; node = ", node);
          }
        });
        ents = null;
        indivs = null;
        //data.CONSOLIDATED_LIST.INDIVIDUALS = null;
        //data.CONSOLIDATED_LIST.ENTITIES = null;
        // data.CONSOLIDATED_LIST = null;
        // Remove property, result: {}
      /*
        jsonpatch.apply(data, [{
          op: 'remove',
          path: '/CONSOLIDATED_LIST'
        }]);
*/

        callback();
      })();

    },
    function(callback) {
      (function() {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; clean up Ids");
        cleanUpIds(data.nodes);
        callback();
      })();
    },
    function(callback) {
      (function() {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; addLinksArray(data.nodes)");
        addLinksArray(data.nodes);

        countSourceTarget(data.nodes, data.links);
        console.log(data.nodes[1]);
        callback();
      })();
    },
    function(callback) {
      (function() {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; addConnectionIdsArray(data.nodes)");

        addConnectionIdsArray(data.nodes);
        console.log(data.nodes[1]);
        callback();
      })();
    },
    function(callback) {
      (function() {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; addConnectionObjectsArray");
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
        console.log("\n ", __filename, "line", __line, "; data.links.length = ", data.links.length);
        callback();
      })();
    },
    function(callback) {
      (function() {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
        countLinks(data.nodes);
        console.log(data.nodes[1]);
        counter = 0;
        data.links.forEach(function(link) {
          counter++;
          if(counter <= numObjectsToShow) {
            console.log("\n ", __filename, "line", __line, "; 296 counter = ", counter, "; link = ", link);
          }
        });
        callback();
      })();
    },
    function(callback) {
      console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; save clean json file");
      (function() {
        // var saveJson = function () {
        try {
          var myFile = __dirname + "/../data/output/AQList-clean.json";
          var myJsonData = JSON.stringify(data, null, " ");
          // console.log("myJsonData =", myJsonData);
          fse.writeFileSync(myFile, myJsonData, fsOptions);
          console.log("\n ", __filename, "line", __line, ";  file written to: ", myFile);
          console.log("\n ", __filename, "line", __line, ";  file contained: ", trunc.n400(util.inspect(myJsonData, false, null)));

        } catch(e) {
          console.log("\n ", __filename, "line", __line, ";  Error: ", e);
          callback();
        }
        callback();
      })();
    },

    function(callback) {
      var dummy = function() {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
        console.log("\n ", __filename, "line", __line, "; last function");
        callback();
      }();
    }
  ]);
};

var cleanUpIds = function(nodes) {
  counter = 0;
  nodes.forEach(function(node) {
    counter++;
    var rawRefNum = node.REFERENCE_NUMBER;
    // remove period from end of all reference numbers that have them; not all do.
    try {
      refNumRegexMatch = (node.REFERENCE_NUMBER)
        .match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
    } catch(error) {
      console.log("\n ", __filename, "line", __line, "; Error: ", error, "; node =", node, "; counter = ", counter);

    }

    var id = refNumRegexMatch[0];
    //  clean up indiv id for consistency;  none should have trailing period.
    node.id = id;
    if(counter <= numObjectsToShow) {
      console.log("\n ", __filename, "line", __line, "; node with ids", node);
    }
  });
};

var concatNames = function(nodes) {
  counter = 0;
  nodes.forEach(function(node) {
    counter++;
    var name = "";
    var firstName = node.FIRST_NAME;
    var secondName = node.SECOND_NAME;
    var thirdName = node.THIRD_NAME;
    var fourthName = node.FOURTH_NAME;

    if(firstName) {
      name = name.concat(firstName);
    }
    if(secondName) {
      name = name.concat(" ", secondName);
    }
    if(thirdName) {
      name = name.concat(" ", thirdName);
    }
    if(fourthName) {
      name = name.concat(" ", fourthName);
    }

    node.name = name.trim();
    if(counter <= 10) {
      console.log("\n ", __filename, "line", __line, "; node with name", node);
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

// consolidate links; remove duplicates, BUT DOES IT REALLY?
// create array of connection objects with source and target
var consolidateLinks = function(data) {
  // console.log("\n ", __filename, "line",__line, "; data = ", data);
   console.log("\n ", __filename, "line",__line, "; data.nodes[0] = ", data.nodes[0]);
     console.log("\n ", __filename, "line","line", "line", __line, "; data.nodes[1] = ", data.nodes[1]);
 
  data.links = [];
  (data.nodes)
    .forEach(function(node) {
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

var countSourceTarget = function(nodes, links) {

  var tarCount = 0;
  var souCount = 0;
  for(var n in nodes) {
    console.log("\n ", __filename, "line", __line, ";  nodes[", n, "] = ", data.nodes[n]);
    console.log("\n ", __filename, "line", __line, ";  nodes[", n, "].id = ", nodes[n].id);
    nodes[n]['sourceCount'] = 0;
    nodes[n]['targetCount'] = 0;
    for(var l in links) {
      // console.log("links[", n, "] = ", links[n]); 

      if(links[l].source == nodes[n].id) {
        console.log("\n ", __filename, "line", __line, "; ", links[l].source, " == ", nodes[n].id, " TRUE");
        nodes[n].sourceCount = nodes[n].sourceCount + 1;
        souCount++;
      }
      if(links[l].target == nodes[n].id) {
        console.log("\n ", __filename, "line", __line, "; ", links[l].target, " == ", nodes[n].id, " TRUE");
        nodes[n].targetCount = nodes[n].targetCount + 1;
        tarCount++;
      }

    }
    console.log("\n ", __filename, "line", __line, "; nodes[", n, "].sourceCount = ", nodes[n].sourceCount);
    console.log("\n ", __filename, "line", __line, "; nodes[", n, "].targetCount = ", nodes[n].targetCount);
    console.log("\n ", __filename, "line", __line, "; tarCount = ", tarCount);
    console.log("\n ", __filename, "line", __line, "; souCount = ", souCount);

  }

}

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

var missing_indivs0 = [{
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
  "name": "Wa&apos;el Hamza Abd al-Fatah Julaidan (no longer listed)",
  "id": "QI.J.79.02",
  "REFERENCE_NUMBER": "QI.J.79.02",
  "COMMENTS1": "",
  "indiv0OrEnt1": 0
}];

var missing_ents = [{
  "name": "International Islamic Relief Organization, Philippines, branch offices (no longer listed)",
  "id": "QE.I.126.06",
  "REFERENCE_NUMBER": "QE.I.126.06",
  "COMMENTS1": "",
  "indiv0OrEnt1": 1
}, {
  "name": "Benevolence International Fund  (no longer listed)",
  "id": "QE.B.94.02",
  "REFERENCE_NUMBER": "QE.B.94.02",
  "COMMENTS1": "",
  "indiv0OrEnt1": 1
}];

var missing_indivs = [{
  "name": "Fahd Mohammed Ahmed al-Quso (no longer listed)",
  "id": "QI.A.288.10",
  "REFERENCE_NUMBER": "QI.A.288.10",
  "indiv0OrEnt1": 0,
  "DATAID": "empty",
  "VERSIONNUM": "10",
  "FIRST_NAME": "Fahd Mohammed Ahmed al-Quso (no longer listed)",
  "SECOND_NAME": "second name",
  "THIRD_NAME": "(no longer listed)",
  "UN_LIST_TYPE": "Al-Qaida",
  "LISTED_ON": "2016-10-06T00:00:00",
  "NAME_ORIGINAL_SCRIPT": "نشوان عبد الرزاق عبد الباقي",
  "COMMENTS1": "comments",
  "NATIONALITY": {
    "VALUE": "nationality value"
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
  "name": "Usama Bin Laden (no longer listed)",
  "id": "QI.B.8.01",
  "REFERENCE_NUMBER": "QI.B.8.01",
  "indiv0OrEnt1": 0,
  "DATAID": "empty",
  "VERSIONNUM": "10",
  "FIRST_NAME": "Usama Bin Laden (no longer listed)",
  "SECOND_NAME": "second name",
  "THIRD_NAME": "(no longer listed)",
  "UN_LIST_TYPE": "Al-Qaida",
  "LISTED_ON": "2016-10-06T00:00:00",
  "NAME_ORIGINAL_SCRIPT": "نشوان عبد الرزاق عبد الباقي",
  "COMMENTS1": "comments",
  "NATIONALITY": {
    "VALUE": "nationality value"
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
  "name": "Wa&apos;el Hamza Abd al-Fatah Julaidan (no longer listed)",
  "id": "QI.J.79.02",
  "REFERENCE_NUMBER": "QI.J.79.02",
  "indiv0OrEnt1": 0,
  "DATAID": "empty",
  "VERSIONNUM": "10",
  "FIRST_NAME": "Wa&apos;el Hamza Abd al-Fatah Julaidan (no longer listed)",
  "SECOND_NAME": "second name",
  "THIRD_NAME": "(no longer listed)",
  "UN_LIST_TYPE": "Al-Qaida",
  "LISTED_ON": "2016-10-06T00:00:00",
  "NAME_ORIGINAL_SCRIPT": "نشوان عبد الرزاق عبد الباقي",
  "COMMENTS1": "comments",
  "NATIONALITY": {
    "VALUE": "nationality value"
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
  "DATAID": "empty",
  "VERSIONNUM": "10",
  "FIRST_NAME": "Wali Ur Rehman",
  "SECOND_NAME": "second name",
  "THIRD_NAME": "(no longer listed)",
  "UN_LIST_TYPE": "Al-Qaida",
  "REFERENCE_NUMBER": "QI.U.287.10",
  "LISTED_ON": "2016-10-06T00:00:00",
  "NAME_ORIGINAL_SCRIPT": "نشوان عبد الرزاق عبد الباقي",
  "COMMENTS1": "Wali Ur Rehman is the Emir of Tehrik-e Taliban (TTP) (QE.T.132.11) for South Waziristan",
  "NATIONALITY": {
    "VALUE": "nationality value"
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
  "DATAID": "empty",
  "VERSIONNUM": "10",
  "FIRST_NAME": "Wali Ur Rehman",
  "SECOND_NAME": "second name",
  "THIRD_NAME": "(no longer listed)",
  "UN_LIST_TYPE": "Al-Qaida",
  "REFERENCE_NUMBER": "QI.M.286.10",
  "LISTED_ON": "2016-10-06T00:00:00",
  "NAME_ORIGINAL_SCRIPT": "نشوان عبد الرزاق عبد الباقي",
  "COMMENTS1": "Tehrik-e Taliban (TTP) (QE.T.132.11) is based in the tribal areas along the Afghanistan/Pakistan border. Formed in 2007, its leader is Hakimullah Mehsud.",
  "NATIONALITY": {
    "VALUE": "nationality value"
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
}];

var empty_indiv = [{
  "DATAID": "empty",
  "VERSIONNUM": "10",
  "FIRST_NAME": "first name",
  "SECOND_NAME": "second name",
  "THIRD_NAME": "(no longer listed)",
  "UN_LIST_TYPE": "Al-Qaida",
  "REFERENCE_NUMBER": "QI.TBD",
  "LISTED_ON": "2016-10-06T00:00:00",
  "NAME_ORIGINAL_SCRIPT": "نشوان عبد الرزاق عبد الباقي",
  "COMMENTS1": "comments",
  "NATIONALITY": {
    "VALUE": "nationality value"
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
  "DATAID": "empty",
  "VERSIONNUM": "10",
  "FIRST_NAME": "first name",
  "SECOND_NAME": "second name",
  "THIRD_NAME": "(no longer listed)",
  "UN_LIST_TYPE": "Al-Qaida",
  "REFERENCE_NUMBER": "QI.TBD",
  "LISTED_ON": "2016-10-06T00:00:00",
  "NAME_ORIGINAL_SCRIPT": "نشوان عبد الرزاق عبد الباقي",
  "COMMENTS1": "comments",
  "NATIONALITY": {
    "VALUE": "nationality value"
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
}];

module.exports = {
  fixData: fixData
};

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