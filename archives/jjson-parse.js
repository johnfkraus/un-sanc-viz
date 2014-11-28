var fs = require('fs');
// var $ = require('jquery');

var request = require('request');
request('http://www.google.com', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body); // Print the google web page.
  }
});


//add timestamps in front of log messages
require('console-stamp')(console, '[HH:MM:ss.l]');
var dateFormat = require('dateformat');
var now = new Date();
// Basic usage
//    dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
// Saturday, June 9th, 2007, 5:46:21 PM
// You can use one of several named masks
//    dateFormat(now, "isoDateTime");
// 2007-06-09T17:46:21

String.prototype.trunc = String.prototype.trunc ||
  function(n) {
    return this.length > n ? this.substr(0, n - 1) + '&hellip;' : this;
};

var s = 'not very long';
s.trunc(25); //=> not very long
s.trunc(5); //=> not ...

dateFormat.masks.hammerTime = 'yyyy-mm-dd-HHMMss';
var fileDateString = dateFormat(now, "hammerTime");
// var file = __dirname + '/../data/test/aqtest.json';
console.log("__dirname = ", __dirname);
var file = __dirname + '/../data/test/AQList-2014-11-18.json';
var outputFileName = '../data/test/al-qaida-parsed-' + fileDateString + '.json';

request(file, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log("body = ", body); // Print the google web page.
  }
});

fs.readFile(file, 'utf8', function(err, data) {
  if(err) {
    console.log('Error: ' + err);
    return;
  }

  jkWriteFile(__dirname + "/../data/test/plaindata.json", data);

  // var rawData = JSON.parse(data);
  data = setupData(data);

  var tarCount = 0;
  var souCount = 0;
//   console.log("data.nodes = ", data.nodes);

  for(var n in data.nodes) {
    console.log("14 data.nodes[", n, "] = ", data.nodes[n]);
    console.log("15 data.nodes[", n, "].id = ", data.nodes[n].id);
    data.nodes[n]['sourceCount'] = 0;
    data.nodes[n]['targetCount'] = 0;
    for(var l in data.links) {
      // console.log("data.links[", n, "] = ", data.links[n]); 

      if(data.links[l].source == data.nodes[n].id) {
        console.log('22  ', data.links[l].source, ' == ', data.nodes[n].id, ' TRUE');
        data.nodes[n].sourceCount = data.nodes[n].sourceCount + 1;

        souCount++;
      }
      if(data.links[l].target == data.nodes[n].id) {
        console.log('26  ', data.links[l].target, ' == ', data.nodes[n].id, ' TRUE');
        data.nodes[n].targetCount = data.nodes[n].targetCount + 1;
        tarCount++;
      }

    }
    console.log('32  ', "data.nodes[", n, "].sourceCount = ", data.nodes[n].sourceCount);
    console.log('33  ', "data.nodes[", n, "].targetCount = ", data.nodes[n].targetCount);

    console.log("tarCount = ", tarCount);
    console.log("souCount = ", souCount);

  }

  // console.log("data = ", data);
  // alert("pause");
  //console.log("writefile ...");
  // fs.writeFile('aq-qaida2.json', data, null, err);

  jkWriteFile(outputFileName, data);

});

var jkWriteFile = function(outputFileName, data) {
  fs.writeFile(outputFileName, data, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + outputFileName);
    }
  });
};

var jkWriteFileJSONStringify = function(outputFileName, data) {
  fs.writeFile(outputFileName, JSON.stringify(data, null, 4), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + outputFileName);
    }
  });
};

var fsWriteFile = function(file, obj, options, callback) {
  if(callback === undefined) {
    callback = options;
    options = null;
  }

  var str = '';
  try {
    str = JSON.stringify(obj, null, me.spaces) + '\n';
    alert(str);
  } catch(err) {
    if(callback) return callback(err, null);
  }

  fs.writeFile(file, str, options, callback);
};

function alert(x) {
  if(x === 'undefined') {
    console.log('undefined');
  } else {
    console.log(x);
  }
  return;
}

