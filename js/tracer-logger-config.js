var fse = require('fs-extra');

var sysDate = new Date();
var sysDateString = sysDate.toDateString().replace(/ /g, '_');
var sysTimeString = sysDate.toTimeString().replace(/:/g, '-').substring(0,8);

var generateFileNameAndPath = function () {
  var legalLogFileName = __dirname + '/../log/aq-list-viz-' + sysDateString + '-' + sysTimeString + '.log';
  console.log(__filename, 'line', __line, '; method: generateFileNameAndPath() legalLogFileName = ', legalLogFileName);
  return legalLogFileName.trim();
};

var logFileNameAndPath = logFileNameAndPath || generateFileNameAndPath();

var logger = require('tracer').console({
  transport : function(data) {
    console.log(data.output);
    // fse.open('./log/file.log', 'a', 0666, function(e, id) {
    fse.open( logFileNameAndPath, 'a', 0666, function(e, id) {
      fse.write(id, data.output+"\n", null, 'utf8', function() {
        fse.close(id, function() {
        });
      });
    });
  }
});


module.exports = {
  logger: logger
};


