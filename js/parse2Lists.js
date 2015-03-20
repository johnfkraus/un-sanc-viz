// parse2lists.js
// collect consolidated sanctions list file from 'http://www.un.org/sc/committees/consolidated.xml', convert to json
// get the two html files containing narrative names and file names/urls
// write narrative urls array file (a json array) to /data/narrative_lists/narrativeUrlsArray.json
// normalize the data and put it into arrays for d3
// each element in the node array in the main json data file (represented by the 'data' variable and stored in /data/output/data_committee.json) contains data on a single individual or
// entity listed in the consolidated.xml sanctions data file collected from the U.N. site located at http://www.un.org/sc/committees/1267/.
//==========================


//var app = require('./app.js');
var appConfig = require('./appConfig.js');
var utilities_aq_viz = require('./utilities_aq_viz');



var init = require('./committees.js').init;
// RUN CONFIGURATION
// skip downloading 300+ narrative files and use locally stored files instead; for debugging
var useLocalListFiles = appConfig.useLocalListFiles;
var useLocalNarrativeFiles = appConfig.useLocalNarrativeFiles;
// do we want lots of console.log messages for debugging (if so, set consoleLog = true)
var consoleLog = appConfig.consoleLog;

// var consoleLog = false;
// skip downloading 300+ narrative files and use locally stored files instead; for debugging
// var useLocalListFiles = true;
// var useLocalNarrativeFiles = true;
// var logger = utilities_aq_viz.logger;
var logger = require('./tracer-logger-config.js').logger;
// var logger = require('./tracer-logger-config.js').logger;
var logModulus = utilities_aq_viz.logModulus;
var substringChars = utilities_aq_viz.truncateToNumChars;
var linenums = require('./linenums.js');
var responseBody;
var individualsHtmlUnicodeString;
var entitiesHtmlUnicodeString;
var iterators = require('async-iterators');
var missingNodes = require('./missing_nodes.js'),
  async = require('async'),
  re = require('request-enhanced'),
  request = require('request'),
  fse = require('fs-extra'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect');
// var narrativeUrlsArray = narrativeUrlsArray || [];

var counter = 0;
var numObjectsToShow = 3;
var generatedFileDateString;
var Set = require('backpack-node').collections.Set;
// StrSet class has exactly the same interface like the Set, but values have to be strings only.
var StrSet = require('backpack-node').collections.StrSet;
// var Bag = require('backpack-node').collections.Bag;
var Map = require('backpack-node').collections.Map;

var fsOptions = {
  flags: 'r+', encoding: 'utf-8', autoClose: true
};
// var dateGenerated;
if (typeof define !== 'function') {
  var define = require('amdefine');
}
var requestSync = require('sync-request'),
  list_xml,
  parseString = require('xml2js')
    .parseString;
require('console-stamp')(console, '[HH:MM:ss.l]');
var now = new Date();

var select = require('soupselect').select,
  htmlparser = require('htmlparser'),
  http = require('http'),
  sys = require('sys'),
  MongoClient = require('mongodb').MongoClient,
  assert = require('assert');
var targetName = '';
var anchor,
  data = {},
  nodes,
  node,
  narrativeFileName,
  paragraph,
  rows,
  row,
  td,
  tds,
  underscore,
  url;

// var functionCount = 0;
// var indivLinks = [];
// var entLinks = [];
// var dataPath = __dirname + '/../data/output/data_committee.json';
var writeJsonOutputDebuggingDirectory;
// var listUrl = 'http://www.un.org/sc/committees/consolidated.xml';
var individualsHtmlLocalOutputFileNameAndPath;
var entitiesHtmlLocalOutputFileNameAndPath;
// var narrativeUrlsArrayLocalFileNameAndPath;
var narrativeFilesUrlPath;
var dataJsonLocalOutputFileNameAndPath;
// var indivOrEntityString;
var individualsListUrl;
var entitiesListUrl;
var host = 'www.un.org';
// var logMessageStringHead = new String().concat(__filename, 'line', __line);
var config;
var committee;
// var nodes = [];
var logFileNameAndPath;
var readWriteLocalNarrativesFilePath;
var individualsJsonLocalOutputFileNameAndPath;
var entitiesJsonLocalOutputFileNameAndPath;
var dotFileLocalOutputFileNameAndPath;
var getCommitteesJson = require('./committees.js').getCommitteesJson;

var parse2Lists = function () {
  var committeeArray =  ['751', '1267', '1518', '1521', '1533', '1572', '1591', '1718', '1737', '1970', '1988', '2048', '2127'];

//  committeeArray.forEach(function (committee) {
  try {
    parse2ListsCommittee('1267');
  } catch (err) {
    logger.error('\n ', __filename, 'line', __line, '; Error: ', err, utilities_aq_viz.getStackTrace(err));
  }
  // });
};

var parse2ListsCommittee = function (committee) {
  var functionCount = 0;
  if (consoleLog) {
    logger.debug('\n ', __filename, __line, '; running parse2ListsCommittee; committee = ', committee);
  }
  async.series([

      // initialize committee settings; test logging
      function (callback) {
        // committee = '2140';
        if (consoleLog) {
          logger.debug('\n ', __filename, __line, '; function #:', ++functionCount, '; initializing ; committee = ', committee);
        }


        committeesJson = getCommitteesJson();
        // init(committee);
        utilities_aq_viz.testLogging();
        callback();
      },

      // copy previously downloaded or created data files to archive
      function (callback) {
        //   fse.copySync(__dirname + '/../data', __dirname + '/../archives/data/'); // , fsOptions);
        // logger.debug(__filename, 'line', __line, 'Copied ', __dirname, '/../data to ', __dirname, '/../archives');
        callback();
      },

      // delete old data
      function (callback) {








        // fse.removeSync(writeJsonOutputDebuggingDirectory);
        if (!useLocalNarrativeFiles) {
          fse.removeSync(__dirname + '/../data/narrative_summaries/');
          fse.mkdirs(__dirname + '/../data/narrative_summaries/');
        }
        // fse.removeSync(__dirname + '/../data/narrative_lists/');
        // fse.removeSync(dataPath);   // deletes /data/output/data_committee.json
        // re-create deleted directories
         fse.mkdirs(writeJsonOutputDebuggingDirectory);
        // fse.mkdirs(__dirname + '/../data/narrative_lists/');
        callback();
      },

      // download from each U.N. sanctions committee web site the two list files for sanctioned (1) individuals and (2) entities.
      // collect from the Internet (for example, from www.un.org/sc/committees/1267/individuals_associated_with_Al-Qaida.shtml)
      // the raw html page that lists the names of html files containing narratives regarding sanctioned individuals
      // parse the list file, extract ids, file names etc. and put into narrativeUrlsArray json array
      // write as local file: individualsLocalOutputFileNameAndPath = __dirname + '/../data/narrative_lists/individuals_associated_with_Al-Qaida.json';
      function (callback) {
        // consoleLog = false;
        if (consoleLog) {
          logger.debug('\n ', __filename, __line, '; function 1#:', ++functionCount, '; collect the two list files for sanctioned individuals and entities');
        }
        data.nodes = [];
        if (!useLocalListFiles) {
          // 1 of 2: list of individuals
          if (individualsListUrl) {
            individualsHtmlUnicodeString = syncGetHtmlAsUnicodeString(individualsListUrl);
            if (utilities_aq_viz.errorPageReturned(individualsHtmlUnicodeString)) {
              logger.error(__filename, ' line ', __line, 'Error: Server returned: ', utilities_aq_viz.errorPageReturned(individualsHtmlUnicodeString));
            }
            try {
              syncWriteHtmlFile(individualsHtmlUnicodeString, __dirname + '/../data/committees/' + committee + '/individuals.html');
            } catch (err) {
              logger.error('\n ', __filename, 'line', __line, '; Error: ', err);
            }
          }
          // 2 of 2: entities list
          if (entitiesListUrl) {
            entitiesHtmlUnicodeString = syncGetHtmlAsUnicodeString(entitiesListUrl);
            if (utilities_aq_viz.errorPageReturned(entitiesHtmlUnicodeString)) {
              logger.error(__filename, ' line ', __line, 'Error: PageNotFoundError; Server returned ', utilities_aq_viz.errorPageReturned(entitiesHtmlUnicodeString));
            }
            try {
              syncWriteHtmlFile(entitiesHtmlUnicodeString, __dirname + '/../data/committees/' + committee + '/entities.html');
            } catch (err) {
              logger.error('\n ', __filename, 'line', __line, '; Error: ', err);
            }
          }
        } else {
          // open local html files previously downloaded from the UN website to the local file system
          // instead of downloading the list files from the UN web site,
          logger.warn(__filename, 'line', __line, '; useLocalListFiles = ', useLocalListFiles, '; reading stored (previously downloaded) local files: ', '; individualsHtmlLocalOutputFileNameAndPath = ', individualsHtmlLocalOutputFileNameAndPath, '; entitiesHtmlLocalOutputFileNameAndPath= ', entitiesHtmlLocalOutputFileNameAndPath);
          individualsHtmlUnicodeString = fse.readFileSync(individualsHtmlLocalOutputFileNameAndPath, fsOptions);
          entitiesHtmlUnicodeString = fse.readFileSync(entitiesHtmlLocalOutputFileNameAndPath, fsOptions);
        }
        callback();
      },

      // write intermediate data file for debugging
      function
        (callback) {
        if (data) {
          var writeJsonPathAndFileName = writeJsonOutputDebuggingDirectory + 'data-L' + __line + '-collectedLinks.json';
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, writeJsonPathAndFileName);
          // utilities_aq_viz.stringifyAndWriteJsonDataFile(data, dataJsonLocalOutputFileNameAndPath);
        }
        callback();
      },

      // parse the two html list files to obtain narrative web page file names
      // write the data to a single local json file
      function (callback) {
        if (consoleLog) {
          logger.debug('\n ', __filename, __line, '; function 1#:', ++functionCount, '; parse the html list files to obtain narrative file names');
        }

        // individuals
        try {
          syncParseHtmlListPage(individualsHtmlUnicodeString, 'indiv');
        } catch (err) {
          logger.error('\n ', __filename, 'line', __line, '; Error: ', err);
        }
        // entities
        syncParseHtmlListPage(entitiesHtmlUnicodeString, 'entity');
        callback();
      },

      // write intermediate data file for debugging
      function
        (callback) {
        if (data) {
          var writeJsonPathAndFileName = writeJsonOutputDebuggingDirectory + 'data-L' + __line + '-collectedLinks.json';
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, writeJsonPathAndFileName);
          // utilities_aq_viz.stringifyAndWriteJsonDataFile(data, dataJsonLocalOutputFileNameAndPath);
        }
        callback();
      },

      // write intermediate data file for debugging
      function
        (callback) {
        if (data) {
          var writeJsonPathAndFileName = writeJsonOutputDebuggingDirectory + 'data-L' + __line + '-collectedLinks.json';
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, writeJsonPathAndFileName);
          // utilities_aq_viz.stringifyAndWriteJsonDataFile(data, dataJsonLocalOutputFileNameAndPath);
        }
        callback();
      },

      // create nodes
      // using filenames previously extracted from the two list files, download each narrative file from the UN web site and save to local file
      // if a target node id does not exist in the node ids set, create a node.
      // using 'narrativeFileName' from the data file, parse the narratives
      // read each narrative file from local storage using 'narrativeFileName' from the data file
      // parse the narratives
      // narrative file names must have 10 characters, not counting the '.shtml' extension
      // using file names extracted from the two list files and organized in the data2.json file, download each narrative file from the UN web site and save to local file
      // if a target node id does not exist create a node.
      // using 'narrativeFileName' from the data file, parse the narratives
      function (callback) {
        logger.debug(__filename, 'line', __line, '; function #:', ++functionCount, '; useLocalNarrativeFiles = ', useLocalNarrativeFiles);
        // do we want to parse files freshly downloaded from the Internet or use locally stored files?
        // if useLocalNarrativeFiles === true, we will not download all the narrative files; use locally stored copies instead.
        if (!useLocalNarrativeFiles) {
          var narrative, nodeNarrFileName, trimmedNarrative, trimmedLabeledNarrative; //, writeNarrativesFilePath;
          // read the data file; each node has a narrativeFileName property
          data = JSON.parse(fse.readFileSync(dataJsonLocalOutputFileNameAndPath, fsOptions));
          for (var nodeCounter = 0; nodeCounter < data.nodes.length; nodeCounter++) {
            node = data.nodes[nodeCounter];
            nodeNarrFileName = node.narrativeFileName;
            url = 'http://www.un.org/sc/committees/' + committee + '/' + nodeNarrFileName;
            try {
              narrative = syncGetHtmlAsUnicodeString(url);
            } catch (err) {
              logger.error('\n ', __filename, 'line', __line, '; Error: ', err, '; url = ', url);
            }
            if (consoleLog) {
              //   logger.debug('\n ', __filename, 'line', __line, '; getting file nodeCounter = ', nodeCounter, '; url = ', url, '\n narrative.substring(0, substringChars) = ', narrative.substring(0, substringChars), ' [INTENTIONALLY TRUNCATED TO FIRST 300 CHARACTERS]');
            }
            // massage the downloaded narrative file
            var narrWebPageAsString = utilities_aq_viz.forceUnicodeEncoding(narrative.toString());
            trimmedNarrative = utilities_aq_viz.trimNarrative2(narrWebPageAsString, url);
            trimmedLabeledNarrative = utilities_aq_viz.addFileLabel(trimmedNarrative, url);
            // write the file to this directory: readWriteLocalNarrativesFilePath = __dirname + '/../data/committees/' + committee + '/narratives/';
            syncWriteHtmlFile(trimmedLabeledNarrative, readWriteLocalNarrativesFilePath + nodeNarrFileName);
            // Next: PARSE NARRATIVE FOR LINKS
          }
        }
        callback();
      },

      // extract ids/reference numbers from the narrative files for each link/node
      //  function (callback) {
      //  var addConnectionIdsArrayFromNarrative = function (node, narrative) {
      //  callback();
      // },
      // read each narrative file from local storage using 'narrativeFileName' from the data file
      // parse the narratives

      function (callback) {
        var narrative, link, nodeNarrFileName;
        logger.debug(__filename, 'line', __line, '; function #:', ++functionCount, '; ');
        // read the data file; each node has a narrativeFileName property
        data = JSON.parse(fse.readFileSync(dataJsonLocalOutputFileNameAndPath, fsOptions));
        // var links = data.nodes;
        nodes = data.nodes;
        for (var nodeCounter = 0; nodeCounter < nodes.length; nodeCounter++) {
          node = nodes[nodeCounter];
          node.linksFromNarrArray = [];
          // skip over nodes that represent individuals and entities no longer on the sanctions
          // list (as represented by node.noLongerListed === 0)
          // because they probably (?) have no narrative file on the UN web site
          if (node.noLongerListed === 1) {
            logger.debug(__filename, 'line', __line, '; utilities_aq_viz.showObjectProperties(node) = ', utilities_aq_viz.showObjectProperties(node), ' is no longer listed as a sanction party');
          }
          nodeNarrFileName = node.narrativeFileName;
          /*
           if (nodeNarrFileName === 'NSQE4601E.shtml') {
           logger.error(__filename, 'line', __line, '; nodeNarrFileName.length = ', nodeNarrFileName.length, '; link.urlNum = ', link.urlNum, 'link.targetName = ', link.targetName, ' malformed narrative file name', '; utilities_aq_viz.showObjectProperties(link) = ', utilities_aq_viz.showObjectProperties(link));
           }
           */
          readWriteLocalNarrativesFilePath = __dirname + '/../data/committees/' + committee + '/narratives/' + node.narrativeFileName;
          try {
            narrative = fse.readFileSync(readWriteLocalNarrativesFilePath, fsOptions);
          } catch (err) {
            logger.error('\n ', __filename, 'line', __line, '; Error reading narrativeFileName: ', err, ';\n nodeNarrFileName = ', nodeNarrFileName, '; \readWriteLocalNarrativesFilePath = ', readWriteLocalNarrativesFilePath, '; node.noLongerListed = ', node.noLongerListed, '; utilities_aq_viz.showObjectProperties(link) = ', utilities_aq_viz.showObjectProperties(node));
          }
          addConnectionIdsArrayFromNarrative(node, narrative);
        }
        callback();
      },

      // write intermediate data file for debugging
      function
        (callback) {
        var writeJsonPathAndFileName = writeJsonOutputDebuggingDirectory + 'data-L' + __line + '-collectedLinks.json';
        utilities_aq_viz.stringifyAndWriteJsonDataFile(data, writeJsonPathAndFileName);
        utilities_aq_viz.stringifyAndWriteJsonDataFile(data, dataJsonLocalOutputFileNameAndPath);
        callback();
      },

      function (callback) {
        // read data json file
        // dataJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/data2.json';
        // var configJsonFileName = __dirname + '/../data/config/config.json';
        var buffer = fse.readFileSync(dataJsonLocalOutputFileNameAndPath, fsOptions);
        data = JSON.parse(buffer);
        // validateNodeIds(data);
        addPairedIdsToNodes();
//        addPairedIdsToLinks();
        addSourceTargetObjectsToLinks();
        sortSourceTargetIds(data.links);
        //  sortArrayOfPairedIds(data.links);

        logger.debug(__filename, 'line', __line, '; data.links.length = ', data.links.length);

        callback();
      },

      // write intermediate data file for debugging
      function (callback) {
        if (data) {
          var writeJsonPathAndFileName = writeJsonOutputDebuggingDirectory + 'data-L' + __line + '-collectedLinks.json';
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, writeJsonPathAndFileName);
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, dataJsonLocalOutputFileNameAndPath);
        }
        callback();
      },
      /*
       function (callback) {
       // read data json file
       // dataJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/data2.json';
       // var configJsonFileName = __dirname + '/../data/config/config.json';
       var buffer = fse.readFileSync(dataJsonLocalOutputFileNameAndPath, fsOptions);
       data = JSON.parse(buffer);
       var links = data.links;
       //  var pairedIdA, pairedIdB;

       /*
       for (var linkCounterA = 0; linkCounterA < links.length; linkCounterA++) {
       pairedIdA = links[linkCounterA];

       for (var linkCounterB = linkCounterA + 1; linkCounterB < links.length; linkCounterB++) {
       pairedIdB = links[linkCounterB];
       var valueA = fixIdCase(pairedIdA[0]) + pairedIdA[1];
       var valueB = fixIdCase(pairedIdB[0]) + pairedIdB[1];
       if (valueA === valueB) {
       delete links[linkCounterB];
       }
       }
       }

       addPairedIdsToNodes();
       addPairedIdsToLinks();
       sortArrayOfPairedIds(data.links);
       logger.debug(__filename, 'line', __line, '; data.links.length = ', data.links.length);

       callback();
       },
       */
      // write intermediate data file for debugging
      function (callback) {
        if (data) {
          var writeJsonPathAndFileName = writeJsonOutputDebuggingDirectory + 'data-L' + __line + '-collectedLinks.json';
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, writeJsonPathAndFileName);
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, dataJsonLocalOutputFileNameAndPath);
        }
        callback();
      },

      // create dot file
      //
      function (callback) {
        logger.debug(__filename, 'line', __line, '; function #:', ++functionCount);

        var linkString, link1, link0;
        var link;
        // read the data file; each node has a narrativeFileName property
        data = JSON.parse(fse.readFileSync(dataJsonLocalOutputFileNameAndPath, fsOptions));
        // validateNodeIds(data);

        linkString = "strict graph 1267 {\n";
        var links = data.links;
        for (var linkCounter = 0; linkCounter < links.length; linkCounter++) {
          link = links[linkCounter];

          if (link[0]) {
            link0 = fixIdCase(link[0]).replace(/\./, '_');
            link1 = link[1].replace(/\./, '_');
            linkString += link0 + ' -- ' + link1 + ';\n';
          } else {
            link0 = fixIdCase(link.source).replace(/\./, '_');
            link1 = (link.target).replace(/\./, '_');
            linkString += link0 + ' -- ' + link1 + ';\n';
          }

        }
        linkString += '}';
        fse.writeFileSync(dotFileLocalOutputFileNameAndPath, linkString, fsOptions);
        callback();
      },

      function (callback) {
        logger.debug(__filename, 'line', __line, '; function #:', ++functionCount);
        validateNodeIds(data);
        callback();
      },

      // write intermediate data file for debugging
      function (callback) {
        if (data) {
          var writeJsonPathAndFileName = writeJsonOutputDebuggingDirectory + 'data-L' + __line + '-collectedLinks.json';
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, writeJsonPathAndFileName);
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, dataJsonLocalOutputFileNameAndPath);
        }
        callback();
      },


      // summarize output
      // compare number of comment links to number of narrative links
      function (callback) {
        validateNodeIds(data);
        // dataJsonLocalOutputFileNameAndPath = __dirname + '/../data/committees/' + committee + '/data2.json';
        // var configJsonFileName = __dirname + '/../data/config/config.json';
        var buffer = fse.readFileSync(dataJsonLocalOutputFileNameAndPath, fsOptions);
        data = JSON.parse(buffer);
        logger.debug(__filename, 'line', __line, '; data.nodes.length = ', data.nodes.length);
        logger.debug(__filename, 'line', __line, '; data.links.length = ', data.links.length);
//        logger.debug(__filename, 'line', __line, '; data.comments.links.length = ', data.comments.links.length);
        //       logger.debug(__filename, 'line', __line, '; data.narratives.links.length = ', data.narratives.links.length);
        //       logger.debug(__filename, 'line', __line, '; data.links.length = ', data.links.length);
        //      nodes.forEach(function (node) {
        //        if (consoleLog === true && node.nodeNumber % logModulus === 0) {
        //         logger.debug(__filename, 'line', __line, '; utilities_aq_viz.nodeSummary(node) = \n', utilities_aq_viz.nodeSummary(node));
        //      }
        /*
         if ((typeof node.links !== 'null') && (typeof node.links !== 'undefined')) {
         logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, '; node.links.length = ', node.links.length);
         }
         if ((typeof node.linksNarr !== 'null') && (typeof node.linksNarr !== 'undefined')) {
         logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, 'node.linksNarr.length = ', node.linksNarr.length);
         }
         if ((typeof node.connectedToIdFromNarrativesArray !== 'null') && (typeof node.connectedToIdFromNarrativesArray !== 'undefined')) {
         logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, 'node.connectedToIdFromNarrativesArray.length = ', node.connectedToIdFromNarrativesArray.length);
         }
         if ((typeof node.connectionIdsFromNarrativesStrSet !== 'null') && (typeof node.connectionIdsFromNarrativesStrSet !== 'undefined')) {
         logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, 'node.connectionIdsFromNarrativesStrSet.count = ', node.connectionIdsFromNarrativesStrSet.count);
         }
         // logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber);
         //}
         });
         */
        callback();
      },


      // count links; add linkcount to nodes
      function (callback) {
        logger.debug(__filename, 'line', __line, '; function #:', ++functionCount);
        data = utilities_aq_viz.countLinks(data);
//        validateNodeIds(data);
        callback();
      },



      // write intermediate data file for debugging
      function
        (callback) {
        if (data) {
          var writeJsonPathAndFileName = writeJsonOutputDebuggingDirectory + 'data-L' + __line + '-final_save.json';
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, writeJsonPathAndFileName);
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data, dataJsonLocalOutputFileNameAndPath);
        }
        callback();
      }


    ],
    function (err) {
      // if (consoleLog) { logger.debug( __filename, 'line', __line, ' wroteJson = ', trunc.n400(myResult));
      if (err) {
        logger.error(__filename, 'line', __line, '; Error: ' + err);
      }
    }
  );
};

