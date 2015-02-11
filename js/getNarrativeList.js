// filename: getNarrativeList.js
// get the two html files containing narrative names and file names/links
// getData() saves narrative links (a json array) to narrativeLinksLocalFileNameAndPath

var select = require('soupselect').select,
  htmlparser = require('htmlparser'),
  http = require('http'),
  sys = require('sys'),
  consoleLog = true,
  fse = require('fs-extra'),
  util = require('util'),
  linenums = require('./linenums.js'),
  utilities_aq_viz = require('./utilities_aq_viz'),
  MongoClient = require('mongodb').MongoClient,
  assert = require('assert'),
  async = require('async'),
  request = require('sync-request');

var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};
var targetName = '';
var anchor,
  data,
  host,
  narrativeFileName,
  // outputFileNameAndPath,
  paragraph,
  rows,
  row,
  td,
  tds,
  underscore,
  url;
var functionCount = 0;
var narrListSubstringLength = 300;
var indivLinks = [];
var entLinks = [];
var narrativeLinks = [];
var individualsLocalOutputFileNameAndPath = __dirname + '/../data/narrative_lists/individuals_associated_with_Al-Qaida.json';
var entitiesLocalOutputFileNameAndPath = __dirname + '/../data/narrative_lists/entities_other_groups_undertakings_associated_with_Al-Qaida.json';
var narrativeLinksLocalFileNameAndPath = __dirname + '/../data/narrative_lists/narrative_links.json';
var indivOrEntityString;