//  called once to clean up raw data and switch links to
//  point to node instances
//  Returns data modified for d3
var setupData = function(data) {
  // console.log("129 data = ", data.toString().trunc(855));
  data = JSON.parse(data);
  var tempData = {};
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
  //var indivs = [];
  //var ents = [];

  // console.log("ents.toString().trunc(999)", ents.toString().trunc(999));
  //var individuals = data.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL;
  // var entities = data.CONSOLIDATED_LIST.ENTITIES.ENTITY;
  var indivs = conList.INDIVIDUALS.INDIVIDUAL;
  var ents = conList.ENTITIES.ENTITY;

  tempData.indivs = indivs;
  tempData.ents = ents;
  tempData.links = [];

  console.log("indivs", indivs);

  // for consistency, indivs will be identified by ids derived by removing any trailing period from REFERENCE_NUMBER  
  cleanUpIds(indivs);
  cleanUpIds(ents);
  addAliasCount(indivs);
  addLinksArray(indivs);
  addLinksArray(ents);
  addConnectionIdsArray(indivs);
  addConnectionIdsArray(ents);
  addConnectionObjectsArray(indivs);
  addConnectionObjectsArray(ents);

  // entities and indivs each go into an array of 'nodes'  
  ents.forEach(function(ent) {
    // 1 = entity; 0 = individual
    ent.indivOrEnt = 1;
  });
  indivs.forEach(function(indiv) {
    // 1 = entity; 0 = individual
    indiv.indivOrEnt = 1;
  });
  newData.nodes = [];
  newData.nodes.push(indivs);
  newData.nodes.push(ents);

  newData.links = links;

  //};

  //cleanUp();

  var cleanUpIds = function(indivsOrEntities) {
    indivsOrEntities.forEach(function(indivOrEntity) {
      var rawRefNum = indivOrEntity.REFERENCE_NUMBER;
      // remove period from end of all reference numbers that have them; not all do.
      refNumRegexMatch = (indivOrEntity.REFERENCE_NUMBER)
        .match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
      var id = refNumRegexMatch[0];
      //  clean up indiv id for consistency;  none should have trailing period.
      indivOrEntity.id = id;
      // console.log("64 indivOrEntity with ids", indivOrEntity);
    });
  };
  cleanUpIds(indivs);
  cleanUpIds(ents);

  // create a free-standing array containing alias counts 

  addAliasCount = function(indivs) {

    indivs.forEach(function(indiv) {
      // console.log("indiv = ", indiv);
      aliases = indiv.INDIVIDUAL_ALIAS;
      indiv.numAliases = aliases.length;
      if(indiv.numAliases) {
        aliasArray.push(indiv.numAliases);
      } else {
        aliasArray.push(0);
      }
    });
  };
  // create a links array in each entity/indiv containing ids of related parties
  addLinksArray = function(indivsOrEntities) {
    indivsOrEntities.forEach(function(indivOrEntity) {
      indivOrEntity.links = [];
      comments = indivOrEntity.COMMENTS1;
      if((typeof comments != 'undefined') && (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) != 'undefined')) {
        linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
        // console.log("91 linkRegexMatch = ", linkRegexMatch);
        if((typeof(linkRegexMatch) !== 'undefined') && (linkRegexMatch !== null)) {
          for(var l = 0; l < linkRegexMatch.length; l++) {
            indivOrEntity.links.push(linkRegexMatch[l]);
          }
        }
        // console.log("indivOrEntity with links", indivOrEntity);
      }
    });
  };

  // create an array of connection ids in each indiv/entity  
  addConnectionIdsArray = function(indivsOrEntities) {
    indivsOrEntities.forEach(function(indivOrEntity) {
      indivOrEntity.connectedToId = [];
      comments = indivOrEntity.COMMENTS1;
      if((typeof comments != 'undefined') && (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) != 'undefined')) {
        linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
        // console.log("133 linkRegexMatch = ", linkRegexMatch);
        if((typeof(linkRegexMatch) !== 'undefined') && (linkRegexMatch !== null)) {
          for(var l = 0; l < linkRegexMatch.length; l++) {
            indivOrEntity.connectedToId.push(linkRegexMatch[l]);
          }
        }
        // console.log("136 indivorEntity with array of links", indivOrEntity);
      }
    });
  };

  // create array of connection objects with source and target
  addConnectionObjectsArray = function(indivsOrEntities) {
    indivsOrEntities.forEach(function(indivOrEntity) {
      indivOrEntity.connections = [];
      var connection = {};
      if((typeof indivOrEntity.connectedToId != 'undefined') && (typeof indivOrEntity.connectedToId.length != 'undefined') && (indivOrEntity.connectedToId.length > 0)) {
        var id = indivOrEntity.id;
        for(var l = 0; l < indivOrEntity.connectedToId.length; l++) {
          if(id !== indivOrEntity.connectedToId) {
            connection.source = id;
            connection.target = indivOrEntity.connectedToId[l];
            indivOrEntity.connections.push(connection);
          }
        }
      }
      //      console.log("178 indivOrEntity with connection objects array", indivOrEntity);
    });
  };

  // consolidate links; remove duplicates
  // create array of connection objects with source and target
  consolidateLinks = function(data) {
    // data = newData;
    data.links = [];
    //var indivs = conList.INDIVIDUALS.INDIVIDUAL;
    // var ents = conList.ENTITIES.ENTITY;

    indivs.forEach(function(indiv) {
      if((typeof indiv.connections != 'undefined') && (typeof indiv.connections.length != 'undefined') && (indiv.connections.length > 0)) {
        indiv.connections.forEach(function(conn) {
          data.links.push(conn);
        });
      }
    });
    ents.forEach(function(ent) {
      if((typeof ent.connections != 'undefined') && (typeof ent.connections.length != 'undefined') && (ent.connections.length > 0)) {
        ent.connections.forEach(function(conn) {
          data.links.push(conn);
        });
      }
    });
    // console.log("160 conList modified", conList);
  };
  // consolidateLinks(data);
  // count the links      
  countLinks = function(data) {
    // conList.links = [];
    //var indivs = conList.INDIVIDUALS.INDIVIDUAL;
    //var ents = conList.ENTITIES.ENTITY;

    data.indivs.forEach(function(indiv) {
      if((typeof indiv.connections != 'undefined') && (typeof indiv.connections.length != 'undefined')) {
        indiv.linkCount = indiv.connections.length;
      }
    });
    data.ents.forEach(function(ent) {
      if((typeof ent.connections != 'undefined') && (typeof ent.connections.length != 'undefined')) {
        ent.linkCount = ent.connections.length;
      }
    });
    console.log("aqlist-json.js 160 data modified", data);
  };
  // countLinks(data);

  networkVis = function() {
    var x = d3.scale.linear()
      .domain([0, d3.max(aliasArray)])
      .range([0, 420]);
  };

  barChart = function() {
    var x = d3.scale.linear()
      .domain([0, d3.max(aliasArray)])
      .range([0, 420]);

    d3.select(".chart")
      .selectAll("div")
      .data(aliasArray)
      .enter()
      .append("div")
      .style("width", function(d) {
        return x(d) + "px";
      })
      .text(function(d) {
        return d;
      });
  };

  console.log("814 data = ", data);

  return data;
};