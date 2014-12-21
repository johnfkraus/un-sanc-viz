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
  getNarrativeListPages,
  host,
  narrativeFileName,
  narrativeLink,
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
// fetch some HTML...

var runApp = function () {
  host = 'www.un.org';
//  if (consoleLog) { console.log("\n ", __filename, __line, ", runApp\n");
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, "; running soupselectAq.js; ", new Date());
  }

  async.series([
      function (callback) {
        // collect raw data
        if (consoleLog) {
          console.log("\n ", __filename, __line, "; function 1#:", ++functionCount);
        }
        narrativeLinks = [];
        outputFileNameAndPath = (__dirname + "/../data/narrative_summaries/individuals_associated_with_Al-Qaida.json");
        narrativeLinks = getData(narrativeLinks, host, '/sc/committees/1267/individuals_associated_with_Al-Qaida.shtml', outputFileNameAndPath);
        callback();
      },
      function (callback) {
        // put data in arrays for d3
        if (consoleLog) {
          console.log("\n ", __filename, __line, "; function 2#:", ++functionCount);
        }
        outputFileNameAndPath = (__dirname + "/../data/narrative_summaries/entities_other_groups_undertakings_associated_with_Al-Qaida.json");
        narrativeLinks = getData(narrativeLinks, host, '/sc/committees/1267/entities_other_groups_undertakings_associated_with_Al-Qaida.shtml', outputFileNameAndPath);
        callback();
      },
      function (callback) {
        // put data in arrays for d3
        if (consoleLog) {
          console.log("\n ", __filename, __line, "; function 3#:", ++functionCount);
        }
        sys.puts("JSON.stringify(narrativeLinks, null, \'\') = " + JSON.stringify(narrativeLinks, null, " "));
        callback();
      }

    ],
    function (err) { //This function gets called after the two tasks have called their "task callbacks"
      if (err) console.log("\n app.js 32 Err: ", err);
    });
};

