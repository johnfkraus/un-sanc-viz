// js/libs/logger.js
//================
var fs = require('fs');
var sysDate = new Date();
var illegalLogFileName = 'log/aq-list-viz-' + new Date()
    .toDateString()+ '-' + sysDate.toTimeString()+ '.log';
console.log('logger.js illegalLogFileName = ', illegalLogFileName);
var legalLogFileName1 = illegalLogFileName.replace(':','-');
console.log('logger.js legalLogFileName = ', legalLogFileName1);
var legalLogFileName2 = legalLogFileName1.replace(' ','_');
var legalLogFileName3 = legalLogFileName2 + '.log';
var filename = legalLogFileName3; //
// 'log/aq-list-viz' + new Date()
//    .toDateString()+  sysDate.toTimeString()+ '.log';
var last_message = {
  date: null,
  time: null,
  msg: null,
  level: 'debug'
};

var log_message = function (message, level) {
  if (null == level) {
    level = 'debug';
  }
  // var sysDate = new Date();

  last_message = {
    date: new Date()
      .toDateString(),
    time: sysDate.toTimeString(),
    msg: message,
    level: level
  };
  var log = '[ ' + last_message.date + ' ] [ ' + last_message.time + ' ] [ ' + last_message.level + ' ] ' + last_message.msg;

  fs.appendFile(filename, log + "\n", function (err) {
    if (err) {
      throw err;
    } else {
      console.log("logger.js says", log);
    }
  });
};

var get_last_message = function () {
  return last_message;
};

module.exports = {
  log_message: log_message,
  get_last_message: get_last_message
};