// window.globaldata = globaldata || {};

var Process;

Process = function() {
  d3.json("data/AQList-2014-11-18.json", function(error, data) {
    console.log("229 aqlist-json.js running script");
    var aliases;
    var comments = "";
    var links = "";
    var connectedToId;
    var aliasCount = 0;
    var aliasArray = [];
    var linkRegexMatch;
    var connection;
    var source;
    var target;
    var conList = data.CONSOLIDATED_LIST;
    var individuals = data.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL;
    var entities = data.CONSOLIDATED_LIST.ENTITIES.ENTITY;
    var indivs = conList.INDIVIDUALS.INDIVIDUAL;
    var ents = conList.ENTITIES.ENTITY;
    // console.log("entities", entities);
    // for consistency, indivs will be identified by ids derived by removing any trailing period from REFERENCE_NUMBER
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
    cleanUpIds(individuals);
    cleanUpIds(entities);

    // create a free-standing array containing alias counts 
    individuals.forEach(function(indiv) {
      // console.log("indiv = ", indiv);
      aliases = indiv.INDIVIDUAL_ALIAS;
      indiv.numAliases = aliases.length;
      if(indiv.numAliases) {
        aliasArray.push(indiv.numAliases);
      } else {
        aliasArray.push(0);
      }
    });
    // create a links array containing ids of related parties
    var addLinksArray = function(indivsOrEntities) {

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
    addLinksArray(individuals);
    addLinksArray(entities);

    // create an array of connection ids  
    var addConnectionIdsArray = function(indivsOrEntities) {
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
    addConnectionIdsArray(individuals);
    addConnectionIdsArray(entities);

    // create array of connection objects with source and target
    var addConnectionObjectsArray = function(indivsOrEntities) {
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
    addConnectionObjectsArray(individuals);
    addConnectionObjectsArray(entities);

    // consolidate links; remove duplicates
    // create array of connection objects with source and target
    var consolidateLinks = function(conList) {
      conList.links = [];
      var indivs = conList.INDIVIDUALS.INDIVIDUAL;
      var ents = conList.ENTITIES.ENTITY;

      indivs.forEach(function(indiv) {
        if((typeof indiv.connections != 'undefined') && (typeof indiv.connections.length != 'undefined') && (indiv.connections.length > 0)) {
          indiv.connections.forEach(function(conn) {
            conList.links.push(conn);
          });
        }
      });
      ents.forEach(function(ent) {
        if((typeof ent.connections != 'undefined') && (typeof ent.connections.length != 'undefined') && (ent.connections.length > 0)) {
          ent.connections.forEach(function(conn) {
            conList.links.push(conn);
          });
        }
      });
      // console.log("160 conList modified", conList);
    };

    // count the links      
    var countLinks = function(conList) {
      // conList.links = [];
      var indivs = conList.INDIVIDUALS.INDIVIDUAL;
      var ents = conList.ENTITIES.ENTITY;

      indivs.forEach(function(indiv) {
        if((typeof indiv.connections != 'undefined') && (typeof indiv.connections.length != 'undefined')) {
          indiv.linkCount = indiv.connections.length;
        }
      });
      ents.forEach(function(ent) {
        if((typeof ent.connections != 'undefined') && (typeof ent.connections.length != 'undefined')) {
          ent.linkCount = ent.connections.length;
        }
      });
      console.log("aqlist-json.js 160 conList modified", conList);
    };
    countLinks(conList);

    //globaldata = data;

    var networkVis = function() {
      var x = d3.scale.linear()
        .domain([0, d3.max(aliasArray)])
        .range([0, 420]);
    };

    var barChart = function() {
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
    return this.data;

  });
};