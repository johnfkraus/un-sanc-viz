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
  requestSync = require('sync-request'),
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
var urls, filePaths;
var collectFilePath, link_data_array_item, saveFilePath;
var narrativeLinksLocalFileNameAndPath = __dirname + "/../data/narrative_lists/narrative_links.json";
var getTheNarratives = function () {
  var functionCount = 0;
  var myResult, text, saveTextFilePath;
  var narratives;
  var narrative_links;
  async.series([
      function (callback) {
        // remove old narratives and other old files
        if (false) {
          if (consoleLog) {
            console.log("\n ", __filename, __line, "; function #:", ++functionCount);
          }
          var narrativeSummariesLocalDirectory = "./data/narrative_summaries";
          console.log("\n ", __filename, "line", __line, "; ", narrativeSummariesLocalDirectory);
          // delete narrative_summaries directory and contents
          fse.removeSync(narrativeSummariesLocalDirectory);
          fse.removeSync("./data/narrative_lists/narrative_links_docs.json");
          // re-create narrative_summaries directory
          fse.mkdirs(narrativeSummariesLocalDirectory);
        }
        callback();
      },

      // get narrative_links.json, store in narrative_links variable
      function (callback) {
        console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");
        try {
          var buffer = fse.readFileSync(narrativeLinksLocalFileNameAndPath); // data/narrative_lists/narrative_links.json
          narrative_links = JSON.parse(buffer);
        } catch (err) {
          console.log("\n ", __filename, "line", __line, "; Error: ", err);
        }
        callback();
      },

      function (callback) {
        // using links from narrative_links.json, collect and save the narratives as json
        console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");

        try {
          // var narrativeLinksLocalFileNameAndPath = __dirname + "/../data/narrative_lists/narrative_links.json";
          var buffer = fse.readFileSync(narrativeLinksLocalFileNameAndPath); //, fsOptions); //, function (err, data) {
          narrative_links = JSON.parse(buffer);
        } catch (err) {
          console.log("\n ", __filename, "line", __line, "; Error: ", err);
        }
        narrCounter = 0;
        var narrativeFile;
        var mainContent;
        var jsonFileName;
        for (var ldi = 0; ldi < narrative_links.length; ldi++) {
          // for (var ldi = 0; ldi < 10; ldi++) {
          narrCounter++;
          link_data_array_item = narrative_links[ldi];
          collectFilePath = "http://www.un.org/sc/committees/1267/" + link_data_array_item.narrativeFileName;
          jsonFileName = makeJsonNarrativeFileName(link_data_array_item.narrativeFileName);
          saveFilePath = __dirname + "/../data/narrative_summaries/" + jsonFileName;

          getNarrativesData(host, collectFilePath, saveFilePath);
          //   mainContent = narrativeFile.match(/<div id=\"maincontent\".*  /mg); //div id=\"maincontent\".*)<div id="footer">/);
          if (narrCounter < 10) {
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
        // using links from narrative_links.json, collect and save the narratives
        console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");
        // narrative_links = require(__dirname + "/../data/narrative_lists/narrative_links.json");
        // var narrativeFileData;

        for (var ldi = 0; ldi < narrative_links.length; ldi++) {
          narrCounter++;
          link_data_array_item = narrative_links[ldi];
          // collectFilePath = "http://www.un.org/sc/committees/1267/" + link_data_array_item.narrativeFileName;
          readFilePath = __dirname + "/../data/narrative_summaries/" + link_data_array_item.narrativeFileName;
          try {
            narrative = fse.readFileSync(readFilePath, fsOptions); //, function (err, data) {
           // console.log("\n ", __filename, "line", __line, "; getting file: ", ldi, readFilePath, "\n content = ", narrative);
          } catch (err) {
            console.log("\n ", __filename, "line", __line, "; Error: ", err);

          }

        }

        callback();
      },

// collect the narrative files from the Internet
      function (callback) {
        if (false) {
          var narrCounter = 0;
          var responseString;
          // we have the narrative_links from above where we read the file /data/narrative_lists/narrative_links.json
          // using links from /data/narrative_lists/narrative_links.json, collect and save the narratives
          console.log("\n ", __filename, "line", __line, "; function #2:", ++functionCount, "; ");
          // narrative_links = require(__dirname + "/../data/narrative_lists/narrative_links.json");
//        for (var ldi = 0; ldi < narrative_links.length; ldi++) {
          var AQListCleanJsonPath = __dirname + "/../data/output/AQList-clean.json";

          try {
            var buffer = fse.readFileSync(AQListCleanJsonPath); //, fsOptions); //, function (err, data) {
            data = JSON.parse(buffer);
          } catch (err) {
            console.log("\n ", __filename, "line", __line, "; Error: ", err);
          }

          for (var ldi = 0; ldi < narrative_links.length; ldi++) {
            var res;
            narrCounter++;
            console.log("\n ", __filename, "line", __line, "; narrCounter = ", narrCounter);
            link_data_array_item = narrative_links[ldi];
            collectFilePath = "http://www.un.org/sc/committees/1267/" + link_data_array_item.narrativeFileName;
            saveFilePath = __dirname + "/../data/narrative_summaries/" + link_data_array_item.narrativeFileName;
            //          saveTextFilePath = __dirname + "/../data/narrative_summaries/" + link_data_array_item.narrativeFileName + ".txt";
            //     if (true) { // (narrCounter < 10) {
            try {
              res = requestSync('GET', collectFilePath);
              console.log("\n ", __filename, "line", __line, "; getting file: ", ldi, collectFilePath);
              responseString = res.body.toString();
              link_data_array_item.longNarrative = responseString;
              /*
               for (var d = 0; d < data.nodes.length; d++) {
               if (d.id == link_data_array_item.id) {
               d.longNarrative = responseString;
               }
               }
               */
            } catch (err) {
              console.log("\n ", __filename, "line", __line, "; Error: ", err, "; getting file: ", ldi, collectFilePath);
            }
            try {
              writeMyFile(saveFilePath, responseString, fsOptions)
            } catch (err) {
              console.log("\n ", __filename, "line", __line, "; Error: ", err, "; writing file: ", ldi, saveFilePath);
            }
            //}
          }
          var narrativeLinksDocsPath = __dirname + "/../data/narrative_lists/narrative_links_docs.json";
          var dataPath = __dirname + "/../data/output/AQList-cleanDocs.json";
          writeMyFile(narrativeLinksDocsPath, JSON.stringify(narrative_links, null, " "), fsOptions);
          writeMyFile(dataPath, JSON.stringify(data, null, " "), fsOptions);
        }
        callback();
      },

      function (callback) {
        // Loop through the narrative_links.json array, use it to open each downloaded narrative file
        // Add narrative to longNarrative attribute of each narrative link
        var narrCounter = 0;
        // we already have the narrative links in var narrative_links
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; ");
        // narrative_links = require(__dirname + "/../data/narrative_lists/narrative_links.json");
//        for (var ldi = 0; ldi < narrative_links.length; ldi++) {
        // var AQListCleanJsonPath = __dirname + "/../data/output/AQList-clean.json";
        // var data;
        /*        try {
         var buffer = fse.readFileSync(AQListCleanJsonPath); //, fsOptions); //, function (err, data) {
         var data = JSON.parse(buffer);
         } catch (err) {
         console.log("\n ", __filename, "line", __line, "; Error: ", err);
         } */
        var readNarrativeFilePath;
        var narrative;
        for (var ldi = 0; ldi < narrative_links.length; ldi++) {
          // var res;
          narrCounter++;
          console.log("\n ", __filename, "line", __line, "; narrCounter = ", narrCounter);
          link_data_array_item = narrative_links[ldi];

          readNarrativeFilePath = __dirname + "/../data/narrative_summaries/" + link_data_array_item.narrativeFileName;
          try {
            var buffer = fse.readFileSync(readNarrativeFilePath);
          } catch (err) {
            console.log("\n ", __filename, "line", __line, "; Error: ", err);
          }
          narrative = buffer.toString();
          link_data_array_item.longNarrative = narrative;
          // console.log("\n ", __filename, "line", __line, "; narrative = ", narrative);
        }
        var narrativeLinksDocsPath = __dirname + "/../data/narrative_lists/narrative_links_docs.json";
        writeMyFile(narrativeLinksDocsPath, JSON.stringify(narrative_links, null, " "), fsOptions);

        callback();
      },

      function (callback) {
        // Loop through the narrative_links_docs.json array, use it to update AQList-clean.json
        var narrCounter = 0;
        // using links from /data/narrative_lists/narrative_links.json, collect and save the narratives
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
          console.log("\n ", __filename, "line", __line, "; narrCounter = ", narrCounter, "; link_data_array_item.id = ", link_data_array_item.id);

          for (var j = 0; j < data.nodes.length; j++) {
            node = data.nodes[j];
            // console.log("\n ", __filename, "line", __line, "; node.id = ", node.id);
            if (link_data_array_item.id === node.id) {
              console.log("\n ", __filename, "line", __line, "; link_data_array_item.id = ", link_data_array_item.id, " === node.id = ", node.id, " = ", link_data_array_item.id === node.id);
              node.longNarrative = link_data_array_item.longNarrative;
            }
          }
        }
        var dataLocalFileNameAndPath = __dirname + "/../data/output/AQList-clean-docs.json";
        writeMyFile(dataLocalFileNameAndPath, JSON.stringify(data, null, " "), fsOptions);
        // var dataPath = __dirname + "/../data/output/AQList-cleanDocs.json";

        // writeMyFile(dataPath, JSON.stringify(data, null, " "), fsOptions);
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