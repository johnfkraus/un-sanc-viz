// collect.js
// collect AQList.xml from Internet, convert to json
// =========================

if (typeof define !== 'function') {
  var define = require('amdefine');
}
var async = require('async'),
  re = require('request-enhanced'),
  fse = require('fs-extra'),
  util = require('util'),
  dateFormat = require('dateformat'),
  host = 'www.un.org',
  inspect = require('object-inspect'),
  trunc = require('./trunc.js'),
  request = require('sync-request'),
  truncateToNumChars = 400,
  narrCounter,
  narrative_doc,
  myJsonData,
  parseString = require('xml2js')
    .parseString;
var linenums = require('./linenums.js');
var consoleLog = false;
var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};
String.prototype.trunc = String.prototype.trunc ||
function (n) {
  return this.length > n ? this.substr(0, n - 1) + '&hellip,' : this;
};
require('console-stamp')(console, '[HH:MM:ss.l]');
var now = new Date();
dateFormat.masks.friendly_detailed = "dddd, mmmm dS, yyyy, h:MM:ss TT";
dateFormat.masks.friendly_display = "dddd, mmmm dS, yyyy";
dateFormat.masks.file_generated_date = "yyyy-mm-dd";
dateFormat.masks.common = "mm-dd-yyyy";
// Basic usage
// dateFormat.masks.hammerTime = 'yyyy-mm-dd-HHMMss';
// var displayDateString = dateFormat(now, "friendly_display");
// Saturday, June 9th, 2007, 5:46:21 PM
// var fileDateString = dateFormat(now, "hammerTime");
var urls, filePaths;