var validateNodeIds = function (data) {
//  var nodes = data.nodes;
  var nodeMap = new Map();

  (data.nodes).forEach(function (node) {
    nodeMap.add(node.id, node);
  });
var link;
  for (var linkCounter = 0; linkCounter < data.links.length; linkCounter++) {
link = data.links[linkCounter];
//  (data.links).forEach(function (link) {
//    if (link) {

      var linkSource = link.source;
      var linkTarget = link.target;
      if (!nodeMap.get(link.source) || (!nodeMap.get(link.target))) {

//      First, find the index of the element you want to remove:

//        var array = [2, 5, 9];
//      var index = links.indexOf(link);
        //    Note: browser support for indexOf is limited, it is not supported in IE7-8.

        //  Then remove it with splice:

        if (linkCounter > -1) {
          data.links.splice(linkCounter, 1);
        }
//      The second parameter o

        // delete link;
        console.log('Error, missing node source or target: ', linkSource, linkTarget);
      }
    }
  //}
};

// parse each the html narrative list files
// put html file names in narrativeUrlsArray
// write to json file: narrativeUrlsArrayLocalFileNameAndPath -> data
// create a narrLink object and set properties:
// narrLink.indivOrEntityString = indivOrEntityString;
// narrLink.rowNum = i;
// narrLink.urlNum = nodes.length + 1;
// nodes.push(narrLink);

