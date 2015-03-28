// parse2lists.js
// collect consolidated sanctions list file from 'http://www.un.org/sc/committees/consolidated.xml', convert to json
// get the two html files containing narrative names and file names/urls
// write narrative urls array file (a json array) to /data/narrative_lists/narrativeUrlsArray.json
// normalize the data and put it into arrays for d3
// each element in the node array in the main json data file (represented by the 'data' variable and stored in /data/output/data_committee.json) contains data on a single individual or
// entity listed in the consolidated.xml sanctions data file collected from the U.N. site located at http://www.un.org/sc/committees/1267/.
//==========================

var appConfig = require('./appConfig.js');
var markup_beauty = require('./markup_beauty.js');
var cc = require('./committeesConfig.js');
var getCommitteesJson = require('./committeesConfig.js').getCommitteesJson;
var utilities_aq_viz = require('./utilities_aq_viz');

// RUN CONFIGURATION
// skip downloading 300+ narrative files and use locally stored files instead; for debugging
var useLocalListFiles = appConfig.useLocalListFiles;
var useLocalNarrativeFiles = appConfig.useLocalNarrativeFiles;
//var getCommitteesArray = require('./committees.js').getCommitteesArray;
// do we want lots of console.log messages for debugging (if so, set consoleLog = true)
var consoleLog = appConfig.consoleLog;
// skip downloading 300+ narrative files and use locally stored files instead; for debugging
// var logger = utilities_aq_viz.logger;
var logger = require('./tracer-logger-config.js').logger;
var logModulus = utilities_aq_viz.logModulus;
var substringChars = utilities_aq_viz.truncateToNumChars;
var linenums = require('./linenums.js');
var responseBody;
var individualsHtmlUnicodeString;
var entitiesHtmlUnicodeString;
var iterators = require('async-iterators');
// var missingNodes = require('./missing_nodes.js'),
var async = require('async'),
  re = require('request-enhanced'),
  request = require('request'),
  fse = require('fs-extra'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect');

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
// var anchor,
var data_narr = {},
  url;

var entitiesListUrl;
var host = 'www.un.org';
var config;
var committee4parse;
var committeesJson;
var committeesArray;

var getCommittee = function () {
  return committee4parse;
};

var start = function () {
  committeesArray = appConfig.getCommitteesArray();
//  var functionCount = 0;
  async.series([
      function (callback) {
        committeesJson = getCommitteesJson();
        callback();
      },

      function (callback) {
        if (committeesArray) {

          // committeesArray = ['751'];
          committeesArray.forEach(function (committeeParam) {
            // committee4parse = committeeParam;
            parse2ListsCommittee(committeeParam);
          });
        } else {
          utilities_aq_viz.throwCustomError();
        }
        callback();
      }

    ],
    function (err) {
      if (err) {
        logger.error(__filename, 'line', __line, '; Error: ' + err, '; committeesJson[committee4parse].subjectMatterAbbreviated = ', committeesJson[committee4parse].subjectMatterAbbreviated);
      }
    });
};

var parse2ListsCommittee = function (committeeParam) {
  if (!committeesJson) {
    throw {
      name: 'committeesJsonMissing',
      message: 'committeesJson is null or undefined'
    };
  }
  committee4parse = committeeParam;
  var functionCount = 0;
  if (true) {
    logger.debug('\n ', __filename, __line, '; running parse2ListsCommittee; committeeParam = ', committeeParam);
  }
  async.series([
      // read the data_narr.json file created by collect.js
      // download narrative list files:
      // download from each U.N. sanctions committee web site the two list files for sanctioned (1) individuals and (2) entities.
      // collect from the Internet (for example, from www.un.org/sc/committees/1267/individuals_associated_with_Al-Qaida.shtml)
      // the raw html page that lists the names of html files containing narratives regarding sanctioned individuals
      // parse the list file, extract ids, file names etc. and put into narrativeUrlsArray json array
      // write as local file: individualsLocalOutputFileNameAndPath = __dirname + '/../data/narrative_lists/individuals_associated_with_Al-Qaida.json';
      function (callback) {
        if (consoleLog) {
          logger.debug('\n ', __filename, __line, '; function 1#:', ++functionCount, '; collect the two list files for sanctioned individuals and entities; committee4parse = ', committee4parse);
        }

        // data_narr.nodes will be derived from the narratives; later we will sync with data_xml nodes.
        data_narr.nodes = [];
        if (!useLocalListFiles) {
          // 1 of 2: list of individuals
          if (committeesJson[committee4parse].individualsListUrl) {
            individualsHtmlUnicodeString = syncGetHtmlAsUnicodeString(committeesJson[committee4parse].individualsListUrl);
            if (utilities_aq_viz.errorPageReturned(individualsHtmlUnicodeString)) {
              logger.error(__filename, ' line ', __line, 'Error: Server returned: ', utilities_aq_viz.errorPageReturned(individualsHtmlUnicodeString));
            }
            try {
              syncWriteHtmlFile(individualsHtmlUnicodeString, committeesJson[committee4parse].individualsHtmlLocalOutputFileNameAndPath);
            } catch (err) {
              logger.error('\n ', __filename, 'line', __line, '; Error: ', err);
            }
          }
          // 2 of 2: entities list
          if (committeesJson[committee4parse].entitiesListUrl) {
            entitiesHtmlUnicodeString = syncGetHtmlAsUnicodeString(entitiesListUrl);
            if (utilities_aq_viz.errorPageReturned(entitiesHtmlUnicodeString)) {
              logger.error(__filename, ' line ', __line, 'Error: PageNotFoundError; Server returned ', utilities_aq_viz.errorPageReturned(entitiesHtmlUnicodeString));
            }
            try {
              syncWriteHtmlFile(entitiesHtmlUnicodeString, committeesJson[committee4parse].entitiesHtmlLocalOutputFileNameAndPath);
            } catch (err) {
              logger.error('\n ', __filename, 'line', __line, '; Error: ', err);
            }
          }
        } else {
          // open local html files previously downloaded from the UN website to the local file system
          // instead of downloading the list files from the UN web site,
          logger.warn(__filename, 'line', __line, '; useLocalListFiles = ', useLocalListFiles, '; reading stored (previously downloaded) local files: ', '; committeesJson[committee4parse].individualsHtmlLocalOutputFileNameAndPath = ', committeesJson[committee4parse].individualsHtmlLocalOutputFileNameAndPath, '; committeesJson[committee4parse].entitiesHtmlLocalOutputFileNameAndPath = ', committeesJson[committee4parse].entitiesHtmlLocalOutputFileNameAndPath);

          individualsHtmlUnicodeString = null;
          entitiesHtmlUnicodeString = null;
          try {
            if (committeesJson[committee4parse].individualsHtmlLocalOutputFileNameAndPath) {
              individualsHtmlUnicodeString = fse.readFileSync(committeesJson[committee4parse].individualsHtmlLocalOutputFileNameAndPath, fsOptions);
            }
          }
          catch (err) {
            logger.error('\n ', __filename, 'line', __line, '; Error: ', err, utilities_aq_viz.getStackTrace(err));
          }
          try {
            if (committeesJson[committee4parse].entitiesHtmlLocalOutputFileNameAndPath) {
              entitiesHtmlUnicodeString = fse.readFileSync(committeesJson[committee4parse].entitiesHtmlLocalOutputFileNameAndPath, fsOptions);
            }
          } catch (err) {
            logger.error('\n ', __filename, 'line', __line, '; Error: ', err, utilities_aq_viz.getStackTrace(err));
          }
        }
        callback();
      },

      // write intermediate data file for debugging
      function
        (callback) {
        if (data_narr) {
          // var writeJsonPathAndFileName = writeJsonOutputDebuggingDirectory + 'data_html-parse2-L' + __line + '-collectedLinks.json';
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data_narr, committeesJson[committee4parse].writeJsonOutputDebuggingDirectory + 'data_html-parse2-L' + __line + '-readOrCollectedNarrListsHtml.json');
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data_narr, committeesJson[committee4parse].narrDataPath);
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
        if (individualsHtmlUnicodeString) {
          syncParseHtmlListPage(individualsHtmlUnicodeString, 'indiv');
        }
        // entities
        // committee 1572 does not have an entities list page
        if (entitiesHtmlUnicodeString) {
          syncParseHtmlListPage(entitiesHtmlUnicodeString, 'entity');
        }
        // For committee 1988, the list of both individuals and entities is on a single page here: http://www.un.org/sc/committees/1988/narrative.shtml
        if (committee4parse === '1988') {
          syncParseHtmlListPage(individualsHtmlUnicodeString, '');
        }
        callback();
      }

      ,

      // write intermediate data file for debugging
      function
        (callback) {
        if (data_narr) {
          // var writeJsonPathAndFileName = writeJsonOutputDebuggingDirectory + 'data_html-parse2-L' + __line + '-collectedLinks.json';
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data_narr, committeesJson[committee4parse].writeJsonOutputDebuggingDirectory + 'data_html-parse2-L' + __line + '-syncParseHtmlListPage.json');
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data_narr, committeesJson[committee4parse].narrDataPath);
        }
        callback();
      },

      // create nodes
      // using filenames previously extracted from the two list files, download each narrative file from the UN web site and save to local file
      // if a target node id does not exist in the node ids set, create a node.
      // using 'narrativeFileName' from the data_narr file, parse the narratives
      // read each narrative file from local storage using 'narrativeFileName' from the data_narr file
      // parse the narratives
      // narrative file names must have 10 characters, not counting the '.shtml' extension
      // using file names extracted from the two list files and organized in the data_narr2.json file, download each narrative file from the UN web site and save to local file
      // if a target node id does not exist create a node.
      // using 'narrativeFileName' from the data_narr file, parse the narratives
      function (callback) {
        logger.debug(__filename, 'line', __line, '; function #:', ++functionCount, '; useLocalNarrativeFiles = ', useLocalNarrativeFiles);
        // do we want to parse files freshly downloaded from the Internet or use locally stored files?
        // if useLocalNarrativeFiles === true, we will not download all the narrative files; use locally stored copies instead.
        if (!useLocalNarrativeFiles) {
          var narrative, nodeNarrFileName, trimmedNarrative, trimmedLabeledNarrative; //, writeNarrativesFilePath;
          // read the data_narr file; each node has a narrativeFileName property
          data_narr = JSON.parse(fse.readFileSync(committeesJson[committee4parse].narrDataPath, fsOptions));
          var node;
          for (var nodeCounter = 0; nodeCounter < data_narr.nodes.length; nodeCounter++) {
            node = data_narr.nodes[nodeCounter];
            nodeNarrFileName = node.narrativeFileName;
            url = committeesJson[committee4parse].narrativesUrlPath + nodeNarrFileName;
            var arg;
            try {
              narrative = syncGetHtmlAsUnicodeString(committeesJson[committee4parse].narrativesUrlPath + nodeNarrFileName);
              arg.input = narrative;
              narrative = markup_beauty(arg);

            } catch (err) {
              logger.error('\n ', __filename, 'line', __line, '; Error: ', err, '; url = ', url);
            }
            if (consoleLog) {
              //   logger.debug('\n ', __filename, 'line', __line, '; getting file nodeCounter = ', nodeCounter, '; url = ', url, '\n narrative.substring(0, substringChars) = ', narrative.substring(0, substringChars), ' [INTENTIONALLY TRUNCATED TO FIRST 300 CHARACTERS]');
            }
            // massage the downloaded narrative file
            if (narrative) {
              var narrWebPageAsString = utilities_aq_viz.forceUnicodeEncoding(narrative.toString());
            } else {
              logger.error('\n ', __filename, 'line', __line, '; Error: narrative not found');
            }
            // trim the narrative html file; remove head, etc.
            trimmedNarrative = utilities_aq_viz.trimNarrative2(narrWebPageAsString, url);
            trimmedLabeledNarrative = utilities_aq_viz.addFileLabel(trimmedNarrative, url);
            // write the file to this directory: readWriteLocalNarrativesFilePath = __dirname + '/../data/committees/' + committee4parse + '/narratives/';
            syncWriteHtmlFile(trimmedLabeledNarrative, committeesJson[committee4parse].readWriteLocalNarrativesFilePath + nodeNarrFileName);
            // Next: PARSE NARRATIVE FOR LINKS
          }
        }
        callback();
      }

      ,

      // extract ids/reference numbers from the narrative files for each link/node
      //  function (callback) {
      //  var addConnectionIdsArrayFromNarrative = function (node, narrative) {
      //  callback();
      // },
      // read each narrative file from local storage using 'narrativeFileName' from the data_narr file
      // parse the narratives

      function (callback) {
        var narrative, link, nodes, node, nodeNarrFileName;
        logger.debug(__filename, 'line', __line, '; function #:', ++functionCount, '; ');
        // read the data_narr file; each node has a narrativeFileName property
        data_narr = JSON.parse(fse.readFileSync(committeesJson[committee4parse].narrDataPath, fsOptions));
        // var links = data_narr.nodes;
        nodes = data_narr.nodes;
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
//          readWriteLocalNarrativesFilePath = readWriteLocalNarrativesFilePath + node.narrativeFileName;
          try {
            narrative = fse.readFileSync(committeesJson[committee4parse].readWriteLocalNarrativesFilePath + node.narrativeFileName, fsOptions);
          } catch (err) {
            logger.error('\n ', __filename, 'line', __line, '; Error reading narrativeFileName: ', err, ';\n nodeNarrFileName = ', nodeNarrFileName, '; \readWriteLocalNarrativesFilePath = ', committeesJson[committee4parse].readWriteLocalNarrativesFilePath, '; node.noLongerListed = ', node.noLongerListed, '; utilities_aq_viz.showObjectProperties(link) = ', utilities_aq_viz.showObjectProperties(node));
          }
          addConnectionIdsArrayFromNarrative(node, narrative);
        }
        callback();
      }

      ,

      // write intermediate data_narr file for debugging
      function
        (callback) {
        // var writeJsonPathAndFileName = writeJsonOutputDebuggingDirectory + 'data_narr_html-parse2-L' + __line + '-collectedLinks.json';
        utilities_aq_viz.stringifyAndWriteJsonDataFile(data_narr, committeesJson[committee4parse].writeJsonOutputDebuggingDirectory + 'data_html-parse2-L' + __line + '-message.json');
        utilities_aq_viz.stringifyAndWriteJsonDataFile(data_narr, committeesJson[committee4parse].narrDataPath);
        callback();
      }

      ,

      function (callback) {
        // read data_narr json file
        // committeesJson[committee4parse].narrDataPath = __dirname + '/../data/committees/' + committee4parse + '/data2.json';
        // var configJsonFileName = __dirname + '/../data/config/config.json';
        var buffer = fse.readFileSync(committeesJson[committee4parse].narrDataPath, fsOptions);
        data_narr = JSON.parse(buffer);
        // validateNodeIds(data_narr);
        addPairedIdsToNodes();
//        addPairedIdsToLinks();
        addSourceTargetObjectsToLinks();
        sortSourceTargetIds(data_narr.links);
        //  sortArrayOfPairedIds(data_narr.links);

        logger.debug(__filename, 'line', __line, '; data_narr.links.length = ', data_narr.links.length);

        callback();
      }

      ,

      // write intermediate data_narr file for debugging
      function (callback) {
        if (data_narr) {
          // var writeJsonPathAndFileName = writeJsonOutputDebuggingDirectory + 'data_html-parse2-L' + __line + '-collectedLinks.json';
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data_narr, committeesJson[committee4parse].writeJsonOutputDebuggingDirectory + 'data_html-parse2-L' + __line + '-message.json');
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data_narr, committeesJson[committee4parse].narrDataPath);
        }
        callback();
      }

      ,
      /*
       function (callback) {
       // read data_narr json file
       // committeesJson[committee4parse].narrDataPath = __dirname + '/../data/committees/' + committee4parse + '/data2.json';
       // var configJsonFileName = __dirname + '/../data/config/config.json';
       var buffer = fse.readFileSync(committeesJson[committee4parse].narrDataPath, fsOptions);
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
      // write intermediate data_narr file for debugging
      function (callback) {
        if (data_narr) {
          // var writeJsonPathAndFileName = writeJsonOutputDebuggingDirectory + 'data_html-parse2-L' + __line + '-collectedLinks.json';
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data_narr, committeesJson[committee4parse].writeJsonOutputDebuggingDirectory + 'data_html-parse2-L' + __line + '-message.json');
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data_narr, committeesJson[committee4parse].narrDataPath);
        }
        callback();
      }

      ,

      // create dot file
      //
      function (callback) {
        logger.debug(__filename, 'line', __line, '; function #:', ++functionCount);

        var linkString, link1, link0;
        var link;
        // read the data_narr file; each node has a narrativeFileName property
        data_narr = JSON.parse(fse.readFileSync(committeesJson[committee4parse].narrDataPath, fsOptions));
        // validateNodeIds(data_narr);

        linkString = "strict graph 1267 {\n";
        var links = data_narr.links;
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
        fse.writeFileSync(committeesJson[committee4parse].dotFileLocalOutputFileNameAndPath, linkString, fsOptions);
        callback();
      }

      ,

      function (callback) {
        logger.debug(__filename, 'line', __line, '; function #:', ++functionCount);
        validateNodeIds(data_narr);
        callback();
      }

      ,

      // write intermediate data_narr file for debugging
      function (callback) {
        if (data_narr) {
          // var writeJsonPathAndFileName = committeesJson[committee4parse].writeJsonOutputDebuggingDirectory + 'data_html-parse2-L' + __line + '-collectedLinks.json';
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data_narr, committeesJson[committee4parse].writeJsonOutputDebuggingDirectory + 'data_html-parse2-L' + __line + '-message.json');
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data_narr, committeesJson[committee4parse].narrDataPath);
        }
        callback();
      }

      ,

      // summarize output
      // compare number of comment links to number of narrative links
      function (callback) {
        validateNodeIds(data_narr);
        // committeesJson[committee4parse].narrDataPath = __dirname + '/../data/committees/' + committee4parse + '/data2.json';
        // var configJsonFileName = __dirname + '/../data_narr/config/config.json';
        var buffer = fse.readFileSync(committeesJson[committee4parse].narrDataPath, fsOptions);
        data_narr = JSON.parse(buffer);
        logger.debug(__filename, 'line', __line, '; data_narr.nodes.length = ', data_narr.nodes.length);
        logger.debug(__filename, 'line', __line, '; data_narr.links.length = ', data_narr.links.length);
        callback();
      }

      ,

      // count links; add linkcount to nodes
      function (callback) {
        logger.debug(__filename, 'line', __line, '; function #:', ++functionCount);
        data_narr = utilities_aq_viz.countLinks(data_narr);
        callback();
      }

      ,

      // write intermediate data_narr file for debugging
      function
        (callback) {
        if (data_narr) {
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data_narr, committeesJson[committee4parse].writeJsonOutputDebuggingDirectory + 'data_html-parse2-L' + __line + '-summarize_output.json');
          utilities_aq_viz.stringifyAndWriteJsonDataFile(data_narr, committeesJson[committee4parse].narrDataPath);
        }
        callback();
      }

    ],
    function (err) {
      if (err) {
        logger.error(__filename, 'line', __line, '; Error: ' + err);
      }
    }
  )
  ;
};

var validateNodeIds = function (data_narr) {
  if (!committeesJson) {
    throw {
      name: 'committeesJsonMissing',
      message: 'committeesJson is null or undefined'
    };
  }
  var nodeMap = new Map();
  if (data_narr && data_narr.nodes) {
    (data_narr.nodes).forEach(function (node) {
      if (!node.id) {
        logger.error(__filename, 'line', __line, '; node.id is missing');
        /*
         throw {
         name: 'NodeIdMissing',
         message: 'node.id is null or undefined'
         };
         */
      } else {

        nodeMap.add(node.id, node);
      }
    });
  }
  else {
    logger.error(__filename, 'line', __line, ' Error: ', err);
  }
  var link;
  for (var linkCounter = 0; linkCounter < data_narr.links.length; linkCounter++) {
    link = data_narr.links[linkCounter];
    var linkSource = link.source;
    var linkTarget = link.target;
    if (!nodeMap.get(link.source) || (!nodeMap.get(link.target))) {
      if (linkCounter > -1) {
        data_narr.links.splice(linkCounter, 1);
      }
      console.log('Error, missing node source or target: ', linkSource, linkTarget);
    }
  }
};

