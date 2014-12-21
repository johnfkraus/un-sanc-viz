// soupselectAq.js
// get the narrative names and links

var select = require('soupselect').select,
  htmlparser = require("htmlparser"),
  http = require('http'),
  sys = require('sys');
var narrLinks = [];
var consoleLog = true;
var fse = require('fs-extra');
var util = require('util');
var linenums = require('./linenums.js');
var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};

var narrLink;
var targetName = "";
var anchor;
var narrativeLink, paragraph, rows, row, td, tds;
var fileName;
// fetch some HTML...
var http = require('http');

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

var host = 'www.un.org';
var client = http.createClient(80, host);
var request = client.request('GET', '/sc/committees/1267/individuals_associated_with_Al-Qaida.shtml', {'host': host});

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

          sys.puts("Links from narrative list page");
          // loop through each table row
          for (var i = 0; i < rows.length; i++) {
            // skip the header row
            if (i === 0) {
              continue;
            }
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

                        narrLink.narrativeFileName = narrativeFileName;
                      } catch (err) {
                        console.log("\n ", __filename, "line", __line, "; paragraph[0].children[0] = ", paragraph[0].children[0]);
                        console.log("\n ", __filename, "line", __line, "; Error: paragraph[0].children[0].attribs is undefined; tr = ", i, "; td = ", j, err);
                      }
                    } else {
                      narrLink.narrativeFileName = "PLACEHOLDER";
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
                      narrLink.targetName = "PLACEHOLDER";
                    } else {
                      narrLink.targetName = targetName; //anchor[0].children[0].data;
                    }
                  }
                }
              }
            }
            narrLink.rowNum = i;
            narrLinks.push(narrLink);
          }
        }
      }
    );

    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(body);
    var jsonIndivNarrList = JSON.stringify(narrLinks, null, " ");
    sys.puts(JSON.stringify(narrLinks, null, " "));
    var outputFileNameAndPath = (__dirname + "/../data/narrative_summaries/individuals_associated_with_Al-Qaida.json");
    // console.log("outputFileNameAndPath = ", outputFileNameAndPath);
    var jsonData2 = sys.inspect(handler.dom, false, null);
    writeMyFile(outputFileNameAndPath, jsonIndivNarrList, fsOptions);
  });
});
request.end();


var getCleanId = function (referenceNumber) {
  var refNumRegexMatch;
  try {
    refNumRegexMatch = referenceNumber.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
  } catch (error) {
    console.log("\n ", __filename, "line", __line, "; Error: ", error, "; node =", node, "; counter = ", counter);
  }
  return refNumRegexMatch[0].trim();
};
