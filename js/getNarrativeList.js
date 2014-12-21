// soupselectAq.js
// get the narrative names and links

var select = require('soupselect').select,
  htmlparser = require("htmlparser"),
  http = require('http'),
  sys = require('sys'),
  async = require('async');

var consoleLog = true;
var fse = require('fs-extra');
var util = require('util');
var linenums = require('./linenums.js');
var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};
var targetName = "";
var anchor,
  host,
  narrativeFileName,
  narrativeLinks,
  outputFileNameAndPath,
  paragraph,
  rows,
  row,
  td,
  tds,
  underscore,
  url;
var functionCount = 0;
narrativeLinks = [];
// fetch some HTML...

var runApp = function () {
  host = 'www.un.org';
//  if (consoleLog) { console.log("\n ", __filename, __line, ", runApp\n");
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, "; running getNarrativeList.js; ", new Date());
  }

  async.series([
      function (callback) {
        // collect individuals list of links to narratives - raw data
        if (consoleLog) {
          console.log("\n ", __filename, __line, "; function 1#:", ++functionCount);
        }
//        narrativeLinks = [];
        outputFileNameAndPath = (__dirname + "/../data/narrative_summaries/individuals_associated_with_Al-Qaida.json");
        var indivOrEntityString = "indiv";
        getData(host, '/sc/committees/1267/individuals_associated_with_Al-Qaida.shtml', outputFileNameAndPath, indivOrEntityString);
        callback();
      },
      function (callback) {
        // collect entities list of links to narratives - raw data
        if (consoleLog) {
          console.log("\n ", __filename, __line, "; function 2#:", ++functionCount);
        }
        var indivOrEntityString = "entity";
        outputFileNameAndPath = (__dirname + "/../data/narrative_summaries/entities_other_groups_undertakings_associated_with_Al-Qaida.json");
        getData(host, '/sc/committees/1267/entities_other_groups_undertakings_associated_with_Al-Qaida.shtml', outputFileNameAndPath, indivOrEntityString);
        callback();
      },
      function (callback) {
        // combine indivs and ents into one file
        if (consoleLog) {
          console.log("\n ", __filename, __line, "; function 3#:", ++functionCount);
        }
        var indivs = require(__dirname + "/../data/narrative_summaries/individuals_associated_with_Al-Qaida.json");
        var ents = require(__dirname + "/../data/narrative_summaries/entities_other_groups_undertakings_associated_with_Al-Qaida.json");
        var narrative_links = indivs.concat(ents);
        outputFileNameAndPath = (__dirname + "/../data/narrative_summaries/narrative_links.json");
        var dataStringified = JSON.stringify(narrative_links, null, " ");
        writeMyFile(outputFileNameAndPath, dataStringified, fsOptions);
        callback(null, dataStringified );
      },
      function (callback) {
        // put data in arrays for d3
        //  var indivs = require(__dirname + "/../data/narrative_summaries/individuals_associated_with_Al-Qaida.json");
        // var ents = require(__dirname + "/../data/narrative_summaries/entities_other_groups_undertakings_associated_with_Al-Qaida.json");
//        if (consoleLog) {
          //  console.log("\n ", __filename, __line, "; function #:", ++functionCount, indivs, ents);
 //       }
        // sys.puts("JSON.stringify(narrativeLinks, null, \'\') = " + JSON.stringify(narrativeLinks, null, " "));
        //outputFileNameAndPath = (__dirname + "/../data/narrative_summaries/narrative_links.json");
        //writeMyFile(outputFileNameAndPath, narrativeLinks, fsOptions);
        callback();
      }
    ],
    function (err, results) { //This function gets called after the foregoing tasks have called their "task callbacks"
      if (err) {
        console.log("\n ", __filename, "line: ", __line, "Error: ", err);
      } else {
        console.log("\n ", __filename, "line: ", __line, "; function:", ++functionCount, "results.length = ", results.length);
      }
    });
};

