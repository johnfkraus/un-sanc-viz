// collectNarratives.js
// =========================

if (typeof define !== 'function') {
  var define = require('amdefine');
}
// var tika = require('tika');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

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
  requestSync = require('sync-request'),
  truncateToNumChars = 400,
  narrCounter,
  narrativeData,
  myJsonData,
  parseString = require('xml2js')
    .parseString;

var mongojs = require("mongojs");
var db;
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
var data;
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
var db;
var urls, filePaths;
var requestHandler;
var collectFilePath, link_data_array_item, saveFilePath;
var dataLocalFileNameAndPath = __dirname + "/../data/output/AQList-clean-docs.json";
var narrativeLinksLocalFileNameAndPath = __dirname + "/../data/narrative_lists/narrative_links.json";
var narrative_links;

var getTheNarratives = function () {
    var functionCount = 0;
    var myResult, text, saveTextFilePath;
    var narratives;

    async.series([
        function (callback) {
          // remove/delete old narrative files and other old files prior to collecting current narratives
          if (false) {
            if (consoleLog) {
              console.log("\n ", __filename, __line, "; function #:", ++functionCount);
            }
            var narrativeSummariesLocalDirectory = "./data/narrative_summaries";
            // console.log("\n ", __filename, "line", __line, "; Deleting directory: ", narrativeSummariesLocalDirectory);
            // delete narrative_summaries directory and contents
            // fse.removeSync(narrativeSummariesLocalDirectory);
            //  console.log("\n ", __filename, "line", __line, "; Deleting file: /data/narrative_lists/narrative_links_docs.json");
            // fse.removeSync("./data/narrative_lists/narrative_links_docs.json");
            // fse.removeSync("./data/narrative_lists/narrative_links.json");
            // fse.removeSync("./data/narrative_lists/narrative_links.json");
            // re-create narrative_summaries directory
            //   fse.mkdirs(narrativeSummariesLocalDirectory);
          }
          callback();
        },
        // load the local narrative_links.json file, store in variable named 'narrative_links'
        // load the local narrative_links.json file, store in variable named 'narrative_links'
        function (callback) {
          console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");
          try {
            var dataBuffer = fse.readFileSync(dataLocalFileNameAndPath); // data/narrative_lists/narrative_links.json
            data = JSON.parse(dataBuffer);
            var linksBuffer = fse.readFileSync(narrativeLinksLocalFileNameAndPath); // data/narrative_lists/narrative_links.json
            narrative_links = JSON.parse(linksBuffer);
          } catch (err) {
            console.log("\n ", __filename, "line", __line, "; Error: ", err);
          }
          callback();
        },

        // using file names from narrative_links.json, collect and save the narratives
        function (callback) {

          console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");
          narrCounter = 0;
          var narrativeFile;
          var mainContent;
          var jsonFileName;
          var nodes = data.nodes;
          for (var ldi = 0; ldi < nodes.length; ldi++) {
            // for (var ldi = 0; ldi < 10; ldi++) {
            narrCounter++;
            node = nodes[ldi];
            collectFilePath = "http://www.un.org/sc/committees/1267/" + node.narrativeFileName;
            //jsonFileName = makeJsonNarrativeFileName(link_data_array_item.narrativeFileName);
            saveFilePath = __dirname + "/../data/narrative_summaries/" + node.narrativeFileName;

//            console.log("\n ", __filename, "line", __line, "; buffer.length = ", buffer.length);
//            var narrWebPageString = forceUnicodeEncoding(buffer.toString());
//            narrative = trimNarrative(narrWebPageString);
            getNarrativesData(host, collectFilePath, saveFilePath);
            //   mainContent = narrativeFile.match(/<div id=\"maincontent\".*  /mg); //div id=\"maincontent\".*)<div id="footer">/);
            if (narrCounter < 5) {
              console.log("\n ", __filename, "line", __line, "; narrativeFile = ", narrativeFile);
              console.log("\n ", __filename, "line", __line, "; mainContent = ", mainContent);
            }
          }
          callback();
        },

        function (callback) {
          var narrative;
          var narrCounter = 0;
          var responseString;
          var readFilePath;
          // using file names from narrative_links.json, collect and save the narratives
          console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; ");
          for (var ldi = 0; ldi < narrative_links.length; ldi++) {
            narrCounter++;
            link_data_array_item = narrative_links[ldi];
            // collectFilePath = "http://www.un.org/sc/committees/1267/" + link_data_array_item.narrativeFileName;
            readFilePath = __dirname + "/../data/narrative_summaries/" + link_data_array_item.narrativeFileName;
            try {
              narrative = fse.readFileSync(readFilePath, fsOptions);
              // console.log("\n ", __filename, "line", __line, "; getting file: ", ldi, readFilePath, "\n content = ", narrative);
            } catch (err) {
              console.log("\n ", __filename, "line", __line, "; Error: ", err);
            }
          }

          callback();
        },

        // We have the narrative links in the variable 'narrative_links'
        // Loop through the narrative_links.json array, use it to open each downloaded narrative file
        // Add narrative to longNarrative attribute of each narrative link

        function (callback) {
          var narrCounter = 0;
          console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; ");
          var readNarrativeFilePath;
          var narrative;
          // Connection URL
          // var url = "mongodb://localhost:27017/aq-list";
          // Use connect method to connect to the Server

          //  MongoClient.connect(url, function (err, db) {
          //   console.log("Connected correctly to server");
          //   assert.equal(null, err);
          //   console.log("\n ", __filename, "line", __line, "; err = ", err);
          var nodes = data.nodes;
          var node;
          for (var ldi = 0; ldi < nodes.length; ldi++) {
            narrCounter++;
            console.log("\n ", __filename, "line", __line, "; narrCounter = ", narrCounter);
            node = nodes[ldi];
            readNarrativeFilePath = __dirname + "/../data/narrative_summaries/" + node.narrativeFileName;
            try {
              var buffer = fse.readFileSync(readNarrativeFilePath);
            } catch (err) {
              console.log("\n ", __filename, "line", __line, "; Error: ", err);
            }
           // console.log("\n ", __filename, "line", __line, "; buffer.length = ", buffer.length);
            var narrWebPageString = forceUnicodeEncoding(buffer.toString());
            narrative = trimNarrative(narrWebPageString);
            // link_data_array_item.longNarrative = narrative;
            // Insert a single document
            // db.collection('narratives').insert(narrative, function (err, r) {
            //  assert.equal(null, err);
            //  assert.equal(1, r.insertedCount);
            // });
          }

          // var narrativeLinksDocsPath = __dirname + "/../data/narrative_lists/narrative_links_docs.json";
          // writeMyFile(narrativeLinksDocsPath, JSON.stringify(narrative_links, null, " "), fsOptions);
          //    db.close();

          callback();
        },
        /*
         // Loop through the narrative_links_docs.json array, use it to add narrative file name to AQList-clean.json
         function (callback) {
         var narrCounter = 0;
         var nodeCounter = 0;
         console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");
         var AQListCleanJsonPath = __dirname + "/../data/output/AQList-clean.json";
         var data;
         try {
         var buffer = fse.readFileSync(AQListCleanJsonPath);
         data = JSON.parse(buffer);
         } catch (err) {
         console.log("\n ", __filename, "line", __line, "; Error: ", err);
         }
         var node;
         var nodes = data.nodes;
         var linksId, dataId;
         for (var ldi = 0; ldi < narrative_links.length; ldi++) {
         narrCounter++;
         link_data_array_item = narrative_links[ldi];
         if (narrCounter < 5) {
         console.log("\n ", __filename, "line", __line, "; narrCounter = ", narrCounter, "; link_data_array_item.id = ", link_data_array_item.id);
         }
         // loop through the 'nodes' array in AQList...json to find a matching id
         for (var j = 0; j < data.nodes.length; j++) {
         nodeCounter++;
         node = data.nodes[j];
         // console.log("\n ", __filename, "line", __line, "; node.id = ", node.id);
         if (link_data_array_item.id === node.id) {
         if (nodeCounter < 5) {
         console.log("\n ", __filename, "line", __line, "; link_data_array_item.id = ", link_data_array_item.id, " === node.id = ", node.id, " = ", link_data_array_item.id === node.id);
         }
         // node.longNarrative = link_data_array_item.longNarrative;
         node.narrativeFileName = link_data_array_item.narrativeFileName;
         }
         }
         }
         var dataLocalFileNameAndPath = __dirname + "/../data/output/AQList-clean-docs.json";
         writeMyFile(dataLocalFileNameAndPath, JSON.stringify(data, null, " "), fsOptions);
         // var dataPath = __dirname + "/../data/output/AQList-cleanDocs.json";
         // writeMyFile(dataPath, JSON.stringify(data, null, " "), fsOptions);
         callback();
         }
         */
      ],
      function (err) {
        // if (consoleLog) { console.log("\n ", __filename, "line", __line, " savedJson = ", trunc.n400(myResult));
        if (err) {
          console.log("\n ", __filename, "line", __line, " Error: \n" + err);
        }
      }
    )
    ;
  }
  ;

