/* utilities_aq_vis.js */

var appConfig = require('./appConfig.js');
var consoleLog = appConfig.consoleLog;

var Set = require('backpack-node').collections.Set;
var truncateToNumChars = 100;
// var logger = require('tracer').colorConsole({level:'warn'});
var logger = require('./tracer-logger-config.js').logger;
// var logger = app.logger;
// var logger = require('./app.js').logger;
var rotate = require('log-rotate');
var primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173];
var logModulus = primes[Math.floor(Math.random() * primes.length)];
// var logModulus = 43;
// var tlc = require('./tracer-logger-config.js');
require('console-stamp')(console, '[HH:MM:ss.l]');
var fsOptions = {
  flags: 'r+', encoding: 'utf-8', autoClose: true
};
var fse = require('fs-extra');
var dateFormat = require('dateformat');
var linenums = require('./linenums.js');
var message;
var addFileLabel = function (inString, url) {
  return '<!-- ' + url + ' -->' + inString;
};

// count the unique links for each node
var countLinks = function (data) {
  var linkCounter;
  // loop through each node
  data.nodes.forEach(function (node) {
    linkCounter = 0;
    // linkCounter = 0;
    var keySet = new Set();
    var keyAdded1, keyAdded2;
    var linkConcatKey1, linkConcatKey2;
    // loop through each link
    data.links.forEach(function (link) {
      // delete a link if source and target are the same
      if (link.source === link.target) {
        delete data.link;
        logger.debug(__filename, 'line', __line, 'deleted ', data.link, ' because link.source === link.target');
      } else {
        // increment the link count if the node.id is either the link source or link target
        if (node.id === link.source || node.id === link.target) {
          linkConcatKey1 = link.source + link.target;
          linkConcatKey2 = link.target + link.source;
          keyAdded1 = keySet.add(linkConcatKey1);
          keyAdded2 = keySet.add(linkConcatKey2);
          if (keyAdded1 && keyAdded2) {
            linkCounter++;
          }
        }
      }
    });
    node.linkCount = linkCounter;
//    node.linkCount = node.connectionObjectsFromNarrative.length;
    if (node.nodeNumber % logModulus === 0) {
      // logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, '; linkCounter = ', linkCounter);
//      logger.debug(__filename, 'line', __line, '; node.nodeNumber = ', node.nodeNumber, '; node.links.length = ', node.links.length, 'node.linksFromNarrArray.length = ', node.linksFromNarrArray.length, '; ', node.links.length, '/', node.linksFromNarrArray.length);
    }
  });
  return data;
};

var countLines = function (textFile) {
  var i;
  var count = 0;
  fse.createReadStream(textFile).on('data', function (chunk) {
    for (i = 0; i < chunk.length; ++i)
      if (chunk[i] == 10) count++;
  })
    .on('end', function () {
      console.log(__filename, 'line', __line, '; count = ', count);
    });
  return count;
};

// return true if inString contained the string 'Error: Page Not Found', else return false
var errorPageReturned = function (inString) {
  var errorMessage;
//  try {
  var errorPageMessageString = inString.match('Error: Page Not Found');
  if (!errorPageMessageString) {
    return false;
  } else {
    return true;
  }

  if (errorPageMessageString) {
    errorMessage = ([__filename, ' line ', __line, '; The server return a page containing ', errorPageMessageString].join());
    return errorMessage;
  } else {
    return false;
  }
//  } catch (err) {
  if (consoleLog) {
    logger.error(__filename, 'line', __line, ';  Error: ', err, '; countLines(stringifiedData) = ', countLines(stringifiedData));
  }
//  }
};

var forceUnicodeEncoding = function (string) {
  // console.log('string = ', string);
  var string1 = string.replace(/’/gm, "'");
  var string2 = string1.replace(/“/gm, '"');
  var string3 = string2.replace(/”/gm, '"');
  //  attache  é
  var result = unescape(encodeURIComponent(string3));
  return result.trim();
};