var syncParseHtmlListPage = function (htmlString, indivOrEntityString) {


  /*
   We are parsing this table:
   <div id="maincontent" class="column"><a name="text"></a>
   <!--    ==============================  MAIN CONTENT BEGINS ===================================   -->
   <h3 align="center">NARRATIVE SUMMARIES OF REASONS FOR LISTING</h3>
   <p align="center"><strong>Individuals  associated with Al-Qaida</strong></p>
   <table border="1" cellspacing="0" cellpadding="0" width="604">
   <tr>
   <td width="133"><p align="center"><strong>Permanent reference number</strong></p></td>
   <td width="320"><p align="center"><strong>Name</strong></p></td>
   <td width="150"><p align="center"><strong>Posted on</strong></p></td>
   </tr>
   <tr>
   <td width="133"><p align="center">QDi.001</p></td>
   <td width="320" valign="top"><p><a href="NSQDi001E.shtml">Sayf-al Adl</a></p></td>
   <td width="150"><p align="center">07 September 2010</p></td>
   </tr>
   <tr>
   <td width="133"><p align="center">QDi.002</p></td>
   <td width="320" valign="top"><p><a href="NSQDi002E.shtml">Amin Muhammad Ul    Haq Saam Khan</a></p></td>
   <td width="150"><p align="center">10 January 2011</p></td>
   </tr>
   */

  var node, rowNum, rawId, cleanId;
  var nodes = data.nodes;

  // loop through each table row
  try {
    logger.debug(__filename, ' line ', __line, '; running syncParseHtmlListPage (htmlString = ', htmlString.substring(0, 100), ', indivOrEntityString = ', indivOrEntityString, ')');
    if (!htmlString) {
      logger.error(__filename, ' line ', __line, 'Error: parameter htmlString missing');
      throw {
        name: 'MissingParameterError',
        message: '; Parameter \'htmlString\' = ' + htmlString
      };
    }
    if (utilities_aq_viz.errorPageReturned(htmlString)) {
      logger.error(__filename, ' line ', __line, 'Error: PageNotFoundError; Server returned: ', utilities_aq_viz.errorPageReturned(htmlString));
      throw {
        name: 'PageNotFoundError',
        message: '; Server returned: ' + responseBody.match('Error: Page Not Found')
      };
    }

    // re 'handler', see the following lines below:
    //   var parser = new htmlparser.Parser(handler);
    //   parser.parseComplete(responseBody);
    var handler = new htmlparser.DefaultHandler(function (err, dom) {
      if (err) {
        logger.error(__filename, 'line', __line, 'Error: ' + err);
      } else {
        // soupselect happening here...
        // var titles = select(dom, 'a.title');
        rows = select(dom, 'table tr');

        for (var i = 0; i < rows.length; i++) {
          // skip the header row
          if (i === 0) {
            continue;
          }
          rowNum = i;
          row = rows[i];
          // we are creating a json array of nodes / data
          node = {};
          tds = select(row, 'td');
          // loop through each td/column in the row
          for (var j = 0; j < tds.length; j++) {
            td = tds[j];
            // get the id/permanent reference number from the first td
            if (j === 0) {
              paragraph = select(td, 'p');
              // unless (!paragraph || (!paragraph[0]) || (!paragraph[0].children));
              if (!(!paragraph || (!paragraph[0]) || (!paragraph[0].children))) {
                if (indivOrEntityString === 'entity') {
                  try {
                    rawId = paragraph[0].children[0].data;
                    cleanId = getCleanId(rawId);
                    node.id = cleanId.trim(); // getCleanId(rawId); //paragraph[0].children[0].dat1a);11
                  } catch (err) {
                    logger.error(__filename, 'line', __line, ' Error: ', err, '; rawId = ', rawId, '; paragraph = ', paragraph);
                  }
                } else {
                  try {
                    // use individual id type
                    rawId = paragraph[0].children[0].data;
                    cleanId = rawId.trim(); //getCleanId(rawId);
                    node.id = cleanId.trim(); // getCleanId(rawId); //paragraph[0].children[0].dat1a);
                  } catch (err) {
                    logger.error(__filename, 'line', __line, ' Error: ', err, '; rawId = ', rawId, '; paragraph = ', paragraph);
                  }
                }
              }
            }
            // if we are in the second td in the row, extract the narrative file name...
            else if (j === 1) {
              paragraph = select(td, 'p');
              anchor = select(td, 'a');

              if (typeof paragraph !== 'undefined' && typeof paragraph[0] !== 'undefined') {
                //logger.debug( __filename, 'line', __line, 'paragraph = ', JSON.stringify(paragraph));
                if (typeof paragraph[0].children[0].attribs !== 'undefined') {
                  try {
                    narrativeFileName = paragraph[0].children[0].attribs.href;
                    narrativeFileName = normalizeNarrativeFileName(narrativeFileName); //.replace(/\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
                    // narrativeFileName = narrativeFileName.replace(/http:\/\/dev.un.org\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
                    // http://dev.un.org/sc/committees/1267/
                    node.narrativeFileName = narrativeFileName;
                  } catch (err) {
                    logger.error(__filename, 'line', __line, '; paragraph[0].children[0] = ', paragraph[0].children[0]);
                    logger.error(__filename, 'line', __line, '; Error: paragraph[0].children[0].attribs is undefined; tr = ', i, '; td = ', j, err);
                  }
                } else if (typeof anchor[0].attribs.href !== 'undefined') {
                  try {
                    node.narrativeFileName = normalizeNarrativeFileName(narrativeFileName);
                    node.targetName = JSON.stringify(anchor[0].children[0].data);
                  } catch (err) {
                    logger.error(__filename, 'line', __line, '; Error: ', err);
                  }
                } else {
                  try {
                    node.narrativeFileName = 'PLACEHOLDER0';
                    logger.error(__filename, 'line', __line, '; Error: narrativeFileName for tr = ', i, '; td = ', j, 'is PLACEHOLDER0');
                  } catch (err) {
                    logger.error(__filename, 'line', __line, '; Error: ', err);
                  }
                }
                // if anchor inside of paragraph
                try {
                  if (anchor[0].children[0].data !== 'u') {
                    targetName = anchor[0].children[0].data;
                  } else if (anchor[0].children[0].data === 'u') {
                    underscore = select(td, 'u');
                    targetName = JSON.stringify(underscore[0].children[0].data);
                  } else {
                    targetName = 'PLACEHOLDER1';
                  }
                  targetName = targetName.replace(/[\n\f\r\t]/gm, '');
                  targetName = targetName.replace(/\s\s+/gm, ' ');
                  targetName = targetName.trim();
                  if (targetName === '') {
                    node.targetName = 'PLACEHOLDER2';
                  } else {
                    node.targetName = targetName;
                  }
                } catch (err) {
                  logger.error(__filename, 'line', __line, '; Error: ', err);
                }
                // end of if (typeof paragraph !== 'undefined' && typeof paragraph[0] !== 'undefined')
              } else if (typeof anchor[0].attribs.href !== 'undefined' && anchor[0].attribs.href !== '') {

                try {
                  narrativeFileName = normalizeNarrativeFileName(anchor[0].attribs.href);
                  node.narrativeFileName = narrativeFileName;
                  if (typeof anchor[0].children[0] !== 'undefined' && anchor[0].children[0].data !== '') {
                    targetName = anchor[0].children[0].data;
                    node.targetName = targetName;
                  }

                } catch (err) {
                  logger.error(__filename, 'line', __line, '; Error: ', err);
                }
              }
            }
          }
          node.indivOrEntityString = indivOrEntityString;
          node.rowNum = i;
          node.urlNum = nodes.length + 1;
          nodes.push(node);
        }
      }
    });
    // table tr td p a need to be lower case
    htmlString = convertHtmlTagsToLowerCase(htmlString);
    // syncWriteHtmlFile(htmlString, __dirname + '/../data/committees/' + committee + '/'+ indivOrEntityString + '-parsed.html');
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(htmlString);

    writeMyFile(dataJsonLocalOutputFileNameAndPath, JSON.stringify(data, null, ' '), fsOptions);
  } catch (err) {
    utilities_aq_viz.getStackTrace(err);
    logger.error(__filename, 'line', __line, ' Error: ', err);
  }
};

