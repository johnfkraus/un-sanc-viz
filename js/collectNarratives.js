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
  narrCounter,
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
  var narratives;
  var narrative_links;
  async.series([
      /*
       function (callback) {
       // list files in ./data/narrative_summaries
       if (consoleLog) {
       console.log("\n ", __filename, __line, "; function 1#:", ++functionCount);
       }
       console.log("\n ", __filename, "line", __line, "; running filewalker.filewalker()");
       var path = "./data/narrative_summaries/";
       fw(path);

       callback();
       },
       */
      /*
       function (callback) {
       // remove old narratives and other old files
       if (consoleLog) {
       console.log("\n ", __filename, __line, "; function #:", ++functionCount);
       }
       var newPath = "./data/narrative_summaries";
       console.log(newPath);
       // delete narrative_summaries directory and contents
       fse.removeSync(newPath);
       // re-create narrative_summaries directory
       fse.mkdirs(newPath);

       callback();
       },

       function (callback) {
       // using links from narrative_links.json, collect and save the narratives
       console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");
       narrative_links = require(__dirname + "/../data/narrative_lists/narrative_links.json");
       // var narrativeFileData;
       for (var ldi = 0; ldi < narrative_links.length; ldi++) {
       narrCounter++;
       link_data_item = narrative_links[ldi];
       collectFilePath = "http://www.un.org/sc/committees/1267/" + link_data_item.narrativeFileName;
       saveFilePath = __dirname + "/../data/narrative_summaries/" + link_data_item.narrativeFileName;
       //          saveTextFilePath = __dirname + "/../data/narrative_summaries/" + link_data_item.narrativeFileName + ".txt";
       getFile(collectFilePath, saveFilePath);

       if (narrCounter < 10) {
       //      console.log("\n ", __filename, "line", __line, "; text = ", text);
       }
       var linkDataSaveFilePath = __dirname + "/../data/narrative_summaries/narrative_links_2.json";

       }
       callback();
       },
       */
      function (callback) {
        // using links from narrative_links.json, collect and save the narratives
        console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");
        narrative_links = require(__dirname + "/../data/narrative_lists/narrative_links.json");
        // var narrativeFileData;
        narrCounter = 0;
        var narrativeFile;
        var mainContent;
        for (var ldi = 0; ldi < narrative_links.length; ldi++) {
          narrCounter++;
          link_data_item = narrative_links[ldi];
          collectFilePath = "./data/narrative_summaries/" + link_data_item.narrativeFileName;
//          saveFilePath = __dirname + "/../data/narrative_summaries/" + link_data_item.narrativeFileName;
          //          saveTextFilePath = __dirname + "/../data/narrative_summaries/" + link_data_item.narrativeFileName + ".txt";
          // getFile(collectFilePath, saveFilePath);
          // narrativeFile= JSON.parse(fse.readFileSync(collectFilePath));
          narrativeFile= (fse.readFileSync(collectFilePath).toString());
          mainContent = narrativeFile.match(/<div id=\"maincontent\".*/mg); //div id=\"maincontent\".*)<div id="footer">/);
          if (narrCounter < 10) {
            console.log("\n ", __filename, "line", __line, "; narrativeFile = ", narrativeFile);
            console.log("\n ", __filename, "line", __line, "; mainContent = ", mainContent);
          }
//          var linkDataSaveFilePath = __dirname + "/../data/narrative_summaries/narrative_links_2.json";

        }
        callback();
      }

    ],
    function (err) {
      // if (consoleLog) { console.log("\n ", __filename, "line", __line, " savedJson = ", trunc.n400(myResult));
      if (err) {
        console.log("\n ", __filename, "line", __line, " Error: \n" + err);
      }
    }
  );
};

var getMyFile = function () {
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
  console.log("\n ", __filename, "line", __line, "; host = ", host, "; getFilePath = ", getFilePath, "; outputFileNameAndPath = ", outputFileNameAndPath, "; entityOrIndivString = ", entityOrIndivString);
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
          console.log("\n ", __filename, "line", __line, "; bodyText = ", bodyText);
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
      console.log("\n ", __filename, "line", __line, "; outputFileNameAndPath = ", outputFileNameAndPath, "; JSON.stringify(paragraphArray, null, \" \") = ", JSON.stringify(paragraphArray, null, " "), "; fsOptions = ", fsOptions);
      writeMyFile(outputFileNameAndPath, JSON.stringify(paragraphArray, null, " "), fsOptions);
      // getFile(outurl, fileNameToSaveTo) {

      return paragraphArray;
    });
    console.log("\n ", __filename, "line", __line, "; JSON.stringify(paragraphArray, null, \" \") = ", JSON.stringify(paragraphArray, null, " "));
    return paragraphArray;
  });
  request.end();
  console.log("\n ", __filename, "line", __line, "; JSON.stringify(paragraphArray, null, \" \") = ", JSON.stringify(paragraphArray, null, " "));
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