var getListOfNarratives = function () {
  // collecting from: www.un.org/sc/committees/1267/individuals_associated_with_Al-Qaida.shtml
  var individualsFileNameAndPathForUrl = '/sc/committees/1267/individuals_associated_with_Al-Qaida.shtml';
  var entitiesFileNameAndPathForUrl = '/sc/committees/1267/entities_other_groups_undertakings_associated_with_Al-Qaida.shtml';
  host = 'www.un.org';
  if (consoleLog) {
    console.log('\n ', __filename, 'line', __line, '; running getNarrativeList.js; ', new Date());
  }
  async.series([
      // re: sanctioned *individuals*
      // collect from the Internet (specifically, from www.un.org/sc/committees/1267/individuals_associated_with_Al-Qaida.shtml)
      // the raw html page that lists the names of html files containing narratives regarding sanctioned individuals
      // parse the list file, extract ids, file names etc. and put into narrativeLinks json array
      // save as local file: individualsLocalOutputFileNameAndPath = __dirname + '/../data/narrative_lists/individuals_associated_with_Al-Qaida.json';
      function (callback) {
        if (consoleLog) {
          console.log('\n ', __filename, __line, '; function 1#:', ++functionCount);
        }
        indivOrEntityString = 'indiv';
        try {
          asyncGetRawHtmlPagesWithNarrativeLinks(host, individualsFileNameAndPathForUrl, individualsLocalOutputFileNameAndPath, indivOrEntityString);
        } catch (err) {
          console.log('\n ', __filename, 'line', __line, '; Error: ', err);
        }
        console.log('\n ', __filename, __line, '; collected data from: ', individualsFileNameAndPathForUrl, ' and saved it to ', individualsLocalOutputFileNameAndPath);
        callback();
      },
      // re: sanctioned entities
      // collect from the Internet (specifically, from www.un.org/sc/committees/1267/entities_associated_with_Al-Qaida.shtml)
      // the raw html page which lists the urls for online narratives regarding sanctioned entities
      // parse the html file, extract ids, file names etc. and put into narrativeLinks json array and save as local file
      // save as local file: entitiesLocalOutputFileNameAndPath = __dirname +
      // '/../data/narrative_lists/entities_other_groups_undertakings_associated_with_Al-Qaida.json';
      // save local file: narrativeLinksLocalFileNameAndPath = __dirname + '/../data/narrative_lists/narrative_links.json';
      // asyncronous version of following previously-used function
      function (callback) {
        if (consoleLog) {
          console.log('\n ', __filename, __line, '; function 1#:', ++functionCount);
        }
        indivOrEntityString = 'entity';
        try {
          asyncGetRawHtmlPagesWithNarrativeLinks(host, entitiesFileNameAndPathForUrl, entitiesLocalOutputFileNameAndPath, indivOrEntityString);
        } catch (err) {
          console.log('\n ', __filename, 'line', __line, '; Error: ', err);
        }
        console.log('\n ', __filename, __line, '; collected data from: ', entitiesFileNameAndPathForUrl, ' and saved it to ', entitiesLocalOutputFileNameAndPath);
        callback();
      },


      // The UN list files omit some of the nodes.  In some cases, this appears to be an oversight.  In others, the node
      // is no longer on the sanctions list.  There may be other reasons for the omission as well.
      // If no narrative file name for a node could be found in the UN list files, we generate the expected file name
      // based an observed relationship between a given nodes id and its narrative file name.
      function (callback) {
        console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; ');
        // var narrCounter = 0;
        var jsonFileName = __dirname + '/../data/output/AQList-clean.json';
        data = JSON.parse(fse.readFileSync(jsonFileName));
        var nodes = data.nodes;
        countUndefinedNarrativeFileNames(nodes);
        var node = null;
        // check if the node.narrativeFileName is defined for each node
        for (var ldi = 0; ldi < nodes.length; ldi++) {
          node = nodes[ldi];
          var narrativeFileNameIsMissing = (typeof(node.narrativeFileName) === 'null' || typeof(node.narrativeFileName) === 'undefined');
          //          if (typeof(node.narrativeFileName) === 'null' || typeof(node.narrativeFileName) === 'undefined') {
          if (narrativeFileNameIsMissing) {
            node.narrativeFileName = utilities_aq_viz.generateNarrFileName(node);
            console.log('\n ', __filename, 'line', __line, '; Generated narrative file name for node.id = ', node.id, '; ldi = ', ldi, '; node.name = ', node.name, '; node.noLongerListed = ', node.noLongerListed);
          }
        }
        utilities_aq_viz.saveJsonFile(data, 'AQList-clean-fnames.json');
        callback();
      },



      // Add the Internet file name as a property in each node of data
      function (callback) {
        var buffer;
        var AQListCleanJsonPath = __dirname + '/../data/output/AQList-clean.json';
        var data;
        try {
          buffer = fse.readFileSync(AQListCleanJsonPath);
          data = JSON.parse(buffer);
        } catch (err) {
          console.log('\n ', __filename, 'line', __line, '; Error: ', err);
        }
        var node;
        // var nodes = data.nodes;
        // var linksId;
        var narrCounter = 0;
        console.log('\n ', __filename, 'line', __line, '; function #:', ++functionCount, '; ');
        var readNarrativeFilePath;
        var narrative;
        var link_data_array_item;
        for (var ldi = 0; ldi < narrativeLinks.length; ldi++) {

          console.log(__filename, 'line', __line, '; narrCounter = ', narrCounter);
          link_data_array_item = narrativeLinks[ldi];
          readNarrativeFilePath = __dirname + '/../data/narrative_summaries/' + link_data_array_item.narrativeFileName;
          try {
            buffer = fse.readFileSync(readNarrativeFilePath);
          } catch (err) {
            console.log('\n ', __filename, 'line', __line, '; Error: ', err);
          }
          console.log('\n ', __filename, 'line', __line, '; buffer.length = ', buffer.length);
          var narrWebPageString = forceUnicodeEncoding(buffer.toString());
          narrative = trimNarrative(narrWebPageString);
          link_data_array_item.longNarrative = narrative;
          for (var j = 0; j < data.nodes.length; j++) {
            //nodeCounter++;
            node = data.nodes[j];
            // console.log('\n ', __filename, 'line', __line, '; node.id = ', node.id);
            if (link_data_array_item.id === node.id) {
              if (j < 5) {
                console.log('\n ', __filename, 'line', __line, '; link_data_array_item.id = ', link_data_array_item.id, ' === node.id = ', node.id, ' = ', link_data_array_item.id === node.id);
              }
              node.narrativeFileName = link_data_array_item.narrativeFileName;
            }
          }
          narrCounter++;
          // Insert a single document
        }

        var narrativeLinksDocsPath = __dirname + '/../data/narrative_lists/narrative_links_docs.json';
        writeMyFile(narrativeLinksDocsPath, JSON.stringify(narrativeLinks, null, ' '), fsOptions);
//        var dataLocalFileNameAndPath = __dirname + '/../data/output/AQList-clean-docs.json';
//        writeMyFile(dataLocalFileNameAndPath, JSON.stringify(data, null, ' '), fsOptions);
        //        db.close();
        // });
        callback();
      },






      // number the narrative links
      function (callback) {
        if (consoleLog) {
          console.log('\n ', __filename, __line, '; function #:', ++functionCount);
        }
          var counter = 0;
          narrativeLinks.forEach(function (narrativeLink) {
            narrativeLink.linkNumber = counter;
            counter++;
          });
        callback();
      },

      function (callback) {
        if (consoleLog) {
          console.log('\n ', __filename, __line, '; function 3#:', ++functionCount);
        }
//        var narrativeLinksStringified = JSON.stringify(narrativeLinks, null, ' ');
        writeMyFile(narrativeLinksLocalFileNameAndPath, JSON.stringify(narrativeLinks, null, ' '), fsOptions);
        // console.log('\n ', __filename, __line, '; saved file: ', narrativeLinksLocalFileNameAndPath);
        callback(null, JSON.stringify(narrativeLinks, null, ' '));
      }
    ],

    function (err, results) { //This function gets called after the foregoing tasks have called their 'task callbacks'
      if (err) {
        console.log('\n ', __filename, 'line: ', __line, ' Error: ', err);
      } else {
        console.log('\n ', __filename, 'line: ', __line, '; function:', ++functionCount, 'results.length = ', results.length, '; results.toString().substring(0,', narrListSubstringLength, ') = ', results.toString().substring(0, narrListSubstringLength), '[FILE LOG OUTPUT INTENTIONALLY TRUNCATED]');
      }
    });
};

