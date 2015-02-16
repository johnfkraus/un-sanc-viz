/* utilities_aq_vis.js */

var consoleLog = false;

var fsOptions = {
  flags: 'r+', encoding: 'utf-8', autoClose: true
};
var fse = require('fs-extra');
var dateFormat = require('dateformat');
var linenums = require('./linenums.js');
// var __line = __line || {};

require('console-stamp')(console, '[HH:MM:ss.l]');
var logger = require('./libs/logger.js');
var message;

var addFileLabel = function(inString, fileName) {
  return '<!-- http://www.un.org/sc/committees/1267/' + fileName + ' -->' + inString;
};

// var Args = require("vargs").Constructor;

var countLines = function (textFile) {
  var i;
  var count = 0;
  fse.createReadStream(textFile).on('data', function (chunk) {
    for (i = 0; i < chunk.length; ++i)
      if (chunk[i] == 10) count++;
  })
    .on('end', function () {
      console.log(count);
    });
  return count;
};

// return true if inString contained the string 'Error: Page Not Found', else return false
var errorPageReturned = function (inString) {

  var errorPageMessageString = inString.match('Error: Page Not Found');
//  var errorPageMessageString = (inString.match('Error: Page Not Found'));
  // responsePageError = (responseBody.match('xyz'));

  if (errorPageMessageString !== null) {
    logger.log_message([__filename, ' line ', __line, '; The server return a page containing ', errorPageMessageString].join());
    console.log(__filename, 'line', __line, '; The server return a page containing ', errorPageMessageString);
    return true;
  } else {
    return false;
  }
};

var forceUnicodeEncoding = function (string) {
  console.log('string = ', string);
  var string1= string.replace(/’/gm, "'");
  var string2= string1.replace(/“/gm, '"');
  var string3 = string2.replace(/”/gm, '"');
  //  attache  é
  var result = unescape(encodeURIComponent(string3));
  return result.trim();
}


var formatMyDate = function (dateString) {
// Basic usage
// dateFormat.masks.hammerTime = 'yyyy-mm-dd-HHMMss';
// var displayDateString = dateFormat(now, 'friendly_display');
// Saturday, June 9th, 2007, 5:46:21 PM
// var fileDateString = dateFormat(now, 'hammerTime');
  // var now = new Date();
  dateFormat.masks.friendly_detailed = 'dddd, mmmm dS, yyyy, h:MM:ss TT';
  dateFormat.masks.friendly_display = 'dddd, mmmm dS, yyyy';
  dateFormat.masks.file_generated_date = 'yyyy-mm-dd';
  dateFormat.masks.common = 'mm-dd-yyyy';
  var date = new Date(dateString);
  var formattedDate = dateFormat(date, 'common');
  logger.log_message([__filename, ' line ', __line, '; formattedDate = ', formattedDate].join(''));
  return formattedDate.trim();
};

//  clean up ids for consistency;  none should have trailing period.
var getCleanId = function (referenceNumber) {
  var refNumRegexMatch;
  try {
    refNumRegexMatch = referenceNumber.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
  } catch (err) {
    logger.log_message([__filename, ' line ', __line, '; Error: ', err].join(''));
    // logger.log_message(__filename + ' line ' + __line + '; Error: = ' + err);
    // logger.log_message(__filename, 'line', __line, '; Error: ', err, '; referenceNumber =', referenceNumber);
    console.log(__filename, 'line', __line, '; Error: ', err, '; referenceNumber =', referenceNumber);
  }
  return refNumRegexMatch[0].trim();
};

var generateNarrFileName = function (node) {
  var idSplit = (node.id).trim().split('.');
  // id = id.trim();
  // var idSplit = id.split('.');
  var narrFileName = 'NSQ' + idSplit[0].substring(1, 2) + idSplit[2] + idSplit[3] + 'E.shtml';
  if (consoleLog) {
    console.log(__filename, ' line ', __line, '; node.id = ', node.id, '; generated narrFileName = ', narrFileName);
  }
  logger.log_message([__filename, ' line ', __line, '; node.id = ', node.id, '; generated narrFileName = ', narrFileName].join(''));
  return narrFileName.trim();
};

var stringifyAndWriteJsonDataFile = function (data, writeFileNameAndPath) {
  var truncateToNumChars = 400;
  var stringifiedData;
  try {
//    var myFile = __dirname + '/../data/output/' + fileName;
    stringifiedData = JSON.stringify(data, null, ' ');
    fse.writeFileSync(writeFileNameAndPath, stringifiedData, fsOptions);
    if (consoleLog) {
      console.log(__filename, 'line', __line, '; utilities_aq_viz.stringifyAndWriteJsonFile() wrote file to: ', writeFileNameAndPath, ';  file contained (truncated): ', stringifiedData.substring(0, truncateToNumChars), ' ... [CONSOLE LOG OUTPUT INTENTIONALLY TRUNCATED TO FIRST ', truncateToNumChars, ' CHARACTERS]\n\n');
      logger.log_message([__filename, 'line', __line, '; utilities_aq_viz.stringifyAndWriteJsonFile() wrote file to: ', writeFileNameAndPath, ';  file contained (truncated): ', stringifiedData.substring(0, truncateToNumChars), ' ... [CONSOLE LOG OUTPUT INTENTIONALLY TRUNCATED TO FIRST ', truncateToNumChars, ' CHARACTERS]\n'].join(''));

    }
  } catch (err) {
    if (consoleLog) {
      console.log(__filename, 'line', __line, ';  Error: ', err, '; countLines(stringifiedData) = ', countLines(stringifiedData));
    }
  }
};

