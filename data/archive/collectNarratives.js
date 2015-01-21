// collectNarratives.js
// =========================

if (typeof define !== 'function') {
  var define = require('amdefine');
}
// var tika = require('tika');
var async = require('async'),
  select = require('soupselect').select,
  http = require('http'),
  htmlparser = require("htmlparser"),
  sys = require('sys'),
  re = require('request-enhanced'),
  fse = require('fs-extra'),
  util = require('util'),
  dateFormat = require('dateformat'),
  host = 'www.un.org',
  inspect = require('object-inspect'),
  trunc = require('./trunc.js'),
  request = require('sync-request'),
  truncateToNumChars = 400,
  narrCounter = 0,
  narrativeData,
  myJsonData,
  parseString = require('xml2js')
    .parseString;
var linenums = require('./linenums.js');
var jsonPath = require('JSONPath');
var filewalker = require('filewalker');
// var filewalker = require('./filewalker.js');
var consoleLog = true;
var narrativeLinks = [];
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
var collectFilePath, link_data_item, saveFilePath;

var getTheNarratives = function () {
  var functionCount = 0;
  var myResult, text, saveTextFilePath;
  var narrative;
  var narratives;
  var narrative_links;
  async.series([
      function (callback) {
        // using links from narrative_links.json, collect and save the narratives
        console.log("\n ", __filename, "line", __line, "; function #1:", ++functionCount, "; ");
        narrative_links = require(__dirname + "/../data/narrative_summaries/narrative_links.json");
// var narrativeFileData;
        for (var ldi = 0; ldi < narrative_links.length; ldi++) {
          narrCounter++;
          link_data_item = narrative_links[ldi];
          collectFilePath = "http://www.un.org/sc/committees/1267/" + link_data_item.narrativeFileName;
          saveFilePath = __dirname + "/../data/narrative_summaries/" + link_data_item.narrativeFileName;
//          saveTextFilePath = __dirname + "/../data/narrative_summaries/" + link_data_array_item.narrativeFileName + ".txt";
         getFile(collectFilePath, saveFilePath);

          if (narrCounter < 10) {
            //      console.log("\n ", __filename, "line", __line, "; text = ", text);
          }
          var linkDataSaveFilePath = __dirname + "/../data/narrative_summaries/narrative_links_2.json";

        }
        callback();
      },
      function (callback) {
        // using links from narrative_links.json, collect and save the narratives
        console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");
        //narrative_links = require(__dirname + "/../data/narrative_summaries/narrative_links.json");
// var narrativeFileData;
        for (var ldi = 0; ldi < narrative_links.length; ldi++) {
          // narrCounter++;
          link_data_item = narrative_links[ldi];
          //      collectFilePath = "http://www.un.org/sc/committees/1267/" + link_data_array_item.narrativeFileName;
          saveFilePath = __dirname + "/../data/narrative_summaries/" + link_data_item.narrativeFileName;
          //    saveTextFilePath = __dirname + "/../data/narrative_summaries/" + link_data_array_item.narrativeFileName + ".txt";
//          getFile(collectFilePath, saveFilePath);

         // narrative = fse.readFileSync(saveFilePath).toString();
         // link_data_array_item.narr = narrative;

//          $..book[?(@.isbn)]

          // text = jsonPath.eval(myJsonData, '$..[?(@.type=text)]');
          // link_data_array_item.text = text;
          //if (narrCounter < 10) {
          //  console.log("\n ", __filename, "line", __line, "; text = ", text);
          //}
         // var linkDataSaveFilePath = __dirname + "/../data/narrative_summaries/narrative_links_2.json";

        }
        callback();
      }
      /*
       function (callback) {
       // read "raw" unprocessed json file
       var rawJsonFileName = __dirname + "/../data/output/AQList-raw.json";
       consolidatedList = JSON.parse(fse.readFileSync(rawJsonFileName));
       if (consoleLog) {
       console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; read the raw json data file");
       }
       callback();
       },
       function (callback) {
       // collect and save the narratives
       console.log("\n ", __filename, "line", __line, "; function #3:", ++functionCount, "; ");
       narrative_links = require(__dirname + "/../data/narrative_summaries/narrative_links.json");
       for (var ldi = 0; ldi < narrative_links.length; ldi++) {
       link_data_array_item = narrative_links[ldi];
       collectFilePath = "/sc/committees/1267/" + link_data_array_item.narrativeFileName;
       saveFilePath = __dirname + "/../data/narrative_summaries/" + link_data_array_item.narrativeFileName;
       saveTextFilePath = __dirname + "/../data/narrative_summaries/" + link_data_array_item.narrativeFileName + ".txt";
       try {
       narrCounter++;
       link_data_array_item.narr = getNarrativesData(host, collectFilePath, saveFilePath, narrCounter);
       if (narrCounter < 10) {
       console.log("\n ", __filename, "line", __line, "; link_data_array_item = ", link_data_array_item);
       }
       // getNarrativesData(host, getFileNameAndPath, outputFileNameAndPath);
       //            var res = request('GET', url);
       // narrativeData = res.body.toString();
       } catch (err) {
       console.log("\n ", __filename, "line", __line, "; Error: ", err);
       }

       text = jsonPath.eval(link_data_array_item.narr, '$..[?(@.type=text)]');
       link_data_array_item.text = text;
       if (narrCounter < 10) {
       console.log("\n ", __filename, "line", __line, "; text = ", text);
       }
       var linkDataSaveFilePath = __dirname + "/../data/narrative_summaries/narrative_links_2.json";
       writeMyFile(saveTextFilePath, text, fsOptions);
       }
       callback();
       },

       function (callback) {
       // list files in /data/output
       if (consoleLog) {
       console.log("\n ", __filename, __line, "; function 5#:", ++functionCount);
       }
       console.log("\n ", __filename, "line", __line, "; running filewalker.filewalker()");
       var path = "./data/narrative_summaries";
       fw(path);

       callback();
       },
       function (callback) {
       // list files in /data/output
       if (consoleLog) {
       console.log("\n ", __filename, __line, "; function 5#:", ++functionCount);
       }
       console.log("\n ", __filename, "line", __line, "; running filewalker.filewalker()");
       var path = "./data/narrative_summaries";
       fw(path);

       callback();
       }

       /*
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
       var getFileNameAndPath = filePath.replace(/\/sc\/committees\/1267\/(NSQ.*.shtml)/, '$1');
       try {
       narrCounter++;
       getNarrativesData (host, getFilePath, outputFileNameAndPath, entityOrIndivString)
       // getNarrativesData(host, getFileNameAndPath, outputFileNameAndPath);
       //            var res = request('GET', url);
       narrativeData = res.body.toString();
       } catch (err) {
       console.log("\n ", __filename, "line", __line, "; Error: ", err);
       }
       var fileName = filePath.replace(/\/sc\/committees\/1267\/(NSQE00101E.shtml)/, '$1');
       var fileNameAndPathForProcessing = __dirname + "/../data/narrative_summaries/" + fileName;
       writeAQListXML(fileNameAndPathForProcessing, narrativeData);
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

var getNarrativesData = function (host, getFilePath, outputFileNameAndPath, narrCounter, entityOrIndivString) {
  if (narrCounter < 10) {
    console.log("\n ", __filename, "line", __line, "; host = ", host, "; getFilePath = ", getFilePath, "; outputFileNameAndPath = ", outputFileNameAndPath, "; entityOrIndivString = ", entityOrIndivString);
  }
  var body;
  var paragraphArray = [];
  var paragraphs, paragraph, maincontent;
  var client = http.createClient(80, host);
  var request = client.request('GET', getFilePath, {'host': host});
  request.on('response', function (response) {
    response.setEncoding('utf8');
    var body = "";
    response.on('data', function (chunk) {
      body = body + chunk;
    });
//    var body = document.getElementsByTagName('body')[0];
    var x;
    response.on('end', function () {
      // now we have the whole body, parse it and select the nodes we want...
      var handler = new htmlparser.DefaultHandler(function (err, dom) {
        if (err) {
          console.log("\n ", __filename, "line", __line, "Error: " + err);
        } else {

          // xmlDoc=loadXMLDoc("books.xml");
          //x=body.getElementsByTagName("p");

          // console.log("Text Nodes: ");
          // console.log(x.textContent);

          // console.log("\n ", __filename, "line", __line, "; body = ", body, "; body.textContent = ", body.textContent);
          var bodyText = body.textContent;
          if (narrCounter < 10) {
            console.log("\n ", __filename, "line", __line, "; bodyText = ", bodyText);
          }
          maincontent = select(dom, 'div#maincontent');
          //  console.log("\n ", __filename, "line", __line, "; maincontent = ", JSON.stringify(maincontent, null, " "));
          // soupselect happening here.., var titles = select(dom, 'a.title');
          paragraphs = select(maincontent, 'p');
          var rownum;
          for (var i = 0; i < paragraphs.length; i++) {
            pnum = i;
            paragraph = paragraphs[i];
            // paragraph = paragraph.textContent;

            paragraphArray.push(paragraph);

          }
        }
      });

      var parser = new htmlparser.Parser(handler);
      parser.parseComplete(body);
      var jsonNarrList = JSON.stringify(narrativeLinks, null, " ");
      // sys.puts(JSON.stringify(narrativeLinks, null, " "));
      if (narrCounter < 10) {
        console.log("\n ", __filename, "line", __line, "; outputFileNameAndPath = ", outputFileNameAndPath, ";\n JSON.stringify(paragraphArray, null, \" \") = ", JSON.stringify(paragraphArray, null, " "), ";\nOptions = ", fsOptions);
      }
      writeMyFile(outputFileNameAndPath, JSON.stringify(paragraphArray, null, " "), fsOptions);
      // getFile(outurl, fileNameToSaveTo) {

      return paragraphArray;
    });
    if (narrCounter < 10) {
      console.log("\n ", __filename, "line", __line, "; JSON.stringify(paragraphArray, null, \" \") = ", JSON.stringify(paragraphArray, null, " "));
    }
    return paragraphArray;
  });
  request.end();
  if (narrCounter < 10) {
    console.log("\n ", __filename, "line", __line, "; JSON.stringify(paragraphArray, null, \" \") = \n", JSON.stringify(paragraphArray, null, " "));
  }
  return paragraphArray;
};

var writeMyFile = function (localFileNameAndPath, data, fsOptions) {
  try {
    fse.writeFileSync(localFileNameAndPath, data, fsOptions);
  } catch (err) {
    console.log('\n ', __filename, "line", __line, ' Error: ', err);
  }
};

var getFile = function (url, fileNameToSaveTo) {
  // example: url = "http://www.un.org/sc/committees/1267/AQList.xml"
  // example: fileNameToSaveTo = __dirname + "/../data/output/AQList.xml";
  //   fileNameToSaveTo = __dirname + "/../data/output/AQList.xml";
  //  re.get("http://www.un.org/sc/committees/1267/AQList.xml", fileNameToSaveTo, function (error, filename) {
  re.get(url, fileNameToSaveTo, function (err, filename) {
    if (err) {
      console.log("\n ", __filename, "line", __line, "; Error \n" + err);
    } else if (consoleLog) {
      console.log("\n ", __filename, "line", __line, "; Saved content to: \n", filename);
    }
  });
};

var fw = function (path) {

  // var defaultPath = "./data/output";
  filewalker(path)
    .on('dir', function (p) {
      console.log('dir:  %s', p);
    })
    .on('file', function (p, s) {
      console.log('file: %s, %d bytes', p, s.size);
    })
    .on('error', function (err) {
      console.error(err);
    })
    .on('done', function () {
      console.log('%d dirs, %d files, %d bytes', this.dirs, this.files, this.bytes);
    })
    .walk();

};

getTheNarratives();

module.exports = {
  // getXMLFile: getXMLFile,
  // convertXMLToJson: convertXMLToJson,
  // writeAQListXML: writeAQListXML
};