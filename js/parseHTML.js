var fs = require('fs');
fse = require('fs-extra');

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


