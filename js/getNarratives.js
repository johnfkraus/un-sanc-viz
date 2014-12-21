var fs = require('fs');
var converter = require('converter');
// setup the options for the data converter
var options = {
  from: 'html',
  to: 'json'
};

// get a file stream reader pointing to the csv file to convert
var inputFileNameAndPath = (__dirname + "/../data/narrative_summaries/The Al-Qaida Sanctions Committee.html");
console.log("inputFileNameAndPath = ", inputFileNameAndPath);
var reader = fs.createReadStream(inputFileNameAndPath);
console.log("reader = ", reader);
// get a file stream writer pointing to the json file to write to
var outputFileNameAndPath = (__dirname + "/../data/narrative_summaries/The Al-Qaida Sanctions Committee.json")
console.log("outputFileNameAndPath = ", outputFileNameAndPath);
var writer = fs.createWriteStream(outputFileNameAndPath);
console.log("writer = ", writer)

// get a data converter stream using the given options
var convert = converter(options);

// pipe everything to do the conversion
reader.pipe(convert).pipe(writer);

console.log("getNarratives.js done");