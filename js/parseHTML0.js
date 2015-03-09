var htmlparser = require("htmlparser");
var sys = require("sys");
var fse = require('fs-extra');
var util = require('util');
var domutils = require('domutils');
var linenums = require('./linenums.js');
var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};

var writeMyFile = function (localFileNameAndPath, data, fsOptions) {
  try {
    fse.writeFileSync(localFileNameAndPath, data, fsOptions);
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, " file written to: ", localFileNameAndPath);
    }
  } catch (err) {
    console.log('\n ', __filename, "line", __line, ' Error: ', err);
  }

};

var inputFileNameAndPath = (__dirname + "/../data/narrative_summaries/The Al-Qaida Sanctions Committee.html");
console.log("inputFileNameAndPath = ", inputFileNameAndPath);
//var reader = fs.createReadStream(inputFileNameAndPath);
var rawHtml = fse.readFileSync(inputFileNameAndPath, fsOptions);

// var rawHtml = "Xyz <script language= javascript>var foo = '<<bar>>';< /  script><!--<!-- Waah! -- -->";
var handler = new htmlparser.DefaultHandler(function (error, dom) {
  if (error) {
    // [...do something for errors...]
    console.log("Error: ", error);
  }

  else {
    // [...parsing done, do something...]
    console.log("[...parsing done, do something...]");
    console.log("dom = ", dom);
  }

});
var parser = new htmlparser.Parser(handler);
parser.parseComplete(rawHtml);
sys.puts(sys.inspect(handler.dom, false, null));

domutils.findAll

var outputFileNameAndPath = (__dirname + "/../data/narrative_summaries/The Al-Qaida Sanctions Committee.json");
console.log("outputFileNameAndPath = ", outputFileNameAndPath);
var consoleLog = false;
writeMyFile(outputFileNameAndPath, sys.inspect(handler.dom, false, null), fsOptions);

/*
 var fs = require('fs');
 var fse = require('fs-extra');

 var fsOptions = {
 flags: 'r+',
 encoding: 'utf-8',
 autoClose: true
 };

 // AQList_xml = fse.readFileSync(backupRawXmlFileName, fsOptions);
 var htmlparser = require("htmlparser2");
 var parser = new htmlparser.Parser({

 onopentag: function (name, attribs) {
 if (name === "script" && attribs.type === "text/javascript") {
 console.log("JS! Hooray!");
 }
 },
 ontext: function (text) {
 console.log("-->", text);
 },
 onclosetag: function (tagname) {
 if (tagname === "script") {
 console.log("That's it?!");
 }
 }
 });

 // get a file stream reader pointing to the csv file to convert
 var inputFileNameAndPath = (__dirname + "/../data/narrative_summaries/The Al-Qaida Sanctions Committee.html");
 console.log("inputFileNameAndPath = ", inputFileNameAndPath);
 var reader = fs.createReadStream(inputFileNameAndPath);
 var narrativeHTML = fse.readFileSync(inputFileNameAndPath, fsOptions);
 // console.log("reader = ", reader);
 // get a file stream writer pointing to the json file to write to
 var outputFileNameAndPath = (__dirname + "/../data/narrative_summaries/The Al-Qaida Sanctions Committee.json")
 console.log("outputFileNameAndPath = ", outputFileNameAndPath);
 var writer = fs.createWriteStream(outputFileNameAndPath);
 // console.log("writer = ", writer)

 // console.log("reader = ", reader);
 // get a file stream writer pointing to the json file to write to
 // var writer = fs.createWriteStream('data/output/file.json');
 // console.log("writer = ", writer)

 // get a data converter stream using the given options
 // var convert = converter(options);

 // pipe everything to do the conversion
 // reader.pipe(convert).pipe(writer);

 parser.write(narrativeHTML);
 // parser.write("Xyz <script type='text/javascript'>var foo = '<<bar>>';</ script>");
 parser.end();

 console.log("parseHTML.js done");

 */