// parse each of the html narrative list files
// put the file names of the html narratives into variable name ?
// write to json file: narrativeUrlsArrayLocalFileNameAndPath -> data_narr
// create a narrLink object and set properties:
// narrLink.indivOrEntityString = indivOrEntityString;
// narrLink.rowNum = i;
// narrLink.urlNum = nodes.length + 1;
// nodes.push(narrLink);

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
var syncParseHtmlListPage = function (htmlString, indivOrEntityString) {
  indivOrEntityString = indivOrEntityString || '';

  var rowNum, columnNum;

  var node, parser, rawId, cleanId;
  var committee4parse = getCommittee();
  if (!committee4parse) {
    throw {
      name: 'committeeMissing_committee4parse',
      message: 'committee4parse is null or undefined'
    };
  }

  if (!htmlString) {
    logger.error(__filename, ' line ', __line, 'Error: parameter htmlString missing');
    throw {
      name: 'MissingParameterError',
      message: '; Parameter \'htmlString\' = ' + htmlString
    };
  }
  var pageNotFound = function () {
    return utilities_aq_viz.errorPageReturned(htmlString);
  };
  if (utilities_aq_viz.errorPageReturned(htmlString)) {
    logger.error(__filename, ' line ', __line, 'Error: PageNotFoundError; utilities_aq_viz.errorPageReturned(htmlString) = ', utilities_aq_viz.errorPageReturned(htmlString), '; htmlString = ', htmlString);
    var message = __filename + ' line ' + __line + '; committee4parse = ' + committee4parse + '; indivOrEntityString = ' + indivOrEntityString + ' ; pageNotFound; htmlString = \n' + htmlString;
    throw {
      name: 'PageNotFoundError',
      message: message
    };
  }

  if (!committeesJson) {
    throw {
      name: 'committeesJsonMissing',
      message: 'committeesJson is null or undefined'
    };
  }

  logger.debug(__filename, ' line ', __line, '; running syncParseHtmlListPage (htmlString = ', htmlString.substring(0, 100), ', indivOrEntityString = ', indivOrEntityString, ')');

  if (data_narr.nodes) {
    nodes = data_narr.nodes;
  } else {
    logger.error(__filename, ' line ', __line, '; Error: data_narr.nodes not defined');
  }

  // re 'handler', see the following lines below:
  //   var parser = new htmlparser.Parser(handler);
  //   parser.parseComplete(responseBody);
  var handler = new htmlparser.DefaultHandler(function (err, dom) {
    var anchor, rows, row, td, tds, node, paragraph, rawId, cleanId, narrativeFileName, targetName, underscore;
    if (err) {
      logger.error(__filename, 'line', __line, 'Error: ' + err, utilities_aq_viz.getStackTrace(err));
    } else {
      // soupselect happening here...
      // var titles = select(dom, 'a.title');
      rows = select(dom, 'table tr');
      if (!rows || !rows.length) {
        throw {
          name: 'rowsIsUndefined',
          message: 'rows is undefined'
        };
      }
      // loop through each table row

      for (rowNum = 0; rowNum < rows.length; rowNum++) {
        // console.log('rowNum = ', rowNum, '; rows.length = ', rows.length);
        // skip the header row
        row = rows[rowNum];
        if (rowNum === 0) {
          continue;
        }
        // we are creating a json array of nodes / data
        node = {};
        tds = select(row, 'td');
        var columns = tds;
        // loop through each td/column in the row

        if (!columns || !columns.length) {
          var message = '; columns is undefined; columns = ' + columns + '; columns.length = ' + columns.length;
          throw {
            name: 'columnsIsUndefined',
            message: message
          };
        }

        for (columnNum = 0; columnNum < columns.length - 1; columnNum++) {
          // console.log(__filename, 'line', __line, 'columnNum = ', columnNum);

          // get the id/permanent reference number from the first td
          if (columnNum === 0) {
            td = tds[columnNum];
            paragraph = select(td, 'p');
            // console.log('paragraph = ', paragraph);
            if (!(!paragraph || (!paragraph[0]) || (!paragraph[0].children))) {
              if (indivOrEntityString === 'entity') {
                try {
                  rawId = paragraph[0].children[0].data;
                  // console.log('rawId = ', rawId);
                  cleanId = getCleanId(rawId);
                  node.id = cleanId.trim(); // getCleanId(rawId); //paragraph[0].children[0].dat1a);11
                } catch (err) {
                  logger.error(__filename, 'line', __line, ' Error: ', err, '; rawId = ', rawId, '; paragraph = ', paragraph);
                }
              } else {
                try {
                  // use individual id type
                  rawId = paragraph[0].children[0].data;
                  // console.log('rawId = ', rawId);
                  cleanId = rawId.trim(); //getCleanId(rawId);
                  node.id = cleanId.trim(); // getCleanId(rawId); //paragraph[0].children[0].dat1a);
                } catch (err) {
                  logger.error(__filename, 'line', __line, ' Error: ', err, '; rawId = ', rawId, '; paragraph = ', paragraph);
                }
              }
            }
          }
          // if we are in the second td in the row, extract the narrative file name...
          else if (columnNum === 1) {
            td = tds[columnNum];
            paragraph = select(td, 'p');
            anchor = select(td, 'a');

            if (typeof paragraph !== 'undefined' && typeof paragraph[0] !== 'undefined') {
              //logger.debug( __filename, 'line', __line, 'paragraph = ', JSON.stringify(paragraph));
              if (typeof paragraph[0].children[0].attribs !== 'undefined') {
                try {
                  narrativeFileName = paragraph[0].children[0].attribs.href;
                  // console.log('narrativeFileName = ', narrativeFileName);
                  narrativeFileName = normalizeNarrativeFileName(narrativeFileName); //.replace(/\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
                  // narrativeFileName = narrativeFileName.replace(/http:\/\/dev.un.org\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
                  // http://dev.un.org/sc/committees/1267/
                  node.narrativeFileName = narrativeFileName;
                } catch (err) {
                  logger.error(__filename, 'line', __line, '; paragraph[0].children[0] = ', paragraph[0].children[0]);
                  logger.error(__filename, 'line', __line, '; Error: paragraph[0].children[0].attribs is undefined; tr = ', rowNum, '; td = ', columnNum, err);
                }
              } else if (typeof anchor[0].attribs.href !== 'undefined') {
                try {
                  node.narrativeFileName = normalizeNarrativeFileName(narrativeFileName);
                  // console.log('node.narrativeFileName = ', node.narrativeFileName);
                  node.targetName = JSON.stringify(anchor[0].children[0].data);
                  // console.log('node.targetName = ', node.targetName);
                } catch (err) {
                  logger.error(__filename, 'line', __line, '; Error: ', err, utilities_aq_viz.getStackTrace(err));
                }
              } else {
                try {
                  node.narrativeFileName = 'PLACEHOLDER0';
                  // console.log('node.narrativeFileName = ', node.narrativeFileName);
                  logger.error(__filename, 'line', __line, '; Error: narrativeFileName for tr = ', rowNum, '; td = ', columnNum, 'is PLACEHOLDER0');
                } catch (err) {
                  logger.error(__filename, 'line', __line, '; Error: ', err, utilities_aq_viz.getStackTrace(err));
                }
              }
              // if anchor inside of paragraph
              try {
                if (anchor[0].children[0].data !== 'u') {
                  targetName = anchor[0].children[0].data;
                  // console.log(__filename, 'line', __line, 'targetName = ', targetName);
                } else if (anchor[0].children[0].data === 'u') {
                  underscore = select(td, 'u');
                  targetName = JSON.stringify(underscore[0].children[0].data);
                  // console.log(__filename, 'line', __line, 'targetName = ', targetName);
                } else {
                  targetName = 'PLACEHOLDER1';
                  // console.log('targetName = ', targetName);
                }
                // console.log(__filename, 'line', __line, 'targetName = ', targetName);
                targetName = targetName.replace(/[\n\f\r\t]/gm, '');
                targetName = targetName.replace(/\s\s+/gm, ' ');
                targetName = targetName.trim();
                if (targetName === '') {
                  node.targetName = 'PLACEHOLDER2';
                } else {
                  node.targetName = targetName;
                }
              } catch (err) {
                logger.error(__filename, 'line', __line, '; Error: ', err, utilities_aq_viz.getStackTrace(err));
              }
              // end of if (typeof paragraph !== 'undefined' && typeof paragraph[0] !== 'undefined')
            } else if (anchor[0].attribs.href && anchor[0].attribs.href !== '') {

              try {
                narrativeFileName = normalizeNarrativeFileName(anchor[0].attribs.href);
                node.narrativeFileName = narrativeFileName;
                if (anchor[0].children[0] && anchor[0].children[0].data && anchor[0].children[0].data !== '') {
                  targetName = anchor[0].children[0].data;
                  node.targetName = targetName;
                }

              } catch (err) {
                logger.error(__filename, 'line', __line, '; Error: ', err, utilities_aq_viz.getStackTrace(err));
              }
            }
          }
        }
        node.indivOrEntityString = indivOrEntityString;
        node.rowNum = rowNum;
        if (data_narr.nodes) { // } && (data_narr.nodes.length + 1)) {
          node.urlNum = nodes.length + 1;
          data_narr.nodes.push(node);
        } else {
          logger.error(__filename, 'line', __line, '; Error: ', err, '; data_narr.nodes = ', data_narr.nodes, '; data_narr.nodes.length = ', data_narr.nodes.length);
        }

      }
    }
  });

  if (!committeesJson) {
    throw {
      name: 'committeesJsonMissing',
      message: 'committeesJson is null or undefined'
    };
  }

  try {

    // table tr td p a need to be lower case
    htmlString = convertHtmlTagsToLowerCase(htmlString);
    // syncWriteHtmlFile(htmlString, __dirname + '/../data/committees/' + committee4parse + '/'+ indivOrEntityString + '-parsed.html');
    parser = new htmlparser.Parser(handler);
    if (htmlString) {
      parser.parseComplete(htmlString);
    } else {
      logger.error(__filename, ' line ', __line, 'Error: htmlString is undefined');
    }

//    fse.writeFileSync(committeesJson[committee4parse].narrDataPath, JSON.stringify(data_narr, null, ' '), fsOptions);
  } catch (err) {
    if (err) {

      logger.error(__filename, ' line ', __line, 'Error: ', err, '; committee4parse = ', committee4parse, '; indivOrEntityString = ' + indivOrEntityString, '; rowNum = ', rowNum, '; columnNum = ', columnNum);

    }
  }
  fse.writeFileSync(committeesJson[committee4parse].narrDataPath, JSON.stringify(data_narr, null, ' '), fsOptions);
};