function forceUnicodeEncoding(string) {
  return unescape(encodeURIComponent(string));
}

function trimNarrative(narrWebPageString) {
  var narrative1 = narrWebPageString.replace(/([\r\n\t])/gm, ' ');
  var narrative2 = narrative1.replace(/(\s{2,})/gm, ' ');
  narrative = narrative2.replace(/<!DOCTYPE HTML PUBLIC.*MAIN CONTENT BEGINS(.*?)TemplateEndEditable.*<\/html>/mi, '$1');
  return narrative;
}

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
      // console.log("\n ", __filename, "line", __line, "  file contained: ", util.inspect(AQList_xml.toString(), false, null).trunc(truncateToNumChars));
    }
  } catch (err) {
    console.log('\n ', __filename, "line", __line, ' Error: ', err);
  }
  if (consoleLog) {
    //  console.log("\n ", __filename, "line", __line, " AQList_xml = \n", trunc.n400(AQList_xml.toString()));
  }
};

var getNarrativesData = function (host, getFilePath, outputFileNameAndPath) {
  console.log("\n ", __filename, "line", __line, "; host = ", host, "; getFilePath = ", getFilePath, "; outputFileNameAndPath = ", outputFileNameAndPath);
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
          // console.log("\n ", __filename, "line", __line, "; bodyText = ", bodyText);
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
      //   console.log("\n ", __filename, "line", __line, "; outputFileNameAndPath = ", outputFileNameAndPath, "; JSON.stringify(paragraphArray, null, \" \") = ", JSON.stringify(paragraphArray, null, " "), "; fsOptions = ", fsOptions);
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

var makeJsonNarrativeFileName = function (narrativeFileNameString) {
  // console.log("\n ", __filename, __line, "; narrativeFileNameString = ", narrativeFileNameString);
  var narrativeFileName1 = narrativeFileNameString.replace(/(NSQ.*\.)shtml/, '$1json');
  // var narrativeFileName1 = narrativeFileNameString.replace(/http:\/\/dev.un.org(\/sc\/committees\/1267\/NSQ.*\.shtml)/, '$1');
  // console.log("\n ", __filename, __line, "; narrativeFileName1 = ", narrativeFileName1);
//  var narrativeFileName2 = narrativeFileName1.replace(/\/sc\/committees\/1267\/(NSQ.*\.shtml)/, '$1');
  return narrativeFileName1;
};

module.exports = {
  getTheNarratives: getTheNarratives
};