// str.replace(/str[123]|etc/, replaceCallback);
// Imagine you have a lookup object of strings and replacements.
// and this callback function:
var replaceCallback = function (match) {
  return match.toLowerCase();
  /*
   var lookup = {"<TABLE": "<table", "<TR": "<tr", "<TD": "<td","<P": "<p", "<HREF": "<href", "<A": "<a" };
   if (lookup[match])
   return lookup[match];
   else
   return match;
   */
};

// table tr td p a HREF need to be lower case
var convertHtmlTagsToLowerCase = function (inString) {
  var outString = inString.replace(/(<TABLE)/gm, replaceCallback);
  outString = outString.replace(/(<\/TABLE)/gm, replaceCallback);
  outString = outString.replace(/(<TR)/gm, replaceCallback);
  outString = outString.replace(/(<TD)/gm, replaceCallback);
  outString = outString.replace(/(<A)/gm, replaceCallback);
  outString = outString.replace(/(<P)/gm, replaceCallback);
  outString = outString.replace(/(HREF)/gm, replaceCallback);
  outString = outString.replace(/(<\/TR)/gm, replaceCallback);
  outString = outString.replace(/(<\/TD)/gm, replaceCallback);
  outString = outString.replace(/(<\/A)/gm, replaceCallback);
  outString = outString.replace(/(<\/P)/gm, replaceCallback);
  return outString;
};

