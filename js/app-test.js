// app-test.js
//=============
var consoleLog = false;
if (typeof define !== 'function') {
  var define = require('amdefine');
}
var async = require('async'),
  re = require('request-enhanced'),
  request = require('request'),
  fs = require('fs'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect'),
  parseString = require('xml2js')
    .parseString;
var utilities_aq_viz = require('./utilities_aq_viz');
var collect = require('./collect.js');
// var parseDoc = require('./parseDoc.js');
var setupData1 = require('./setupData1.js');
var setupData2 = require('./setupData2.js');
var collectNarratives = require('./collectNarratives.js');
var getNarrativeList = require('./getNarrativeList.js');
// var makeDocs = require('./makeDocs.js');
var filewalker = require('./filewalker.js');
var logger = require('./libs/logger.js');
var linenums = require('./linenums.js');
var functionCount = 0;
var __filename = __filename || {};
var __line = __line || {};

var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};


var log = require('custom-logger').config({ level: 0 });
log.debug( 'hello?' );
log.info( 'hello world!' );
log.warn( 'carefule there, world!' );
log.error( 'WHOA WHOA WHOA world?!' );


var runAppTest = function () {
//  if (consoleLog) { console.log('\n ', __filename, __line, ', runApp\n');
  if (consoleLog) {
    console.log('\n ', __filename, 'line', __line, '; running ', __filename, '; ', new Date());
  }

  async.series([
      // collect raw data (xml file) from the Internet
      function (callback) {
        if (consoleLog) {
          console.log('\n ', __filename, __line, '; Phase 1#:', ++functionCount, '; collect.convertXMLToJson)_');
        }
        collect.collect();
        callback();
      },
      /*
       function (callback) {
       // collect raw data from the Internet
       if (consoleLog) {
       console.log('\n ', __filename, __line, '; Phase 2#:', ++functionCount, '; setupData1.fixData()');
       }
       setupData1.fixData();
       callback();
       },

       function (callback) {
       if (consoleLog) {
       console.log('\n ', __filename, __line, '; Phase 3#:', ++functionCount, '; getNarrativeList.getListOfNarratives()');
       }
       getNarrativeList.getListOfNarratives();
       callback();
       },
       /*
       function (callback) {
       // collect raw data from the Internet
       if (consoleLog) {
       console.log('\n ', __filename, __line, '; Phase 4#:', ++functionCount, '; collectNarratives.getTheNarratives()');
       }
       collectNarratives.getTheNarratives();
       callback();
       },
       /*
       function (callback) {
       // collect raw data from the Internet
       if (consoleLog) {
       console.log('\n ', __filename, __line, '; Phase 2#:', ++functionCount, '; setupData2.fixLinks()');
       }
       setupData2.fixLinks();
       callback();
       },


       /*
       function (callback) {
       // get the lists of narratives, consolidate in one json file
       if (consoleLog) {
       console.log('\n ', __filename, __line, '; Phase 3#:', ++functionCount, '; getNarrativeList.getListOfNarratives()');
       }
       // collect individuals list of links to narratives - raw data; save json file
       // collect entities list of links to narratives - raw data; save json file
       // raw data collected synchronously
       // as /data/narrative_lists/narrative_links.json
       getNarrativeList.getListOfNarratives();
       callback();
       },
       */
      /*
       // read the narrative links from file: /data/narrative_lists/narrative_links.json
       // loop through the list of ids and filenames/links and get the narrative files from the Internet and save each to a local file
       // using links from narrative_links.json, collect and save the narratives
       // as /data/narrative_summaries/ + link_data_array_item.narrativeFileName
       // using file names/links from /data/narrative_lists/narrative_links.json, collect and save the narratives
       function (callback) {
       // collect the narrative files from the Internet
       if (consoleLog) {
       console.log('\n ', __filename, __line, '; function 4#:', ++functionCount, '; collectNarratives.getTheNarratives();');
       }
       collectNarratives.getTheNarratives();
       callback();
       },
       */

      /*
       function (callback) {
       // collect raw data from the Internet
       if (consoleLog) {
       console.log('\n ', __filename, __line, '; function 2#:', ++functionCount);
       }
       setupData.fixData();
       callback();
       },

       // get the two html files containing narrative names and file names/links
       // getData() saves narrative links (a json array) to narrativeLinksLocalFileNameAndPath
       // collect raw html page listing individuals' file names/links to narratives from www.un.org/sc/committees/1267/individuals_associated_with_Al-Qaida.shtml
       // parse the html file, extract ids, file names etc. and put into narrativeLinks json array

       // collect entities list of links to narratives - raw data, from www.un.org/sc/committees/1267/entities_associated_with_Al-Qaida.shtml;
       // save as local file data/narrative_lists/entities_associated_with_Al-Qaida.json

       /*
       function (callback) {
       // put data in arrays for d3
       if (consoleLog) {
       console.log('\n ', __filename, __line, '; function 5#:', ++functionCount);
       }
       setupData.fixData();
       callback();
       },
       */
      function (callback) {
        // list files in /data/output
        if (consoleLog) {
          console.log('\n ', __filename, __line, '; Phase 6#:', ++functionCount, '; filewalker.filewalker()');
        }
        // console.log('\n ', __filename, 'line', __line, '; running filewalker.filewalker()');
        var fwPath = './data/output';
        filewalker.filewalker(fwPath);

        callback();
      }
    ],
    function (err) { //This function gets called after the two tasks have called their 'task callbacks'
      if (err) console.log('\n app.js 32 Err: ', err);
    }
  );
};
runAppTest();