var formatMyDate = function (dateString) {
// Basic usage
// dateFormat.masks.hammerTime = 'yyyy-mm-dd-HHMMss';
// var displayDateString = dateFormat(now, 'friendly_display');
// Saturday, June 9th, 2007, 5:46:21 PM
// var fileDateString = dateFormat(now, 'hammerTime');
  // var now = new Date();
  // logger = require('./app.js').logger;
  logger = require('./tracer-logger-config.js').logger;
  dateFormat.masks.friendly_detailed = 'dddd, mmmm dS, yyyy, h:MM:ss TT';
  dateFormat.masks.friendly_display = 'dddd, mmmm dS, yyyy';
  dateFormat.masks.file_generated_date = 'yyyy-mm-dd';
  dateFormat.masks.common = 'mm-dd-yyyy';
  var date = new Date(dateString);
  var formattedDate = dateFormat(date, 'common');
  logger.debug([__filename, ' line ', __line, '; formattedDate = ', formattedDate].join(''));
  return formattedDate.trim();
};

var generateNarrFileNameFromId = function (nodeId) {
  // QI.A.77.02  filename: NSQI07702E.shtml
  var idSplit = (nodeId).trim().split('.');
  // id = id.trim();
  // var idSplit = id.split('.');
  var narrFileName = 'NSQ' + idSplit[0].substring(1, 2) + pad(idSplit[2], 3) + pad(idSplit[3], 2) + 'E.shtml';
  if (consoleLog) {
    logger.debug(__filename, ' line ', __line, '; nodeId = ', nodeId, '; generated narrFileName = ', narrFileName);
    logger.debug([__filename, ' line ', __line, '; nodeId = ', nodeId, '; generated narrFileName = ', narrFileName].join(''));
  }
  testNarrativeFileName(narrFileName);
  return narrFileName.trim();
};

//  clean up ids for consistency;  none should have trailing period.
var getCleanId = function (referenceNumber) {
  var refNumRegexMatch;
  try {
    refNumRegexMatch = referenceNumber.match(/(Q[IE]\.[A-Z]\.\d{1,3}\.\d{2})/);
  } catch (err) {
    logger.debug([__filename, ' line ', __line, '; Error: ', err].join(''));
    // logger.debug(__filename + ' line ' + __line + '; Error: = ' + err);
    // logger.debug(__filename, 'line', __line, '; Error: ', err, '; referenceNumber =', referenceNumber);
    logger.error(__filename, 'line', __line, '; Error: ', err, '; referenceNumber =', referenceNumber);
  }
  return refNumRegexMatch[0].trim();
};