var getData = function (host, filePath, outputFileNameAndPath, entityOrIndivString) {
  // var host = 'www.un.org';
  var client = http.createClient(80, host);
  var request = client.request('GET', filePath, {'host': host});

  request.on('response', function (response) {
    response.setEncoding('utf8');

    var body = "";
    response.on('data', function (chunk) {
      body = body + chunk;
    });

    response.on('end', function () {

      // now we have the whole body, parse it and select the nodes we want...
      var handler = new htmlparser.DefaultHandler(function (err, dom) {
        if (err) {
          console.log("\n ", __filename, "line", __line, "Error: " + err);
          //       sys.debug("Error: " + err);
        } else {

          // soupselect happening here...
          // var titles = select(dom, 'a.title');
          rows = select(dom, 'table tr');
          var rownum;
          // sys.puts("Links from narrative list page");
          // loop through each table row
          for (var i = 0; i < rows.length; i++) {
            // skip the header row
            if (i === 0) {
              continue;
            }
            rownum = i;
            row = rows[i];
            // sys.puts("row[" + i + "] = " + sys.inspect(JSON.stringify(row)));
            narrLink = {};
            tds = select(row, 'td');
            // loop through each td in the row
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
                    console.log("\n ", __filename, "line", __line, " Error parsing id: ", err);
                  }
                }
              }
              // if we are in the second td in the row...
              else if (j === 1) {
                paragraph = select(td, 'p');
                anchor = select(td, 'a');

                if (typeof paragraph !== 'undefined' && typeof paragraph[0] !== 'undefined') {
                  //console.log("\n ", __filename, "line", __line, "paragraph = ", JSON.stringify(paragraph));
                  if (typeof paragraph[0].children[0].attribs !== 'undefined') {
                    try {
                      narrativeFileName = paragraph[0].children[0].attribs.href;
                      narrativeFileName = normalizeNarrativeFileName(narrativeFileName); //.replace(/\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
                      // narrativeFileName = narrativeFileName.replace(/http:\/\/dev.un.org\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
                      // http://dev.un.org/sc/committees/1267/
                      narrLink.narrativeFileName = narrativeFileName;
                    } catch (err) {
                      console.log("\n ", __filename, "line", __line, "; paragraph[0].children[0] = ", paragraph[0].children[0]);
                      console.log("\n ", __filename, "line", __line, "; Error: paragraph[0].children[0].attribs is undefined; tr = ", i, "; td = ", j, err);
                    }
                  } else if (typeof anchor[0].attribs.href !== 'undefined') {
                    narrLink.narrativeFileName = normalizeNarrativeFileName(narrativeFileName);
                    narrLink.targetName = JSON.stringify(anchor[0].children[0].data);
                  } else {
                    narrLink.narrativeFileName = "PLACEHOLDER0";
                    console.log("\n ", __filename, "line", __line, "; Error: narrativeFileName for tr = ", i, "; td = ", j, "is PLACEHOLDER0");
                  }
                  // if anchor inside of paragraph
                  if (anchor[0].children[0].data !== "u") {
                    targetName = anchor[0].children[0].data;
                  } else if (anchor[0].children[0].data === "u") {
                    underscore = select(td, 'u');
                    targetName = JSON.stringify(underscore[0].children[0].data);
                  } else {
                    targetName = "PLACEHOLDER1";
                  }
                  targetName = targetName.replace(/[\n\f\r\t]/gm, "");
                  targetName = targetName.replace(/\s\s+/gm, " ");
                  targetName = targetName.trim();
                  if (targetName === "") {
                    narrLink.targetName = "PLACEHOLDER2";
                  } else {
                    narrLink.targetName = targetName;
                  }
                  // end of if (typeof paragraph !== 'undefined' && typeof paragraph[0] !== 'undefined')
                } else if (typeof anchor[0].attribs.href !== 'undefined' && anchor[0].attribs.href !== "") {
                  narrativeFileName = normalizeNarrativeFileName(anchor[0].attribs.href);
                  narrLink.narrativeFileName = narrativeFileName;
                  if (typeof anchor[0].children[0] !== 'undefined' && anchor[0].children[0].data !== "") {
                    targetName = anchor[0].children[0].data;
                    narrLink.targetName = targetName;
                  }
                }
              }
            }
            narrLink[entityOrIndivString + "RowNum"] = i;
            narrativeLinks.push(narrLink);
          }
        }
      });

      var parser = new htmlparser.Parser(handler);
      parser.parseComplete(body);
      var jsonNarrList = JSON.stringify(narrativeLinks, null, " ");
      // sys.puts(JSON.stringify(narrativeLinks, null, " "));
      writeMyFile(outputFileNameAndPath, jsonNarrList, fsOptions);
    });
  });
  request.end();
  return narrativeLinks;
};

var normalizeNarrativeFileName = function (narrativeFileNameString) {
  // console.log("\n ", __filename, __line, "; narrativeFileNameString = ", narrativeFileNameString);
  var narrativeFileName1 = narrativeFileNameString.replace(/http:\/\/dev.un.org\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
  // var narrativeFileName1 = narrativeFileNameString.replace(/http:\/\/dev.un.org(\/sc\/committees\/1267\/NSQ.*\.shtml)/, '$1');
  // console.log("\n ", __filename, __line, "; narrativeFileName1 = ", narrativeFileName1);
  var narrativeFileName2 = narrativeFileName1.replace(/\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
  return narrativeFileName2;
};

var getCleanId = function (referenceNumber) {
  var refNumRegexMatch;
  try {
    refNumRegexMatch = referenceNumber.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
  } catch (err) {
    console.log("\n ", __filename, "line", __line, "; Error: ", err);
  }
  return refNumRegexMatch[0].trim();
};

var writeMyFile = function (localFileNameAndPath, data, fsOptions) {
  try {
    fse.writeFileSync(localFileNameAndPath, data, fsOptions);
  } catch (err) {
    console.log('\n ', __filename, "line", __line, ' Error: ', err);
  }
};

runApp();
