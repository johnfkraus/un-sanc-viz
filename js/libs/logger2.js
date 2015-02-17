// js/libs/logger.js
//================
var fs = require('fs');

var filename = 'log/aq-list-viz.log';
var last_message = {
  date: null,
  msg: null,
  level: 'debug'
};

var log_message = function (message, level) {
  if (null == level) {
    level = 'debug';
  }
  last_message = {
    date: new Date()
      .toDateString(),
    msg: message,
    level: level
  };
  var log = '[ ' + last_message.date + ' ] [ ' + last_message.level + ' ] ' + last_message.msg;

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