// collect a named file from an Internet host and save it locally; specify indivOrEntityString equals a string either 'entity' or 'indiv'
// save to json file: narrativeLinksLocalFileNameAndPath
var asyncGetRawHtmlPagesWithNarrativeLinks = function (host, filePath, outputFileNameAndPath, indivOrEntityString) {
  // var host = 'www.un.org';
  var getPath = 'http://' + host + filePath;
  var res;
  console.log('\n ', __filename, 'line: ', __line, '; getPath = ', getPath);
  try {
    res = request('GET', getPath);
    // console.log('\n ', __filename, 'line: ', __line, '; res.body.toString() = ', res.body.toString());
  } catch (err) {
    console.log('\n ', __filename, 'line', __line, '; Error: ', err, '; reading stored backup file');
  }
  var responseBody = res.body.toString();
  var handler = new htmlparser.DefaultHandler(function (err, dom) {
    if (err) {
      console.log('\n ', __filename, 'line', __line, 'Error: ' + err);
      //       sys.debug('Error: ' + err);
    } else {
      // soupselect happening here...
      // var titles = select(dom, 'a.title');
      rows = select(dom, 'table tr');
      var rowNum;
      // sys.puts('Links from narrative list page');
      // loop through each table row
      var narrLink;
      for (var i = 0; i < rows.length; i++) {
        // skip the header row
        if (i === 0) {
          continue;
        }
        rowNum = i;
        row = rows[i];
        // sys.puts('row[' + i + '] = ' + sys.inspect(JSON.stringify(row)));
        narrLink = {};
        tds = select(row, 'td');
        // loop through each td/column in the row
        for (var j = 0; j < tds.length; j++) {
          td = tds[j];
          // get the id from the first td
          if (j === 0) {
            paragraph = select(td, 'p');
            if (typeof paragraph !== 'undefined') {
              try {
                if (typeof paragraph[0] !== 'undefined') {
                  narrLink.id = getCleanId(paragraph[0].children[0].data);
                }
              } catch (err) {
                console.log('\n ', __filename, 'line', __line, ' Error parsing id: ', err);
              }
            }
          }
          // if we are in the second td in the row...
          else if (j === 1) {
            paragraph = select(td, 'p');
            anchor = select(td, 'a');

            if (typeof paragraph !== 'undefined' && typeof paragraph[0] !== 'undefined') {
              //console.log('\n ', __filename, 'line', __line, 'paragraph = ', JSON.stringify(paragraph));
              if (typeof paragraph[0].children[0].attribs !== 'undefined') {
                try {
                  narrativeFileName = paragraph[0].children[0].attribs.href;
                  narrativeFileName = normalizeNarrativeFileName(narrativeFileName); //.replace(/\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
                  // narrativeFileName = narrativeFileName.replace(/http:\/\/dev.un.org\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
                  // http://dev.un.org/sc/committees/1267/
                  narrLink.narrativeFileName = narrativeFileName;
                } catch (err) {
                  console.log('\n ', __filename, 'line', __line, '; paragraph[0].children[0] = ', paragraph[0].children[0]);
                  console.log('\n ', __filename, 'line', __line, '; Error: paragraph[0].children[0].attribs is undefined; tr = ', i, '; td = ', j, err);
                }
              } else if (typeof anchor[0].attribs.href !== 'undefined') {
                narrLink.narrativeFileName = normalizeNarrativeFileName(narrativeFileName);
                narrLink.targetName = JSON.stringify(anchor[0].children[0].data);
              } else {
                narrLink.narrativeFileName = 'PLACEHOLDER0';
                console.log('\n ', __filename, 'line', __line, '; Error: narrativeFileName for tr = ', i, '; td = ', j, 'is PLACEHOLDER0');
              }
              // if anchor inside of paragraph
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
                narrLink.targetName = 'PLACEHOLDER2';
              } else {
                narrLink.targetName = targetName;
              }
              // end of if (typeof paragraph !== 'undefined' && typeof paragraph[0] !== 'undefined')
            } else if (typeof anchor[0].attribs.href !== 'undefined' && anchor[0].attribs.href !== '') {
              narrativeFileName = normalizeNarrativeFileName(anchor[0].attribs.href);
              narrLink.narrativeFileName = narrativeFileName;
              if (typeof anchor[0].children[0] !== 'undefined' && anchor[0].children[0].data !== '') {
                targetName = anchor[0].children[0].data;
                narrLink.targetName = targetName;
              }
            }
          }
        }
        narrLink.entityOrIndiv = indivOrEntityString;
        narrLink.rowNum = i;
        if (indivOrEntityString == 'indiv') {
          indivLinks.push(narrLink);
        }
        if (indivOrEntityString == 'entity') {
          entLinks.push(narrLink);
        }
        narrativeLinks.push(narrLink);
      }
    }
  });
  var parser = new htmlparser.Parser(handler);
  parser.parseComplete(responseBody);
  if (indivOrEntityString == 'indiv') {
    writeMyFile(individualsLocalOutputFileNameAndPath, JSON.stringify(indivLinks, null, ' '), fsOptions);
  }
  if (indivOrEntityString == 'entity') {
    writeMyFile(entitiesLocalOutputFileNameAndPath, JSON.stringify(entLinks, null, ' '), fsOptions);
  }
  writeMyFile(narrativeLinksLocalFileNameAndPath, JSON.stringify(narrativeLinks, null, ' '), fsOptions);
};