String.prototype.replaceAt = function (index, character) {
  return this.substring(0, index) + character + this.substr(index + character.length);
};

var fixIdCase = function (inString) {
  if (inString) {
    if (inString.substring(2, 3) === 'E') {
      return inString.replaceAt(2, 'e');
    } else {
      return inString;
    }
  } else {

    logger.error(__filename, 'line', __line, '; inString null or not defined');
  }
};

var normalizeNarrativeFileName = function (narrativeFileNameString) {
  // logger.debug( __filename, __line, '; narrativeFileNameString = ', narrativeFileNameString);
  var narrativeFileName1 = narrativeFileNameString.replace(/http:\/\/dev.un.org\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
  // var narrativeFileName1 = narrativeFileNameString.replace(/http:\/\/dev.un.org(\/sc\/committees\/1267\/NSQ.*\.shtml)/, '$1');
  // logger.debug( __filename, __line, '; narrativeFileName1 = ', narrativeFileName1);
  var narrativeFileName2 = narrativeFileName1.replace(/\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
  return narrativeFileName2.trim();
};

var cleanUpIds = function (nodes) {
  counter = 0;
  nodes.forEach(function (node) {
    counter++;
    // remove period from end of all reference numbers that have them; not all do.
    var refNumRegexMatch;
    try {
      refNumRegexMatch = (node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
      node.id = refNumRegexMatch[1].trim();
    } catch (err) {
      if (consoleLog) {
        logger.error(__filename, 'line', __line, '; Error: ', err, '; node =', node, '; node.id = ', node.id, '; counter = ', counter);
      }
    }
    //  clean up indiv id for consistency;  none should have trailing period.

    if ((node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/)[1].trim() !== node.id.trim()) {
      logger.error(__filename, 'line', __line, ' Error: ', err, '; Cannot parse node.REFERENCE_NUMBER');
      throw {
        name: 'IDError',
        message: '; Cannot parse node.REFERENCE_NUMBER'
      };
    }
    // for consistency, remove period from end of all reference numbers that have them; not all do.
    if (counter <= numObjectsToShow) {
      if (consoleLog) {
        logger.debug(__filename, 'line', __line, '; counter = ', counter, '; node.id = ', node.id);
//        logger.debug( __filename, 'line', __line, '; counter = ', counter, '; node with ids', node);
      }
    }
  });
};
var createIndivAliasString = function (singleAlias) {
  var aliasString, aliasName, aliasQuality; // = '';
  aliasName = singleAlias.ALIAS_NAME;
  aliasQuality = singleAlias.QUALITY;
  aliasString = aliasName + ' (' + aliasQuality + ')';
  return aliasString;
};

// some REFERENCE numbers in the source xml (including those in comments) have periods at the end; some don't; we remove all trailing periods for consistency.
var cleanUpRefNums = function (nodes) {
  counter = 0;
  nodes.forEach(function (node) {
    counter++;
    // var rawRefNum = node.REFERENCE_NUMBER.trim();
    // for consistency, remove period from end of all reference numbers that have them; not all do.
    var refNumRegexMatch;
    try {
      refNumRegexMatch = (node.REFERENCE_NUMBER).match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
    } catch (err) {
      logger.error(__filename, 'line', __line, '; Error: ', err, '; node =', node, '; counter = ', counter);
    }
    try {
      node.REFERENCE_NUMBER = refNumRegexMatch[0].trim();
    } catch (err) {
      logger.error(__filename, 'line', __line, '; Error: ', err);
    }
    if (counter <= numObjectsToShow) {
      if (consoleLog) {
        logger.debug(__filename, 'line', __line, '; counter = ', counter, '; node.REFERENCE_NUMBER = ', node.REFERENCE_NUMBER);
      }
    }
  });
};

// create an array, connectedToId[], of linked-to ids in each node;
// create link objects for each link (source and target ids) and insert in each node
var addConnectionIdsArrayFromComments = function (nodes) {
  var comments;
  var linkRegexMatch;
  counter = 0;
  nodes.forEach(function (node) {
    node.connectionIdsFromCommentsSet = new Set();
    node.connectedToIdFromCommentsArray = [];
    node.links = [];
    node.linksSet = new Set();
    comments = node.COMMENTS1;

    var weHaveCommentsToParse = (!comments &&
    (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) !== 'undefined'));

    // if ((typeof comments !== 'undefined') && (typeof comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) !== 'undefined')) {
    if (weHaveCommentsToParse === true) {
      linkRegexMatch = comments.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
      // we have at least one link in the comments
      if (linkRegexMatch !== null) {
        if (consoleLog && (node.nodeNumber % logModulus === 0)) {
          logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, '; node.id = ', node.id,
            '; node.name = ', node.name, '; has ', linkRegexMatch.length, 'link regex matches from comments');
        }
        // LOOP THROUGH EACH REGEX MATCH
        for (var linkFromCommentNumber = 0; linkFromCommentNumber < linkRegexMatch.length; linkFromCommentNumber++) {
          if (linkRegexMatch[linkFromCommentNumber] !== node.id) {
            node.connectionIdsFromCommentsSet.add(linkRegexMatch[linkFromCommentNumber]);
          }
        }
        node.connectionIdsFromCommentsSet.forEach(function (uniqueConnectionIdFromComments) {
          node.connectedToIdFromCommentsArray.push(uniqueConnectionIdFromComments);
          node.links.push(uniqueConnectionIdFromComments);
        });
      }
      if (consoleLog && (node.nodeNumber % logModulus === 0)) {
        logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, '; node.id = ', node.id, '; node.name = ', node.name, '; has node.connectionIdsFromCommentsSet set.length = ', node.connectionIdsFromCommentsSet.length);
      }
    } else {
      if (consoleLog && (node.nodeNumber % logModulus === 0)) {
        logger.debug(__filename, 'line', __line, '; counter = ', counter, '; node.id = ', node.id, '; node.name = ', node.name, '; has no comments to parse; node.COMMENTS1 = ', node.COMMENTS1);
      }
    }
  });
};