// write data to a local file
var syncWriteMyFile = function (localFileNameAndPath, data, fsOptions) {
  try {
    fse.writeFileSync(localFileNameAndPath, data, fsOptions);
  } catch (err) {
    console.log(__filename, 'line', __line, '; Error: ', err);
    logger.log_message(__filename, 'line', __line, '; Error: ', err);
  }
};

var truncateStringToFirstNumChars = function (inString, truncateToFirstNumChars) {
  return ['; [TRUNCATED]:\n', inString.substring(0, truncateToFirstNumChars), ' ... [LOG OUTPUT INTENTIONALLY TRUNCATED TO FIRST ', truncateToFirstNumChars, ' CHARACTERS]\n'].join('');
};

function trimNarrative(narrWebPageString) {
  // var narrativeTrimError;
  // remove all CR, newline and tab characters from the narrative file

  var narrative0 = narrWebPageString.replace('’', "'");

  var narrative1 = narrWebPageString.replace(/([\r\n\t])/gm, ' ');
  // replace any occurrence of two or more space characters with one space character
  var narrative2 = narrative1.replace(/(\s{2,})/gm, ' ');
  // remove paragraphs containing non-breaking space; they mess up the rendered page by adding too many blank lines
  var narrative2a = narrative2.replace(/<p>&nbsp;<\/p>/gmi, '');
  // extract main content from web page; omit head, footer, etc.
  var narrative3 = narrative2a.replace(/(.*NARRATIVE SUMMARIES OF REASONS FOR LISTING<\/h3>)(.*?)(<!-- TemplateEndEditable.*)/mi, '$2');
//  var narrative3 = narrative2a.replace(/(.*>=?NARRATIVE SUMMARIES OF REASONS FOR LISTING<\/h3>)(.*)(<div id='footer'>.*)/mi, '$2');
// special regex for NSQE00401E.shtml, AL QAIDA, narrative page.
//   (.*NARRATIVE SUMMARIES OF REASONS FOR LISTING<\/h3>)(.*?)(<\/div>\s*<div id="footer".*)
  var narrative4 = narrative3.replace(/(.*NARRATIVE SUMMARIES OF REASONS FOR LISTING<\/h3>)(.*?)(<\/div>\s*<div id="footer".*)/mi, '$2');
  var tail = narrative3.substring(narrative3.length - 120, narrative3.length);
  var tailOmitsChars = (narrative3.length - tail.length);
  if (narrative3.length >= narrative2a.length) {
    console.log(__filename, ' line ', __line, '; tail = [FIRST', tailOmitsChars, 'CHARACTERS INTENTIONALLY OMITTED]', tail, '\nnarrative1.length = ', narrative1.length, '\nnarrative2.length = ', narrative2.length, '\nnarrative2a.length = ', narrative2a.length, '\nnarrative3.length = ', narrative3.length, '\ntail.length = ', tail.length, '\nnarrative3.substring(0,300) = ', narrative3.substring(0, 300));
    logger.log_message([__filename, ' line ', __line, '; tail = [FIRST', tailOmitsChars, 'CHARACTERS INTENTIONALLY OMITTED]', tail, '\n  narrative1.length = ', narrative1.length, '\n  narrative2.length = ', narrative2.length, '\n  narrative2a.length = ', narrative2a.length, '\n  narrative3.length = ', narrative3.length, '\n  tail.length = ', tail.length, '\n  narrative3.substring(0,300) = ', narrative3.substring(0, 300)].join(''));
  }
//  narrative5 = addFileLabel(narrative4);
  return narrative4.trim();
}

var validateUrl = function (url) {
  var regex_result = url.match(/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i);
  var result;
  if (typeof regex_result !== 'null') {
    result = true;
  } else {
    result = false;
  }
  return result;
};

module.exports = {
  addFileLabel: addFileLabel,
  errorPageReturned: errorPageReturned,
  forceUnicodeEncoding: forceUnicodeEncoding,
  formatMyDate: formatMyDate,
  generateNarrFileName: generateNarrFileName,
  getCleanId: getCleanId,
  stringifyAndWriteJsonDataFile: stringifyAndWriteJsonDataFile,
  syncWriteMyFile: syncWriteMyFile,
  trimNarrative: trimNarrative,
  validateUrl: validateUrl
};