// str.replace(/str[123]|etc/, replaceCallback);
// Imagine you have a lookup object of strings and replacements.
// and this callback function:
var replaceCallback = function (match) {
  return match.toLowerCase();

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
      //linkRegexMatch = null;
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
  var nodes = data_narr.nodes;
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
//          if (data_narr.linkSet.add(pairedNodeIds)) {
          //           data_narr.links.push(pairedNodeIds);
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
  // var nodes = data_narr.nodes;
  data_narr.linkSet = data_narr.linkSet || new Set();
  var concatenatedPairedIds;
  data_narr.links = data_narr.links || [];
  // var linkSet = data_narr.linkSet;
  var pairedNodeIds;
  var sourceTargetObject;
  if (data_narr.nodes) {
    data_narr.nodes.forEach(function (node) {
        if (node && node.pairedNodeIdsFromNarrative && node.pairedNodeIdsFromNarrative.length > 0) {
          for (var pairedIdCounter = 0; pairedIdCounter < node.pairedNodeIdsFromNarrative.length; pairedIdCounter++) {
            pairedNodeIds = node.pairedNodeIdsFromNarrative[pairedIdCounter];

            if (pairedNodeIds && pairedNodeIds[0] && pairedNodeIds[1]) {
              concatenatedPairedIds = fixIdCase(pairedNodeIds[0]) + pairedNodeIds[1];

              sourceTargetObject = {};
              sourceTargetObject.source = fixIdCase(pairedNodeIds[0]);
              sourceTargetObject.target = fixIdCase(pairedNodeIds[1]);
              // var xSet = new Set();

              // var y = xSet.add(concatenatedPairedIds);
              if (concatenatedPairedIds && data_narr.linkSet && data_narr.linkSet.add(concatenatedPairedIds)) {

              // var x = linkSet.add(concatenatedPairedIds)

                (data_narr.links).push(sourceTargetObject);

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
  var nodes = data_narr.nodes;
  data_narr.linkSet = data_narr.linkSet || new Set();
  var concatenatedPairedIds;
  data_narr.links = data_narr.links || [];
  // var linkSet = data_narr.linkSet;
  var pairedNodeIds;
  if (nodes) {
    nodes.forEach(function (node) {
        if (node && node.pairedNodeIdsFromNarrative && node.pairedNodeIdsFromNarrative.length > 0) {
          for (var pairedIdCounter = 0; pairedIdCounter < node.pairedNodeIdsFromNarrative.length; pairedIdCounter++) {
            pairedNodeIds = node.pairedNodeIdsFromNarrative[pairedIdCounter];
            if (pairedNodeIds && pairedNodeIds[0] && pairedNodeIds[1]) {
              concatenatedPairedIds = fixIdCase(pairedNodeIds[0]) + pairedNodeIds[1];

              if (concatenatedPairedIds && data_narr.linkSet && data_narr.linkSet.add(concatenatedPairedIds)) {
                (data_narr.links).push(pairedNodeIds);
              } else {
                logger.debug(__filename, 'line', __line, '; data_narr.linkSet.add(concatenatedPairedIds) = ', data_narr.linkSet.add(concatenatedPairedIds));
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
var consolidateLinksFromComments = function (data_narr) {
  // if (consoleLog) { logger.debug( __filename, 'line',__line, '; data_narr = ', data_narr);
  if (consoleLog) {
    logger.debug(__filename, 'line', __line, '; data_narr.nodes[0] = ', data_narr.nodes[0]);
    logger.debug(__filename, 'line', __line, '; data_narr.nodes[1] = ', data_narr.nodes[1]);
  }
//  data_narr.links = [];
  var linksSet = new Set();
  // var linksMap = new Map();
  // var mapCounter = 1;
  var connectionObjectsFromCommentsCount = 0;
  (data_narr.nodes).forEach(function (node) {
    if ((typeof node.connectionObjectsFromComments !== 'undefined') && (typeof node.connectionObjectsFromComments.length !== 'undefined') && (node.connectionObjectsFromComments.length > 0)) {
      connectionObjectsFromCommentsCount = connectionObjectsFromCommentsCount + node.connectionObjectsFromComments.length;
      node.connectionObjectsFromComments.forEach(function (conn) {
        if (conn && linksSet.add(conn) === true) {
          data_narr.links.push(conn);
        }
      });
    }
  });
  data_narr.comments.links = data_narr.links;
  if (consoleLog) {
    logger.debug(__filename, 'line', __line, '; connectionObjectsFromCommentsCount = ', connectionObjectsFromCommentsCount, '; linksSet.count = ', linksSet.count);
  }

};

// consolidate links from narratives; remove duplicates, BUT DOES IT REALLY?
// create a top-level array of links containing a source and target
var consolidateLinks = function (data_narr) {
  // if (consoleLog) { logger.debug( __filename, 'line',__line, '; data_narr = ', data_narr);
//  data_narr.links = [];
  var nodes = data_narr.nodes;
  var linksNarrSet = new Set();
  // var linksMap = new Map();
  // var mapCounter = 1;
  var connectionObjectsFromNarrativesCount = 0;
  nodes.forEach(function (node) {
    if (node.connectionObjectsFromNarrative && node.connectionObjectsFromNarrative.length && (node.connectionObjectsFromNarrative.length > 0)) {
      connectionObjectsFromNarrativesCount = connectionObjectsFromNarrativesCount + node.connectionObjectsFromNarrative.length;
      node.connectionObjectsFromNarrative.forEach(function (conn) {
        if (conn && linksNarrSet.add(conn) === true) {
          data_narr.links.push(conn);
        }
      });
// node.linkCount = node.connectionObjectsFromNarrative.length;
    }
  });

  if (consoleLog) {
    logger.debug(__filename, 'line', __line, '; connectionObjectsFromNarrativesCount = ', connectionObjectsFromNarrativesCount, '; linksNarrSet.count = ', linksNarrSet.count);
  }
};

var checkNodeExistsById = function (nodeId) {
  var consoleLogValueToBeRestored = consoleLog;
  consoleLog = false;
  var nodeIdsSet = new StrSet();
  nodes = data_narr.nodes;
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
  var dateListGeneratedString = data_narr.dateGenerated;
  var dateListGenerated = new Date(dateListGeneratedString);
  dateFormat.masks.shortDate = 'mm-dd-yyyy';
  dateFormat.masks.friendly_display = 'dddd, mmmm dS, yyyy';
  generatedFileDateString = vizFormatDateSetup(dateListGenerated);
  var message = 'Collected consolidated.xml labeled as generated on: ' + dateListGeneratedString + ' [' + dateListGenerated + ']';
  data_narr.message = message;
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
 var countLinks = function (data_narr) {
 var nodeCounter;
 // loop through each node
 data_narr.nodes.forEach(function (node) {
 nodeCounter = 0;
 // nodeCounter = 0;
 var keySet = new Set();
 var keyAdded1, keyAdded2;
 var linkConcatKey1, linkConcatKey2;
 // loop through each link
 data_narr.links.forEach(function (link) {
 // delete a link if source and target are the same
 if (link.source === link.target) {
 delete data_narr.link;
 logger.debug(__filename, 'line', __line, 'deleted ', data_narr.link, ' because link.source === link.target');
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

  return vizDateString.trim();
};

start();