var addConnectionIdsArrayFromNarrative = function (node, narrative) {
  // ar nodeNarrFileName;
  var nodeNarrFileName = node.narrativeFileName;
  var linkRegexMatch;
  // var narrFileName;
  // counter = 0;
  if (node.noLongerListed === 1) {
    logger.debug(__filename, 'line', __line, '; link summary = ', utilities_aq_viz.nodeSummary(node), ' is no longer listed.');
  }
  else {
    //  nodeNarrFileName = link.narrativeFileName;
    if (consoleLog) {
      logger.debug(__filename, 'line', __line, '; getting narrative file nodeNarrFileName = ', nodeNarrFileName, '\n truncateString(narrative) = ', truncateString(narrative), '; utilities_aq_viz.nodeSummary(link) = \n', utilities_aq_viz.nodeSummary(node));
    }
    // var narrWebPageAsString = utilities_aq_viz.forceUnicodeEncoding(narrative.toString());
    // trimmedNarrative = utilities_aq_viz.trimNarrative2(narrWebPageAsString, url);
    // trimmedLabeledNarrative = utilities_aq_viz.addFileLabel(trimmedNarrative, url);
    // writeNarrativesFilePath = __dirname + '/../data/narrative_summaries/' + nodeNarrFileName;
    // syncWriteHtmlFile(trimmedLabeledNarrative, writeNarrativesFilePath);
    // PARSE NARRATIVE FOR LINKS
    // addConnectionIdsArrayFromNarrative(link, narrative);

    node.connectionIdsFromNarrativeSet = new StrSet();
    node.connectedToIdFromNarrativeArray = [];
//    link.linksFromNarrArray = [];
//    link.linksSet = new Set();
    // narrative = link.Narrative1;

    //   var weHaveNarrativeToParse = (!(!narrative ||
    //   (typeof narrative.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) !== 'undefined')));

    // if ((typeof Narrative !== 'undefined') && (typeof Narrative.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi) !== 'undefined')) {
    if (narrative) {
      linkRegexMatch = null;
      //  (QD[ie]\.\d{3})
      linkRegexMatch = narrative.match(/(QD[ie]\.\d{3})/gi);
//      linkRegexMatch = narrative.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/gi);
      if (consoleLog) {
        logger.debug(__filename, 'line', __line, '; linkRegexMatch = ', linkRegexMatch);
        logger.debug(__filename, 'line', __line, '; link.urlNum = ', node.urlNum, '; link.id = ', node.id,
          '; link.targetName = ', node.targetName, '; has typeof linkRegexMatch = ', typeof linkRegexMatch);
        // we have at least one link in the Narrative
        if (!linkRegexMatch || !linkRegexMatch.length) {
          logger.debug(__filename, 'line', __line, '; link.urlNum = ', node.urlNum, '; link.id = ', node.id,
            '; link.targetName = ', node.targetName, '; has typeof linkRegexMatch = null');

        }
      }
      if (linkRegexMatch !== null) {
        if (consoleLog && (node.urlNum % logModulus === 0)) {
          logger.debug(__filename, 'line', __line, '; link.urlNum = ', node.urlNum, '; link.id = ', node.id,
            '; link.targetName = ', node.targetName, '; has ', linkRegexMatch.length, 'link regex matches from Narrative');
        }
        // LOOP THROUGH EACH REGEX MATCH
        try {
          for (var linkFromNarrativeNumber = 0; linkFromNarrativeNumber < linkRegexMatch.length; linkFromNarrativeNumber++) {
            if (linkRegexMatch[linkFromNarrativeNumber] !== node.id) {
              node.connectionIdsFromNarrativeSet.add(linkRegexMatch[linkFromNarrativeNumber]);
            }
          }
        } catch (err) {
          logger.error(__filename, 'line', __line, '; Error: ', err);
        }
        node.connectionIdsFromNarrativeSet.forEach(function (uniqueConnectionIdFromNarrative) {
          node.connectedToIdFromNarrativeArray.push(uniqueConnectionIdFromNarrative);
          node.linksFromNarrArray.push(uniqueConnectionIdFromNarrative);
        });
      }
      if (consoleLog && (node.urlNum % logModulus === 0)) {
        logger.debug(__filename, 'line', __line, '; link.urlNum = ', node.urlNum, '; link.id = ', node.id, '; link.targetName = ', node.targetName, '; has link.connectionIdsFromNarrativeSet set.length = ', node.connectionIdsFromNarrativeSet.length);
      }
    } else {
      if (consoleLog && (node.urlNum % logModulus === 0)) {
        logger.debug(__filename, 'line', __line, '; counter = ', counter, '; link.id = ', node.id, '; link.targetName = ', node.targetName, '; has no narrative to parse.');
      }
    }
  }
};

// within each narrative link, create array of pairedNodeIds
/*
 pairedNodeIds = ['QDi.042','QDi.054']
 sort the values
 */
var addPairedIdsToNodes = function () {
  var nodes = data.nodes;
  var pairedNodeIds;
  var concatenatedPairedIds;
  nodes.forEach(function (node) {
    node.pairedNodeIdsFromNarrative = [];
    node.pairedNodeIdsFromNarrativeSet = new Set();
    if (node.linksFromNarrArray) {
      node.linksFromNarrArray.forEach(function (targetNodeId) {
        if (node.id !== targetNodeId) {
          pairedNodeIds = [];
          pairedNodeIds.push(node.id);
          pairedNodeIds.push(targetNodeId);
          sortArrayOfStrings(pairedNodeIds);

          concatenatedPairedIds = fixIdCase(pairedNodeIds[0]) + pairedNodeIds[1];

          if (node.pairedNodeIdsFromNarrativeSet.add(concatenatedPairedIds)) {
            node.pairedNodeIdsFromNarrative.push(pairedNodeIds);
          }
//          if (data.linkSet.add(pairedNodeIds)) {
          //           data.links.push(pairedNodeIds);
          //         }
        }
        if (consoleLog) {
          if (node.urlNum % logModulus === 0) {
            logger.debug(__filename, 'line', __line, '; narrativeLink.id = ', node.id, '; narrativeLink.urlNum = ',
              node.urlNum, '; pairedNodeIds = ', pairedNodeIds, utilities_aq_viz.getStackTrace(err));
          }
        }
      });
    }
  });
};

var addSourceTargetObjectsToLinks = function () {
  var nodes = data.nodes;
  data.linkSet = data.linkSet || new Set();
  var concatenatedPairedIds;
  data.links = data.links || [];
  var linkSet = data.linkSet;
  var pairedNodeIds;
  var sourceTargetObject;

  if (nodes) {

    nodes.forEach(function (node) {
        if (node && node.pairedNodeIdsFromNarrative && node.pairedNodeIdsFromNarrative.length > 0) {
          for (var pairedIdCounter = 0; pairedIdCounter < node.pairedNodeIdsFromNarrative.length; pairedIdCounter++) {
            pairedNodeIds = node.pairedNodeIdsFromNarrative[pairedIdCounter];

            if (pairedNodeIds && pairedNodeIds[0] && pairedNodeIds[1]) {
              concatenatedPairedIds = fixIdCase(pairedNodeIds[0]) + pairedNodeIds[1];

              sourceTargetObject = {};
              sourceTargetObject.source = fixIdCase(pairedNodeIds[0]);
              sourceTargetObject.target = fixIdCase(pairedNodeIds[1]);

              if (concatenatedPairedIds && linkSet && linkSet.add(concatenatedPairedIds)) {

                (data.links).push(sourceTargetObject);

              } else {
                logger.debug(__filename, 'line', __line, '; linkSet.add(concatenatedPairedIds) = ', linkSet.add(concatenatedPairedIds));
              }
            }
          }
        }
      }
    );
  }
};

var addPairedIdsToLinks = function () {
  var nodes = data.nodes;
  data.linkSet = data.linkSet || new Set();
  var concatenatedPairedIds;
  data.links = data.links || [];
  var linkSet = data.linkSet;
  var pairedNodeIds;
  if (nodes) {
    nodes.forEach(function (node) {
        if (node && node.pairedNodeIdsFromNarrative && node.pairedNodeIdsFromNarrative.length > 0) {
          for (var pairedIdCounter = 0; pairedIdCounter < node.pairedNodeIdsFromNarrative.length; pairedIdCounter++) {
            pairedNodeIds = node.pairedNodeIdsFromNarrative[pairedIdCounter];
            if (pairedNodeIds && pairedNodeIds[0] && pairedNodeIds[1]) {
              concatenatedPairedIds = fixIdCase(pairedNodeIds[0]) + pairedNodeIds[1];

              if (concatenatedPairedIds && linkSet && linkSet.add(concatenatedPairedIds)) {
                (data.links).push(pairedNodeIds);
              } else {
                logger.debug(__filename, 'line', __line, '; linkSet.add(concatenatedPairedIds) = ', linkSet.add(concatenatedPairedIds));
              }
            }
          }
        }
      }
    );
  }
};

