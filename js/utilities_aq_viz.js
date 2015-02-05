/* utilities_aq_vis.js */

var fse = require('fs-extra');

function forceUnicodeEncoding(string) {
  return unescape(encodeURIComponent(string));
}

// parameter 'narrFileName' only provides information for debugging
function trimNarrative(narrWebPageString, narrFileName) {
  var narrativeTrimError;
  // remove all CR, newline and tab characters
  var narrative1 = narrWebPageString.replace(/([\r\n\t])/gm, ' ');
  // replace any occurrence of two or more space characters with one space character
  var narrative2 = narrative1.replace(/(\s{2,})/gm, ' ');
  // extract main content from web page; omit head, footer, etc.
  var narrative3 = narrative2.replace(/(.*>=?NARRATIVE SUMMARIES OF REASONS FOR LISTING<\/h3>)(.*)(<div id='footer'>.*)/mi, '$2');
  var tail = narrative3.substring(narrative3.length - 120, narrative3.length);
  if (narrative3.length === narrative2.length) {
    console.log('\n ', __filename, 'line', __line, '; tail = [EARLIER CONTENT INTENTIONALLY OMITTED]', tail);
    console.log('\n ', __filename, 'line', __line, '\nnarrFileName = ', narrFileName, '\nnarrative1.length = ', narrative1.length, '\nnarrative2.length = ', narrative2.length, '\nnarrative3.length = ', narrative3.length, '\ntail.length = ', tail.length, '\nnarrative3 = ', narrative3);
    throw narrativeTrimError;
  }
  return narrative3;
}

// write data to a local file
var syncWriteMyFile = function (localFileNameAndPath, data, fsOptions) {
  try {
    fse.writeFileSync(localFileNameAndPath, data, fsOptions);
  } catch (err) {
    console.log('\n ', __filename, 'line', __line, '; Error: ', err);
  }
};

module.exports = {
  forceUnicodeEncoding: forceUnicodeEncoding,
  trimNarrative: trimNarrative,
  syncWriteMyFile: syncWriteMyFile

};