var countUndefinedNarrativeFileNames = function (nodes) {
  var nullCount = 0;
  var undefinedCount = 0;
  var node;
  for (var ldi = 0; ldi < nodes.length; ldi++) {
    node = nodes[ldi];
    if (typeof(node.narrativeFileName) === 'null') {
      nullCount++;
      continue;
    }
    if (typeof(node.narrativeFileName) === 'undefined') {
      undefinedCount++;
    }
  }
  console.log('\n\n ', __filename, 'line: ', __line, '; nullCount = ', nullCount, '; undefinedCount = ', undefinedCount, '; nodes.length = ', nodes.length, '\n\n');
};

/*
// collect one of two named list files from an Internet host and save it locally; specify indivOrEntityString equals a string either 'entity' or 'indiv'
// save to json file: narrativeLinksLocalFileNameAndPath
var getRawHtmlPagesWithNarrativeLinks = function (host, filePath, outputFileNameAndPath, indivOrEntityString) {
  var client = http.createClient(80, host);
  var requestAsync = client.request('GET', filePath, {'host': host});
  requestAsync.on('response', function (response) {
    response.setEncoding('utf8');
    var body = '';
    response.on('data', function (chunk) {
      body = body + chunk;
    });
    response.on('end', function () {
      // now we have the whole body, parse it and select the nodes we want...
      var handler = new htmlparser.DefaultHandler(function (err, dom) {
        if (err) {
          console.log('\n ', __filename, 'line', __line, 'Error: ' + err);
          // sys.debug('Error: ' + err);
        } else {
          // soupselect happening here...
          // var titles = select(dom, 'a.title');
          rows = select(dom, 'table tr');
          var rowNum;
          // loop through each table row
          for (var i = 0; i < rows.length; i++) {
            // skip the header row
            if (i === 0) {
              continue;
            }
            rowNum = i;
            row = rows[i];
            // sys.puts('row[' + i + '] = ' + sys.inspect(JSON.stringify(row)));
            narrLink = {};
            tds = select(row, 'td');
            // loop through each td/column in the row
            for (var j = 0; j < tds.length; j++) {
              td = tds[j];
              // get the id from the first td
              if (j === 0) {
                paragraph = select(td, 'p');
                if (typeof paragraph !== 'undefined') {
                  try {
                    if (typeof paragraph[0] !== 'undefined') {
                      narrLink.id = getCleanId(paragraph[0].children[0].data);
                    }
                  } catch (err) {
                    console.log('\n ', __filename, 'line', __line, ' Error parsing id: ', err);
                  }
                }
              }
              // if we are in the second td in the row...
              else if (j === 1) {
                paragraph = select(td, 'p');
                anchor = select(td, 'a');
                if (typeof paragraph !== 'undefined' && typeof paragraph[0] !== 'undefined') {
                  //console.log('\n ', __filename, 'line', __line, 'paragraph = ', JSON.stringify(paragraph));
                  if (typeof paragraph[0].children[0].attribs !== 'undefined') {
                    try {
                      narrativeFileName = paragraph[0].children[0].attribs.href;
                      narrativeFileName = normalizeNarrativeFileName(narrativeFileName); //.replace(/\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
                      // narrativeFileName = narrativeFileName.replace(/http:\/\/dev.un.org\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
                      // http://dev.un.org/sc/committees/1267/
                      narrLink.narrativeFileName = narrativeFileName;
                    } catch (err) {
                      console.log('\n ', __filename, 'line', __line, '; paragraph[0].children[0] = ', paragraph[0].children[0]);
                      console.log('\n ', __filename, 'line', __line, '; Error: paragraph[0].children[0].attribs is undefined; tr = ', i, '; td = ', j, err);
                    }
                  } else if (typeof anchor[0].attribs.href !== 'undefined') {
                    narrLink.narrativeFileName = normalizeNarrativeFileName(narrativeFileName);
                    narrLink.targetName = JSON.stringify(anchor[0].children[0].data);
                  } else {
                    narrLink.narrativeFileName = 'PLACEHOLDER0';
                    console.log('\n ', __filename, 'line', __line, '; Error: narrativeFileName for tr = ', i, '; td = ', j, 'is PLACEHOLDER0');
                  }
                  // if anchor inside of paragraph
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
                    narrLink.targetName = 'PLACEHOLDER2';
                  } else {
                    narrLink.targetName = targetName;
                  }
                  // end of if (typeof paragraph !== 'undefined' && typeof paragraph[0] !== 'undefined')
                } else if (typeof anchor[0].attribs.href !== 'undefined' && anchor[0].attribs.href !== '') {
                  narrativeFileName = normalizeNarrativeFileName(anchor[0].attribs.href);
                  narrLink.narrativeFileName = narrativeFileName;
                  if (typeof anchor[0].children[0] !== 'undefined' && anchor[0].children[0].data !== '') {
                    targetName = anchor[0].children[0].data;
                    narrLink.targetName = targetName;
                  }
                }
              }
            }
            narrLink.entityOrIndiv = indivOrEntityString;
            narrLink.rowNum = i;
            if (indivOrEntityString == 'indiv') {
              indivLinks.push(narrLink);
            }
            if (indivOrEntityString == 'entity') {
              entLinks.push(narrLink);
            }
            narrativeLinks.push(narrLink);
          }
        }
      });

      var parser = new htmlparser.Parser(handler);
      parser.parseComplete(body);
      if (indivOrEntityString == 'indiv') {
        // var jsonIndivNarrList = JSON.stringify(indivLinks, null, ' ');
        writeMyFile(individualsLocalOutputFileNameAndPath, JSON.stringify(indivLinks, null, ' '), fsOptions);
      }
      if (indivOrEntityString == 'entity') {
        // entLinks.push(narrLink);
        // var jsonEntNarrList = JSON.stringify(entLinks, null, ' ');
        writeMyFile(entitiesLocalOutputFileNameAndPath, JSON.stringify(entLinks, null, ' '), fsOptions);
      }
      // narrativeLinks.push(narrLink);

//      var jsonNarrList = JSON.stringify(narrativeLinks, null, ' ');
      // sys.puts(JSON.stringify(narrativeLinks, null, ' '));
      writeMyFile(narrativeLinksLocalFileNameAndPath, JSON.stringify(narrativeLinks, null, ' '), fsOptions);

    });
  });
  requestAsync.end();
  // return narrativeLinks;
};

*/