// within each NODE, create array of connection objects with source and target
var addConnectionObjectsArrayFromNarratives = function (nodes) {
// for each node
  var connectionFromNarrative; // the connection object
  counter = 0;
  nodes.forEach(function (node) {

    node.connectionObjectsFromNarrative = node.connectionObjectsFromNarrative || [];
    // var weHaveNodeConnectedToIdFromNarrativeToParse = (node.connectedToIdFromNarrativeArray);
    if (node.connectedToIdFromNarrativeArray) {
      node.connectedToIdFromNarrativeArray.forEach(function (connId) {
        if (node.id !== connId) {
          connectionFromNarrative = {};
          connectionFromNarrative.source = node.id;
          connectionFromNarrative.target = connId;
          node.connectionObjectsFromNarrative.push(connectionFromNarrative);
        }
        if (consoleLog) {
          if (node.nodeNumber % logModulus === 0) {
            logger.debug(__filename, 'line', __line, '; node.id = ', node.id, '; connectionFromNarrative = ', connectionFromNarrative);
          }
        }
      });
    }
  });
};

var concatNames = function (nodes) {
  counter = 0;
  nodes.forEach(function (node) {
    counter++;
    var name = '';
    var nameArray = [];
//    var firstName = node.FIRST_NAME;
    var secondName = node.SECOND_NAME;
    var thirdName = node.THIRD_NAME;
//    var fourthName = node.FOURTH_NAME;

    nameArray.push(node.FIRST_NAME);
    nameArray.push(node.SECOND_NAME);
    nameArray.push(node.THIRD_NAME);
    nameArray.push(node.FOURTH_NAME);
    var nameFromArray = nameArray.join(' ');

    if (node.FIRST_NAME) {
      name = name.concat(node.FIRST_NAME.trim());
    }
    if (secondName) {
      name = name.concat(' ', secondName.trim());
    }
    if (thirdName) {
      name = name.concat(' ', thirdName.trim());
    }
    if (node.FOURTH_NAME) {
      name = name.concat(' ', node.FOURTH_NAME.trim());
    }
    node.name = name.trim();
    if (counter <= 10) {
      if (consoleLog) {
        logger.debug(__filename, 'line', __line, '; node.name = ', node.name, 'nameFromArray = ', nameFromArray);
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

// consolidate links from comments; remove duplicates, BUT DOES IT REALLY?
// create a top-level array of links containing a source and target
var consolidateLinksFromComments = function (data) {
  // if (consoleLog) { logger.debug( __filename, 'line',__line, '; data = ', data);
  if (consoleLog) {
    logger.debug(__filename, 'line', __line, '; data.nodes[0] = ', data.nodes[0]);
    logger.debug(__filename, 'line', __line, '; data.nodes[1] = ', data.nodes[1]);
  }
//  data.links = [];
  var linksSet = new Set();
  // var linksMap = new Map();
  // var mapCounter = 1;
  var connectionObjectsFromCommentsCount = 0;
  (data.nodes).forEach(function (node) {
    if ((typeof node.connectionObjectsFromComments !== 'undefined') && (typeof node.connectionObjectsFromComments.length !== 'undefined') && (node.connectionObjectsFromComments.length > 0)) {
      connectionObjectsFromCommentsCount = connectionObjectsFromCommentsCount + node.connectionObjectsFromComments.length;
      node.connectionObjectsFromComments.forEach(function (conn) {
        if (conn && linksSet.add(conn) === true) {
          data.links.push(conn);
        }
      });
    }
  });
  data.comments.links = data.links;
  if (consoleLog) {
    logger.debug(__filename, 'line', __line, '; connectionObjectsFromCommentsCount = ', connectionObjectsFromCommentsCount, '; linksSet.count = ', linksSet.count);
  }
  // linksSet = null;
};

// consolidate links from narratives; remove duplicates, BUT DOES IT REALLY?
// create a top-level array of links containing a source and target
var consolidateLinks = function (data) {
  // if (consoleLog) { logger.debug( __filename, 'line',__line, '; data = ', data);
//  data.links = [];
  var nodes = data.nodes;
  var linksNarrSet = new Set();
  // var linksMap = new Map();
  // var mapCounter = 1;
  var connectionObjectsFromNarrativesCount = 0;
  nodes.forEach(function (node) {
    if (node.connectionObjectsFromNarrative && node.connectionObjectsFromNarrative.length && (node.connectionObjectsFromNarrative.length > 0)) {
      connectionObjectsFromNarrativesCount = connectionObjectsFromNarrativesCount + node.connectionObjectsFromNarrative.length;
      node.connectionObjectsFromNarrative.forEach(function (conn) {
        if (conn && linksNarrSet.add(conn) === true) {
          data.links.push(conn);
        }
      });
// node.linkCount = node.connectionObjectsFromNarrative.length;
    }
  });
//  data.links = data.links;
  // data.comments.links = data.links;
  if (consoleLog) {
    logger.debug(__filename, 'line', __line, '; connectionObjectsFromNarrativesCount = ', connectionObjectsFromNarrativesCount, '; linksNarrSet.count = ', linksNarrSet.count);
  }
  // linksSet = null;
};

var checkNodeExistsById = function (nodeId) {
  var consoleLogValueToBeRestored = consoleLog;
  consoleLog = false;
  var nodeIdsSet = new StrSet();
  nodes = data.nodes;
  nodes.forEach(function (node) {
    if (node.id) {
      nodeIdsSet.add(node.id);
    }
  });
  if (!nodeIdsSet.exists(nodeId)) {
    logger.debug(__filename, 'line', __line, ', nodeId = ', nodeId, ' DOES NOT EXIST as as node.;  missingNodesNarrativesCount = ', '; nodeSummary = ', utilities_aq_viz.nodeSummary(node));
    consoleLog = consoleLogValueToBeRestored;
    return false;
  } else {
    consoleLog = consoleLogValueToBeRestored;
    return true;
  }

};

var checkTargetsExist = function (nodes, links) {
  var consoleLogValueToBeRestored = consoleLog;
  consoleLog = false;
  var nodeTargetIdsFromNarrativeSet = new StrSet();
  var nodeTargetIdsFromCommentsSet = new StrSet();
  var nodeIdsSet = new StrSet();
  nodes.forEach(function (node) {
    if (node.id) {
      nodeIdsSet.add(node.id);
    }
  });
  var missingNodesCommentsCount = 0;
  var missingNodesNarrativesCount = 0;
  nodes.forEach(function (node) {
    node.connectionObjectsFromComments.forEach(function (connectionFromComment) {
      if (!nodeIdsSet.exists(connectionFromComment.target)) {
        missingNodesCommentsCount++;
        logger.debug(__filename, 'line', __line, ', connectionFromComment: ', connectionFromComment, ' DOES NOT EXIST. missingNodesCommentsCount = ', missingNodesCommentsCount);
      }
    });
    node.linksFromNarrArray.forEach(function (linkTarget) {
      if (!nodeIdsSet.exists(linkTarget)) {
        missingNodesNarrativesCount++;
        logger.debug(__filename, 'line', __line, ', linkTarget = ', linkTarget, ' DOES NOT EXIST. generateNarrFileNameFromId = ', utilities_aq_viz.generateNarrFileNameFromId(linkTarget), ';  missingNodesNarrativesCount = ', missingNodesNarrativesCount, '; nodeSummary = ', utilities_aq_viz.nodeSummary(node));
      }
      if (linkTarget) {
        nodeTargetIdsFromNarrativeSet.add(linkTarget);
      }
    })
  });
  if (consoleLog) {
    logger.debug(__filename, 'line', __line, '; the total number of links between nodes is (i.e., links.length = ) ', links.length);
    logger.debug(__filename, 'line', __line, '; the total number of unique link target nodes from narratives is ', nodeTargetIdsFromNarrativeSet.count);
    logger.debug(__filename, 'line', __line, '; the total number of unique link target nodes from comments is ', nodeTargetIdsFromCommentsSet.count);
    logger.debug(__filename, 'line', __line, '; missingNodesCommentsCount = ', missingNodesCommentsCount);
    logger.debug(__filename, 'line', __line, '; missingNodesNarrativesCount = ', missingNodesNarrativesCount);
  }

  consoleLog = consoleLogValueToBeRestored;
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

var createDateGeneratedMessage = function () {
  var dateListGeneratedString = data.dateGenerated;
  var dateListGenerated = new Date(dateListGeneratedString);
  dateFormat.masks.shortDate = 'mm-dd-yyyy';
  dateFormat.masks.friendly_display = 'dddd, mmmm dS, yyyy';
  generatedFileDateString = vizFormatDateSetup(dateListGenerated);
  var message = 'Collected consolidated.xml labeled as generated on: ' + dateListGeneratedString + ' [' + dateListGenerated + ']';
  data.message = message;
  logger.debug([__filename, ' line ', __line + '; ', message].join(''));
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

// for DOB, etc.
var formatDate = function (intlDateString) {
  var dateResultString;
  var date = new Date(intlDateString);
  dateFormat.masks.shortDate = 'mm-dd-yyyy';
  try {
    dateResultString = dateFormat(date, 'shortDate');
  } catch (err) {
    logger.error('769 Error: ', err, '; intlDateString = ', intlDateString);
  }
  // logger.debug(__filename + ' line ' + __line + '; ' + dateResultString);
  return dateResultString;
};

//  clean up ids for consistency;  none should have trailing period.
var getCleanId = function (referenceNumber) {
  // var refNumRegexMatch;
  var result1, result2, result3, result4;
// correct typos in narrative ids
  try {
    result1 = referenceNumber.replace(/\.\./gi, '.');
    result2 = result1.replace(/ÃÂ/gi, '');
    result3 = result2.replace(/QIA/gi, 'QI.A');
    result4 = result3.replace(/Q\.E\.262\.08/gi, 'QI.E.262.08');
//    logger.debug(__filename, 'line', __line, '; refNumRegexMatch =', refNumRegexMatch, '; referenceNumber = ', referenceNumber);
  } catch (err) {
    logger.error(__filename, 'line', __line, '; Error: ', err, '; referenceNumber =', referenceNumber);
  }

//  try {
//    refNumRegexMatch = result3.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
  // logger.debug(__filename, 'line', __line, '; refNumRegexMatch =', refNumRegexMatch, '; referenceNumber = ', referenceNumber);
//  } catch (err) {
//    logger.error(__filename, 'line', __line, '; Error: ', err, '; referenceNumber =', referenceNumber, '; counter = ', counter);
//  }
  //return refNumRegexMatch[0].trim();

  return result4;
};

var getKeys = function (pob) {
  var keys = [];
  for (var key in pob) {
    keys.push(key);
//    logger.debug('pob[key] = ', pob[key]); //, '; pob[value]', pob.valueOf(key));
  }
  return keys;
};
/*
 // count the unique links for each node
 var countLinks = function (data) {
 var nodeCounter;
 // loop through each node
 data.nodes.forEach(function (node) {
 nodeCounter = 0;
 // nodeCounter = 0;
 var keySet = new Set();
 var keyAdded1, keyAdded2;
 var linkConcatKey1, linkConcatKey2;
 // loop through each link
 data.links.forEach(function (link) {
 // delete a link if source and target are the same
 if (link.source === link.target) {
 delete data.link;
 logger.debug(__filename, 'line', __line, 'deleted ', data.link, ' because link.source === link.target');
 } else {
 // increment the link count if the node.id is either the link source or link target
 if (node.id === link.source || node.id === link.target) {
 linkConcatKey1 = link.source + link.target;
 linkConcatKey2 = link.target + link.source;
 keyAdded1 = keySet.add(linkConcatKey1);
 keyAdded2 = keySet.add(linkConcatKey2);
 if (keyAdded1 && keyAdded2) {
 nodeCounter++;
 }
 }
 }
 });
 node.linkCount = nodeCounter;
 //    node.linkCount = node.connectionObjectsFromNarrative.length;
 if (node.nodeNumber % logModulus === 0) {
 // logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, '; nodeCounter = ', nodeCounter);
 //      logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, '; node.links.length = ', node.links.length, 'node.linksFromNarrArray.length = ', node.linksFromNarrArray.length, '; ', node.links.length, '/', node.linksFromNarrArray.length);
 }
 });
 };
 */
var processDateUpdatedArray = function (d) {
  var dateUpdatedArrayString = '';
  if (typeof d['LAST_DAY_UPDATED'] === 'undefined') {
    d.lastDateUpdatedCount = 0;
    //  return '';
  } else if (Object.prototype.toString.call(d['LAST_DAY_UPDATED']['VALUE']) === '[object Array]') {
    // logger.debug( __filename, 'line', __line, '; processDateUpdatedArray() found  Array!', d['LAST_DAY_UPDATED']);
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
    // logger.debug( __filename, 'line', __line, '; processAliasArray() found  Array!', d['INDIVIDUAL_PLACE_OF_BIRTH']);
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

var processPlaceOfBirthArray = function (d) {
  var pobArrayString = '';
  if (typeof d['INDIVIDUAL_PLACE_OF_BIRTH'] !== 'undefined') {
    if (Object.prototype.toString.call(d['INDIVIDUAL_PLACE_OF_BIRTH']) === '[object Array]') {
      // logger.debug( __filename, 'line', __line, ';  Array!', d['INDIVIDUAL_PLACE_OF_BIRTH']);
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

var sortArrayOfStrings = function (arrayOfStrings) {
  arrayOfStrings.sort(function (stringA, stringB) {
    if (stringA > stringB) {
      return 1;
    }
    if (stringA < stringB) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
};

var sortArrayOfPairedIds = function (arrayOfPairedIds) {
  arrayOfPairedIds.sort(function (pairedIdA, pairedIdB) {
    var valueA = fixIdCase(pairedIdA[0]) + pairedIdA[1];
    var valueB = fixIdCase(pairedIdB[0]) + pairedIdB[1];
    if (valueA > valueB) {
      return 1;
    }
    if (valueA < valueB) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
};

var sortSourceTargetIds = function (arrayOfSourceTargetObjects) {
  var temp;
  arrayOfSourceTargetObjects.forEach(function (object) {
    if (object.source > object.target) {
      temp = object.source;
      object.source = object.target;
      object.target = temp;
    }
  });

  arrayOfSourceTargetObjects.sort(function (objectA, objectB) {
    var valueA = fixIdCase(objectA.source) + objectA.target;
    var valueB = fixIdCase(objectB.source) + objectB.target;
    if (valueA > valueB) {
      return 1;
    }
    if (valueA < valueB) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
};

var syncGetHtmlAsUnicodeString = function (url) {
  // try {
  var res;
  res = requestSync('GET', url);
  var responseBody = res.body.toString();
  var htmlString = utilities_aq_viz.forceUnicodeEncoding(responseBody);
//  utilities_aq_viz.syncWriteMyFile(narrative, saveFilePath, fsOptions);
  return htmlString.trim();
  // } catch (err) {
  // logger.error('\n ', __filename, 'line', __line, '; Error: ', err);
  //}
};

// collect a named file from an Internet host and save it locally; specify indivOrEntityString equals a string either 'entity' or 'indiv'
// save to json file: nodesLocalFileNameAndPath
var syncWriteHtmlFile = function (htmlString, saveFilePath) {
  var unicodeHtmlString = utilities_aq_viz.forceUnicodeEncoding(htmlString);
  utilities_aq_viz.syncWriteMyFile(unicodeHtmlString, saveFilePath, fsOptions);
  return true;
};

var truncateString = function (inString) {
  if (typeof inString !== 'undefined') {
    var outString = '[TRUNCATED]' + inString.substring(0, substringChars) + '\n ... [CONSOLE LOG OUTPUT INTENTIONALLY TRUNCATED TO FIRST ' + substringChars + ' CHARACTERS]';
    return outString + ' ;-)';
  } else {
    return false;
  }
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
  // logger.debug('viz.js 947 vizFormatDate() dateString = ', dateString);
  return vizDateString.trim();
};

var writeMyFile = function (localFileNameAndPath, data, fsOptions) {
  try {
    fse.writeFileSync(localFileNameAndPath, data, fsOptions);
  } catch (err) {
    logger.error(__filename, 'line', __line, ' Error: ', err);
  }
};

parse2Lists();

module.exports = {
  parse2Lists: parse2Lists
};