var getTheNarratives = function () {
  var functionCount = 0;
  var myResult;
  var narratives;
  async.series([
      function (callback) {
        // create an array of full urls pointing to the narratives
        var narrative_links = require(__dirname + "/../data/narrative_summaries/narrative_links.json");
        urls = [];
        filePaths = [];
        var url;
        var filePath;
        narrative_links.forEach(function (link_data_item) {
          url = "http://www.un.org/sc/committees/1267/" + link_data_item.narrativeFileName;
          urls.push(url);
          filePath = "/sc/committees/1267/" + link_data_item.narrativeFileName;
          filePaths.push(filePath);
          //  console.log("\n ", __filename, "line", __line, "urls = ", urls);
        });
        callback();
      },
      // collect each narrative
      function (callback) {
        narratives = [];
        var BreakException = {};
        narrCounter = 0;
//        for (var url = 0; url < 10; url++) {
        for (var fp = 0; fp < 10; fp++) {
//        urls.forEach(function (url) {
          // url = urls[url];
          filePath = filePaths[fp];
          // console.log("\n ", __filename, "line", __line, "narratives = ", narratives);

          var getFileNameAndPath = filePath.replace(/\/sc\/committees\/1267\/(NSQE00101E.shtml)/, '$1');
          try {
            narrCounter++;
            getNarrativesData(host, getFileNameAndPath, outputFileNameAndPath);
//            var res = request('GET', url);
            narrative_doc = res.body.toString();
          } catch (err) {
            console.log("\n ", __filename, "line", __line, "; Error: ", err);
          }
          var fileName = filePath.replace(/\/sc\/committees\/1267\/(NSQE00101E.shtml)/, '$1');
          var fileNameAndPathForProcessing = __dirname + "/../data/narrative_summaries/" + fileName;

          writeAQListXML(fileNameAndPathForProcessing, narrative_doc);
        }
        ;
        //console.log("\n ", __filename, "line", __line, "narratives = ", narratives);
        callback();
      }
      /*
       ,
       function (callback) {
       var fileNameAndPathForProcessing = __dirname + "/../data/output/AQList.xml";
       writeAQListXML(fileNameAndPathForProcessing);
       var fileNameAndPathForArchive = __dirname + "/../data/archive/AQList.xml";
       writeAQListXML(fileNameAndPathForArchive);
       callback();
       },
       function (callback) {
       // read local copy of XML file
       var rawXmlFileName = __dirname + "/../data/output/AQList.xml";
       var descr = "; reading raw XML file: " + rawXmlFileName;
       if (consoleLog) {
       console.log("\n ", __filename, "line", __line, "; function 1#:", ++functionCount, descr, fsOptions);
       }
       AQList_xml = fse.readFileSync(rawXmlFileName, fsOptions); //, function (err, data) {
       if (consoleLog) {
       console.log("\n ", __filename, "line", __line, " AQList_xml = ", trunc.n400(AQList_xml.toString()));
       }
       callback();
       },
       function (callback) {
       // convert AQList.xml to json
       if (consoleLog) {
       console.log("\n ", __filename, "line", __line, " function #:", ++functionCount);
       console.log("\n ", __filename, "line", __line, " typeof AQList_xml = ", (typeof AQList_xml));
       console.log("\n ", __filename, "line", __line, " AQList_xml = ", trunc.n400(AQList_xml.toString()));
       }
       // var myResult;
       parseString(AQList_xml, {
       explicitArray: false,
       trim: true
       }, function (err, result) {
       if (err) {
       console.log("\n ", __filename, "line", __line, " error attempting parseString: " + err, '\n');
       }
       myJsonData = result;
       if (consoleLog) {
       console.log("\n ", __filename, "line", __line, " result = \n", util.inspect(myJsonData, false, null)
       .trunc(truncateToNumChars));
       }
       });
       callback();
       },
       function (callback) {
       // save raw json
       if (consoleLog) {
       console.log("\n ", __filename, "line", __line, "function 4#:", ++functionCount);
       }
       var myFile = __dirname + "/../data/output/AQList-raw.json";
       // var myJsonData = savedJson;
       if (consoleLog) {
       console.log("\n ", __filename, "line", __line, " myResult = trunc.n400(", myJsonData);
       }
       try {
       fse.writeFileSync(myFile, JSON.stringify(myJsonData, null, " "), fsOptions);
       if (consoleLog) {
       console.log("\n ", __filename, "line", __line, " file written to: ", myFile);
       }
       // if (consoleLog) { console.log("\n ", __filename, "line", __line, " file contained: ", trunc.n400(util.inspect(myResult, false, null))
       // .trunc(truncateToNumChars));
       } catch (e) {
       if (consoleLog) {
       console.log("\n ", __filename, "line", __line, " Error: ", e);
       }
       }
       callback();
       }*/
    ],
    function (err) {
      // if (consoleLog) { console.log("\n ", __filename, "line", __line, " savedJson = ", trunc.n400(myResult));
      if (err) {
        console.log("\n ", __filename, "line", __line, " Error: " + err);
      }
    }
  );
};

var getXMLFile = function () {
  var fileNameToSaveTo = __dirname + "/../data/output/AQList.xml";
  re.get("http://www.un.org/sc/committees/1267/AQList.xml", fileNameToSaveTo, function (error, filename) {
    if (error) {
      console.log("\n ", __filename, "line", __line, "; Error \n" + error);
    }
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, "; Saved content to: \n", filename);
    }
  });
};

var writeAQListXML = function (localFileNameAndPath, narratives) {
//  var myFile = __dirname + "/../data/output/AQList.xml";
  try {
    fse.writeFileSync(localFileNameAndPath, narratives, fsOptions);
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, " file written to: ", localFileNameAndPath);
      console.log("\n ", __filename, "line", __line, "  file contained: ", util.inspect(AQList_xml.toString(), false, null).trunc(truncateToNumChars));
    }
  } catch (err) {
    console.log('\n ', __filename, "line", __line, ' Error: ', err);
  }
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, " AQList_xml = \n", trunc.n400(AQList_xml.toString()));
  }
};

var getNarrativesData = function (host, getFilePath, outputFileNameAndPath, entityOrIndivString) {
  var client = http.createClient(80, host);
  var request = client.request('GET', getFilePath, {'host': host});

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

getTheNarratives();

module.exports = {
  // getXMLFile: getXMLFile,
  // convertXMLToJson: convertXMLToJson,
  // writeAQListXML: writeAQListXML
};