function forceUnicodeEncoding(string) {
  return unescape(encodeURIComponent(string));
}

function trimNarrative(narrWebPageString) {

  var narrative1 = narrWebPageString.replace(/([\r\n\t])/gm, ' ');
  var narrative2 = narrative1.replace(/(\s{2,})/gm, ' ');
  var narrative = narrative2.replace(/<!DOCTYPE HTML PUBLIC.*MAIN CONTENT BEGINS(.*?)TemplateEndEditable.*<\/html>/mi, '$1');
  return narrative;
}

var normalizeNarrativeFileName = function (narrativeFileNameString) {
  // console.log('\n ', __filename, __line, '; narrativeFileNameString = ', narrativeFileNameString);
  var narrativeFileName1 = narrativeFileNameString.replace(/http:\/\/dev.un.org\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
  // var narrativeFileName1 = narrativeFileNameString.replace(/http:\/\/dev.un.org(\/sc\/committees\/1267\/NSQ.*\.shtml)/, '$1');
  // console.log('\n ', __filename, __line, '; narrativeFileName1 = ', narrativeFileName1);
  var narrativeFileName2 = narrativeFileName1.replace(/\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
  return narrativeFileName2;
};

var getCleanId = function (referenceNumber) {
  var refNumRegexMatch;
  try {
    refNumRegexMatch = referenceNumber.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
  } catch (err) {
    console.log('\n ', __filename, 'line', __line, '; Error: ', err);
  }
  return refNumRegexMatch[0].trim();
};

var writeMyFile = function (localFileNameAndPath, data, fsOptions) {
  try {
    fse.writeFileSync(localFileNameAndPath, data, fsOptions);
  } catch (err) {
    console.log('\n ', __filename, 'line', __line, ' Error: ', err);
  }
};

module.exports = {
  getListOfNarratives: getListOfNarratives
};
