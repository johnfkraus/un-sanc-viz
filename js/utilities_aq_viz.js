/* utilities_aq_vis.js */

var fse = require('fs-extra');

var __line = __line || {};

function forceUnicodeEncoding(string) {
  return unescape(encodeURIComponent(string));
}

//  clean up ids for consistency;  none should have trailing period.
var getCleanId = function (referenceNumber) {
  var refNumRegexMatch;
  try {
    refNumRegexMatch = referenceNumber.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
  } catch (error) {
    console.log('\n ', __filename, 'line', __line, '; Error: ', error, '; node =', node, '; counter = ', counter);
  }
  return refNumRegexMatch[0].trim();
};

var generateNarrFileName = function (node) {
  var id = node.id.trim();
  var idSplit = id.split('.');
  var narrFileName = 'NSQ' + idSplit[0].substring(1, 2) + idSplit[2] + idSplit[3] + '.shtml';
  console.log('\n ', __filename, 'line', __line, '; id = ', id, '; generated narrFileName = ', narrFileName);
  return narrFileName;
};


var saveJsonFile = function (jsonData, fileName) {
  var consoleLog = true;
  try {
    var myFile = __dirname + '/../data/output/' + fileName;
    var myJsonData = JSON.stringify(jsonData, null, ' ');
    fse.writeFileSync(myFile, myJsonData, fsOptions);
    if (consoleLog) {
      console.log('\n ', __filename, 'line', __line, '; saveJsonFile() wrote file to: ', myFile, ';  file contained (truncated): ', myJsonData.substring(0, 400), ' ... [CONSOLE LOG OUTPUT INTENTIONALLY TRUNCATED TO FIRST 400 CHARACTERS]\n\n');
    }
  } catch (e) {
    if (consoleLog) {
      console.log('\n ', __filename, 'line', __line, ';  Error: ', e);
    }
  }
};

// write data to a local file
var syncWriteMyFile = function (localFileNameAndPath, data, fsOptions) {
  try {
    fse.writeFileSync(localFileNameAndPath, data, fsOptions);
  } catch (err) {
    console.log('\n ', __filename, 'line', __line, '; Error: ', err);
  }
};


// parameter 'narrFileName' only provides information for debugging
function trimNarrative(narrWebPageString, narrFileName) {
  var narrativeTrimError;
  // remove all CR, newline and tab characters from the narrative file
  var narrative1 = narrWebPageString.replace(/([\r\n\t])/gm, ' ');
  // replace any occurrence of two or more space characters with one space character
  var narrative2 = narrative1.replace(/(\s{2,})/gm, ' ');
  // remove paragraphs containing non-breaking space; they mess up the rendered page by adding too many blank lines
  var narrative2a = narrative2.replace(/<p>&nbsp;<\/p>/gmi, '');
  // extract main content from web page; omit head, footer, etc.
  var narrative3 = narrative2a.replace(/(.*>=?NARRATIVE SUMMARIES OF REASONS FOR LISTING<\/h3>)(.*)(<div id='footer'>.*)/mi, '$2');
  var tail = narrative3.substring(narrative3.length - 120, narrative3.length);
  var tailOmitsChars = (narrative3.length - tail.length);
  if (narrative3.length >= narrative2a.length) {
    console.log('\n ', __filename, 'line', __line, '; tail = [FIRST', tailOmitsChars, 'CHARACTERS INTENTIONALLY OMITTED]', tail);
    console.log('\n ', __filename, 'line', __line, '\nnarrFileName = ', narrFileName, '\nnarrative1.length = ', narrative1.length, '\nnarrative2.length = ', narrative2.length, '\nnarrative2a.length = ', narrative2a.length, '\nnarrative3.length = ', narrative3.length, '\ntail.length = ', tail.length, '\nnarrative3.substring(0,300) = ', narrative3.substring(0,300));
    throw narrativeTrimError;
  }
  return narrative3;
}

module.exports = {
  __line: __line,
  forceUnicodeEncoding: forceUnicodeEncoding,
  generateNarrFileName: generateNarrFileName,
  getCleanId: getCleanId,
  saveJsonFile: saveJsonFile,
  syncWriteMyFile: syncWriteMyFile,
  trimNarrative: trimNarrative
};