var getStackTrace = function (err) {
  logger = require('./tracer-logger-config.js').logger;
  var i, j, k;
  // ...
  // j acquires some interesting value
  // Who called foo when j took this interesting value?
  //
  //  var e = new Error('dummy');
  var stack = err.stack.replace(/^[^\(]+?[\n$]/gm, '')
    .replace(/^\s+at\s+/gm, '')
    .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
    .split('\n');
  logger.error(stack);
  // ...
  // rest of the code
};

var generateNarrFileName = function (node) {
  var idSplit = (node.id).trim().split('.');
  // id = id.trim();
  // var idSplit = id.split('.');

  var narrFileName = 'NSQ' + idSplit[0].substring(1, 2) + pad(idSplit[2], 3) + pad(idSplit[3], 2) + 'E.shtml';
//  var narrFileName = 'NSQ' + idSplit[0].substring(1, 2) + idSplit[2] + idSplit[3] + 'E.shtml';
  if (consoleLog) {
    console.log(__filename, ' line ', __line, '; node.id = ', node.id, '; generated narrFileName = ', narrFileName);
    logger.debug([__filename, ' line ', __line, '; node.id = ', node.id, '; generated narrFileName = ', narrFileName].join(''));
  }
  testNarrativeFileName(narrFileName);
  return narrFileName.trim();
};

var pad = function (num, size) {
  var s = "000000000" + num;
  return s.substr(s.length - size);
};

var testNarrativeFileName = function (narrFileName) {
  var nameTestString = narrFileName.split('.')[0];
  // var nameLengthTest = node.narrativeFileName.split('.')[0].length;
  if (nameTestString.length < 5) { // node.narrativeFileName === 'NSQE4601E.shtml') {
    logger.error(__filename, 'line', __line, '; narrFileName = ', narrFileName, '; nameTestString.length = ', nameTestString.length);
    return false;
//  } else if (nameTestString.length === 10) {
//    return true;
  } else {
    return true;
  }
};

var stringifyAndWriteJsonDataFile = function (data, writeFileNameAndPath) {
  // var stringifiedData;
  try {
    // var myFile = __dirname + '/../data/output/' + fileName;
    var stringifiedData = JSON.stringify(data, null, ' ');
    fse.writeFileSync(writeFileNameAndPath, stringifiedData, fsOptions);
    if (consoleLog) {
      console.log(__filename, 'line', __line, '; utilities_aq_viz.stringifyAndWriteJsonFile() wrote file to: ', writeFileNameAndPath, ';  file contained (truncated): ', stringifiedData.substring(0, truncateToNumChars), ' ... [CONSOLE LOG OUTPUT INTENTIONALLY TRUNCATED TO FIRST ', truncateToNumChars, ' CHARACTERS]\n\n');
      logger.debug([__filename, 'line', __line, '; utilities_aq_viz.stringifyAndWriteJsonFile() wrote file to: ', writeFileNameAndPath, ';  file contained (truncated): ', stringifiedData.substring(0, truncateToNumChars), ' ... [CONSOLE LOG OUTPUT INTENTIONALLY TRUNCATED TO FIRST ', truncateToNumChars, ' CHARACTERS]\n'].join(''));

    }
  } catch (err) {
    if (consoleLog) {
      logger.error(__filename, 'line', __line, ';  Error: ', err, '; countLines(stringifiedData) = ', countLines(stringifiedData));
    }
  }
};

var nodeSummary = function (node) {
  var nodeSummaryString = '\n\n';
  if (node.nodeNumber) {
    nodeSummaryString += '\nNode number: ' + node.nodeNumber;
  }
  if (node.id) {
    nodeSummaryString += '\nId: ' + node.id;
  }
  if (node.narrativeFileName) {
    nodeSummaryString += '\nNarrative file name: ' + node.narrativeFileName;
  }
  if (node.name) {
    nodeSummaryString += "\nName: " + node.name;
  }
  if (node.NATIONALITY) {
    nodeSummaryString += "\nNationality: " + node.NATIONALITY.VALUE;
  }
  nodeSummaryString += "\nNationality2: " + node.NATIONALITY2;
  // nodeSummaryString += "\nNumber of links: " + node.links.length;
  nodeSummaryString += "\nComments: " + node.COMMENTS1;
  if (node.connectionsFromComments) {
    nodeSummaryString += '\nnode.connectionsFromComments.length = ' + node.connectionsFromComments.length;
  }

//  if (typeof node.links !== 'undefined') {
//    nodeSummaryString += '\nnode.links.length = ' + node.links.length;
//  }
  if (typeof node.connectionObjectsFromNarrative !== 'undefined') {
    nodeSummaryString += '\nnode.connectionObjectsFromNarrative.length = ' + node.connectionObjectsFromNarrative.length;
    nodeSummaryString += '\nnode.linksFromNarrArray = ' + node.linksFromNarrArray;
  }
  if (typeof node.linkCount !== 'undefined') {
    nodeSummaryString += '\nnode.linkCount = ' + node.linkCount;
  }

  return nodeSummaryString.trim();
};

var removeOldFiles = function () {

  // fse.removeSync(writeJsonOutputDebuggingDirectory);
  //if (!useLocalNarrativeFiles) {
  //  fse.removeSync(__dirname + '/../data/narrative_summaries/');
  //  fse.mkdirs(__dirname + '/../data/narrative_summaries/');
  // }
  // fse.removeSync(__dirname + '/../data/narrative_lists/');
  // fse.removeSync(htmlDataPath);   // deletes /data/output/data_committee.json
  // re-create deleted directories
  // fse.mkdirs(writeJsonOutputDebuggingDirectory);
  // fse.mkdirs(__dirname + '/../data/narrative_lists/');
};

var rotateLogFile = function (logFileNameAndPath) {
  var logFileNameAndPath2 = logFileNameAndPath || __dirname + '/../log/consolidated.log';
  rotate(logFileNameAndPath2, {count: 11}, function (err) {
    if (err) {
      logger.error('\n ', __filename, __line, '; Error: ', err);
    }
    // ls ./ => test.log test.log.0 test.log.1
  });
  if (consoleLog) {
//    logger.debug('\n ', __filename, __line, '; Phase #:', ++functionCount, '; logFileNameAndPath2 = ', logFileNameAndPath2);
  }
};

var sortArrayOfStrings = function (arrayOfStrings) {
  arrayOfStrings.sort(function (stringA, stringB) {
    if (stringA > stringB) {
      return 1;
    }
    if (stringA < stringB) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
};

// write data to a local file
// works for XML files
var syncWriteMyFile = function (data, localFileNameAndPath, fsOptions) {
  try {
    fse.writeFileSync(localFileNameAndPath, data, fsOptions);
  } catch (err) {
    logger.error(__filename, 'line', __line, '; Error: ', err, '; localFileNameAndPath = ', localFileNameAndPath, getStackTrace(err));
  }
};

var testLogging = function () {
  logger = require('./tracer-logger-config.js').logger;
//  app = require('./app.js');
//  logger = logger;
  logger.debug(__filename, 'line', __line, '; logModulus = ', logModulus);
  logger.trace('hello', 'world');
  logger.error('Intentional error for testing; hello %s %d %j', 'world', 123, {foo: 'bar'}, [1, 2, 3, 4], Object);
};

var truncateStringToFirstNumChars = function (inString, truncateToFirstNumChars) {
  return ['; [TRUNCATED]:\n', inString.substring(0, truncateToFirstNumChars), ' ... [LOG OUTPUT INTENTIONALLY TRUNCATED TO FIRST ', truncateToFirstNumChars, ' CHARACTERS]\n'].join('');
};

/*
// remove all CR, newline and tab characters from the narrative file
// remove &nbsp;, all slanty apostrophes and quote marks
// replace any occurrence of two or more space characters with one space character
function trimNarrative(narrWebPageString, url) {
  var narrative4 = narrWebPageString.replace('’', "'");
  var narrative7 = narrative4.replace(/([\r\n\t])/gm, ' ');
  var narrative10 = narrative7.replace(/(\s{2,})/gm, ' ');
  // remove paragraphs containing non-breaking space; they mess up the rendered page by adding too many blank lines
  var narrative13 = narrative10.replace(/<p>&nbsp;<\/p>/gmi, '');
  var narrative16 = narrative13.replace(/&nbsp;/gmi, ' ');
  var narrative18 = narrative16.replace(/[^\x00-\x7F]/g, '');
  // extract main content from web page; omit head, footer, etc.
  var narrative19 = narrative18.replace(/(.*NARRATIVE SUMMARIES OF REASONS FOR LISTING<\/h3>)(.*?)(<!-- TemplateEndEditable.*)/mi, '$2');
  // special regex for NSQE00401E.shtml, AL QAIDA, narrative page.
  var narrative35 = narrative19.replace(/(.*NARRATIVE SUMMARIES OF REASONS FOR LISTING<\/h3>)(.*?)(<\/div>\s*<div id="footer".*)/mi, '$2');
  // make hyperlink
  var narrative40 = narrative35.replace(/(<u>)(.*?)(<\/u>)/gmi, '<a href=\'' + url + '\' target=\'_blank\'>$1$2$3<\/a>');
  var narrative41 = narrative40.replace(/[^\x00-\x7F]/g, '');

  var narrative42 = narrative41.replace(/(<p>In accordance with paragraph 14 of resolution 1844 (2008), the Security Council Committee pursuant to resolution 751 \(1992\) and 1907 \(2009\) concerning Somalia and Eritrea makes accessible a narrative summary of reasons for the listing for individuals and entities included on the 1844 Sanctions List\.<\/p>)/gmi, '');
  var narrative43 = narrative42.replace(/(<p>In accordance with paragraph 1 \(b\) of the Guidelines for the application of paragraphs 19 and 23 of resolution 1483 \(2003\), the Security Council Committee established pursuant to resolution 1518 \(2003\) concerning Iraq makes accessible a narrative summary of reasons for the listing for individuals and entities included in the sanctions list\.<\/p>)/gmi, '');

  var re = /(<p>In accordance with paragraph.*?sanctions list\.<\/p>)/gmi;
  var subs = '';

  var narrative50 = narrative43.replace(re, subs);

  var tail = narrative50.substring(narrative50.length - 120, narrative50.length);
  var tailOmitsChars = (narrative50.length - tail.length);
  return narrative50.trim();
}
*/

// remove all CR, newline and tab characters from the narrative file
// remove &nbsp;, all slanty apostrophes and quote marks
// replace any occurrence of two or more space characters with one space character
function trimNarrative2(narrWebPageString, url) {
  var narrative = narrWebPageString.replace('’', "'");
  narrative = narrative.replace(/([\r\n\t])/gm, ' ');
  narrative = narrative.replace(/(\s{2,})/gm, ' ');
  // remove paragraphs containing non-breaking space; they mess up the rendered page by adding too many blank lines
  narrative = narrative.replace(/<p>&nbsp;<\/p>/gmi, '');
  narrative = narrative.replace(/&nbsp;/gmi, ' ');
  narrative = narrative.replace(/[^\x00-\x7F]/g, '');
  // extract main content from web page; omit head, footer, etc.
  narrative = narrative.replace(/(.*NARRATIVE SUMMARIES OF REASONS FOR LISTING<\/h3>)(.*?)(<!-- TemplateEndEditable.*)/mi, '$2');
  // special regex for NSQE00401E.shtml, AL QAIDA, narrative page.
  narrative = narrative.replace(/(.*NARRATIVE SUMMARIES OF REASONS FOR LISTING<\/h3>)(.*?)(<\/div>\s*<div id="footer".*)/mi, '$2');

  // make hyperlink
  narrative = narrative.replace(/(<u>)(.*?)(<\/u>)/gmi, '<a href=\'' + url + '\' target=\'_blank\'>$1$2$3<\/a>');
  narrative = narrative.replace(/[^\x00-\x7F]/g, '');
  narrative = narrative.replace(/(<h2> <\/h2>)/gmi, '');
  narrative = narrative.replace(/(<p>  <\/p>)/gmi, '');

  var narrative = narrative.replace(/(<p>In accordance with paragraph 14 of resolution 1844 (2008), the Security Council Committee pursuant to resolution 751 \(1992\) and 1907 \(2009\) concerning Somalia and Eritrea makes accessible a narrative summary of reasons for the listing for individuals and entities included on the 1844 Sanctions List\.<\/p>)/gmi, '');
  var narrative = narrative.replace(/(<p>In accordance with paragraph 1 \(b\) of the Guidelines for the application of paragraphs 19 and 23 of resolution 1483 \(2003\), the Security Council Committee established pursuant to resolution 1518 \(2003\) concerning Iraq makes accessible a narrative summary of reasons for the listing for individuals and entities included in the sanctions list\.<\/p>)/gmi, '');

  var re = /(<p>In accordance with paragraph.*?sanctions list\.<\/p>)/gmi;
  var subs = '';
  var narrative = narrative.replace(re, subs);

  var tail = narrative.substring(narrative.length - 120, narrative.length);
  var tailOmitsChars = (narrative.length - tail.length);
  return narrative.trim();
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

var showObjectProperties = function (object) {
  var propValue;
  for (var propName in object) {
    propValue = object[propName];
    console.log(propName, ': ', propValue);
  }
};

var throwCustomError = function (name, message) {
  throw {
    name: name || 'customError',
    message: message || 'custom error thrown'
  };
};

var writeMyFile = function (localFileNameAndPath, data_xml_json, fsOptions) {
  try {
    fse.writeFileSync(localFileNameAndPath, data_xml_json, fsOptions);
  } catch (err) {
    logger.error(__filename, 'line', __line, ' Error: ', err);
  }
};

module.exports = {
  addFileLabel: addFileLabel,
  countLinks: countLinks,
  errorPageReturned: errorPageReturned,
  forceUnicodeEncoding: forceUnicodeEncoding,
  formatMyDate: formatMyDate,
  generateNarrFileName: generateNarrFileName,
  generateNarrFileNameFromId: generateNarrFileNameFromId,
  getCleanId: getCleanId,
  getStackTrace: getStackTrace,
  logModulus: logModulus,
  // logger: logger,
  nodeSummary: nodeSummary,
  pad: pad,
  removeOldFiles: removeOldFiles,
  rotateLogFile: rotateLogFile,
  showObjectProperties: showObjectProperties,
  stringifyAndWriteJsonDataFile: stringifyAndWriteJsonDataFile,
  syncWriteMyFile: syncWriteMyFile,
  testLogging: testLogging,
  throwCustomError: throwCustomError,
  // trimNarrative: trimNarrative,
  trimNarrative2: trimNarrative2,
  truncateToNumChars: truncateToNumChars,
  validateUrl: validateUrl
};