var getData = function (narrativeLinks, host, filePath, outputFileNameAndPath) {
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
                    // console.log("\n ", __filename, "line", __line, "paragraph = ", JSON.stringify(paragraph));
                    try {
                      if (typeof paragraph[0] !== 'undefined') {
                        // console.log("\n ", __filename, "line", __line, "; paragraph[0] = " + JSON.stringify(paragraph[0]));
                        // console.log("\n ", __filename, "line", __line, "; paragraph[0].children[0] = " + JSON.stringify(paragraph[0].children[0]));
                        // console.log("\n ", __filename, "line", __line, "; paragraph[0].children[0].data = " + JSON.stringify(paragraph[0].children[0].data));
                        //  sys.puts("paragraph[0] = " + JSON.stringify(paragraph[0]));
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
                        narrativeFileName = narrativeFileName.replace(/\/sc\/committees\/1267\/(NSQI.*\.shtml)/, '$1');
                        narrLink.narrativeFileName = narrativeFileName;
                      } catch (err) {
                        console.log("\n ", __filename, "line", __line, "; paragraph[0].children[0] = ", paragraph[0].children[0]);
                        console.log("\n ", __filename, "line", __line, "; Error: paragraph[0].children[0].attribs is undefined; tr = ", i, "; td = ", j, err);
                      }
                    } else {
                      if (typeof anchor[0].attribs.href !== 'undefined') {
                        narrLink.narrativeFileName = narrativeFileName;
                        narrLink.targetName = JSON.stringify(anchor[0].children[0].data);
                      }
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
                      narrLink.targetName = targetName; //anchor[0].children[0].data;
                    }
                    // end of if (typeof paragraph !== 'undefined' && typeof paragraph[0] !== 'undefined')
                  } else if (typeof anchor[0].attribs.href !== 'undefined' && anchor[0].attribs.href !== "") {
                    narrativeFileName = anchor[0].attribs.href;
                    narrLink.narrativeFileName = narrativeFileName;
                    if (typeof anchor[0].children[0] !== 'undefined' && anchor[0].children[0].data !== "") {
                      targetName = anchor[0].children[0].data;
                      narrLink.targetName = targetName;

                    }
                  }

                }
              }
              narrLink.rowNum = i;
              narrativeLinks.push(narrLink);
            }
          }
        }
      );

      var parser = new htmlparser.Parser(handler);
      parser.parseComplete(body);
      var jsonIndivNarrList = JSON.stringify(narrativeLinks, null, " ");
      //sys.puts(JSON.stringify(narrativeLinks, null, " "));
      // var outputFileNameAndPath = (__dirname + "/../data/narrative_summaries/individuals_associated_with_Al-Qaida.json");
      // console.log("outputFileNameAndPath = ", outputFileNameAndPath);
      // var jsonData2 = sys.inspect(handler.dom, false, null);
      writeMyFile(outputFileNameAndPath, jsonIndivNarrList, fsOptions);
    });
  });
  request.end();
  return narrativeLinks;
};
/*
 getNarrativeListPages = function (host, filePath) {
 var parser;
 //  host = 'www.un.org';
 var client = http.createClient(80, host);
 //   var url = ['/sc/committees/1267/individuals_associated_with_Al-Qaida.shtml', '/sc/committees/1267/entities_other_groups_undertakings_associated_with_Al-Qaida.shtml'];

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
 // sys.puts("Links from narrative list page");
 // loop through each table row
 for (var i = 0; i < rows.length; i++) {
 // skip the header row
 if (i === 0) {
 continue;
 }
 row = rows[i];
 sys.puts("row[" + i + "] = " + sys.inspect(JSON.stringify(row)));
 narrativeLink = {};
 tds = select(row, 'td');
 // loop through each td in the row
 for (var j = 0; j < tds.length; j++) {
 td = tds[j];
 // get the id from the first td
 if (j === 0) {
 paragraph = select(td, 'p');
 if (typeof paragraph !== 'undefined') {
 // console.log("\n ", __filename, "line", __line, "paragraph = ", JSON.stringify(paragraph));
 try {
 if (typeof paragraph[0] !== 'undefined') {
 // console.log("\n ", __filename, "line", __line, "; paragraph[0] = " + JSON.stringify(paragraph[0]));
 // console.log("\n ", __filename, "line", __line, "; paragraph[0].children[0] = " + JSON.stringify(paragraph[0].children[0]));
 // console.log("\n ", __filename, "line", __line, "; paragraph[0].children[0].data = " + JSON.stringify(paragraph[0].children[0].data));
 //  sys.puts("paragraph[0] = " + JSON.stringify(paragraph[0]));
 narrativeLink.id = getCleanId(paragraph[0].children[0].data);
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
 if (typeof paragraph !== 'undefined') {
 //console.log("\n ", __filename, "line", __line, "paragraph = ", JSON.stringify(paragraph));
 // try {
 if (typeof paragraph[0] !== 'undefined') {
 // console.log("\n ", __filename, "line", __line, "; anchor = " + JSON.stringify(anchor));
 //                    console.log("\n ", __filename, "line", __line, "; paragraph[0].children[0] = " + JSON.stringify(paragraph[0].children[0]));
 //                    console.log("\n ", __filename, "line", __line, "; paragraph[0].children[0].data = " + JSON.stringify(paragraph[0].children[0].data));
 //  sys.puts("paragraph[0] = " + JSON.stringify(paragraph[0]));
 if (typeof paragraph[0].children[0].attribs !== 'undefined') {
 try {
 narrativeFileName = paragraph[0].children[0].attribs.href;
 narrativeFileName = narrativeFileName.replace(/\/sc\/committees\/1267\/(NSQI.*\.shtml)/, '$1');
 narrativeLink.narrativeFileName = narrativeFileName;
 } catch (err) {
 console.log("\n ", __filename, "line", __line, "; paragraph[0].children[0] = ", paragraph[0].children[0]);
 console.log("\n ", __filename, "line", __line, "; Error: paragraph[0].children[0].attribs is undefined; tr = ", i, "; td = ", j, err);
 }
 } else {
 narrativeLink.narrativeFileName = "PLACEHOLDER";
 console.log("\n ", __filename, "line", __line, "; Error: narrativeFileName for tr = ", i, "; td = ", j, "is PLACEHOLDER");
 }
 if (anchor[0].children[0].data !== "u") {
 targetName = anchor[0].children[0].data;
 // console.log("targetName = ", targetName);
 } else if (anchor[0].children[0].data === "u") {

 underscore = select(td, 'u');
 // console.log("underscore = ", JSON.stringify(underscore[0].children[0].data)); // anchor[0].children[0].data );
 targetName = JSON.stringify(underscore[0].children[0].data);
 // console.log("Error: anchor[0].children[0].data  = ", anchor[0].children[0].data );
 // targetName = "Error!";
 } else {
 targetName = "PLACEHOLDER";
 }
 targetName = targetName.replace(/[\n\f\r\t]/gm, "");
 targetName = targetName.replace(/\s\s+/gm, " ");
 targetName = targetName.trim();

 if (targetName === "") {
 narrativeLink.targetName = "PLACEHOLDER";
 } else {
 narrativeLink.targetName = targetName; //anchor[0].children[0].data;
 }
 }
 }
 }
 }
 narrativeLink.rowNum = i;
 narrativeLinks.push(narrativeLink);
 }
 }
 }
 );
 });
 //parser = new htmlparser.Parser(handler);
 //parser.parseComplete(body);
 var jsonIndivNarrList = JSON.stringify(narrativeLinks, null, " ");
 sys.puts(JSON.stringify(narrativeLinks, null, " "));
 var outputFileNameAndPath = (__dirname + "/../data/narrative_summaries/individuals_associated_with_Al-Qaida.json");
 // console.log("outputFileNameAndPath = ", outputFileNameAndPath);
 // var jsonData2 = sys.inspect(handler.dom, false, null);
 writeMyFile(outputFileNameAndPath, jsonIndivNarrList, fsOptions);
 });
 request.end();
 };
 */
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
    if (consoleLog) {
      // console.log("\n ", __filename, "line", __line, " file written to: ", localFileNameAndPath);
    }
  } catch (err) {
    console.log('\n ', __filename, "line", __line, ' Error: ', err);
  }

};

runApp();
