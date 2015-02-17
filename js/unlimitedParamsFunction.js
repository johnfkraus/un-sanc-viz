// unlimitedParamsFunction.js
var fsOptions = {
  flags: 'r+', encoding: 'utf-8', autoClose: true
};
var fse = require('fs-extra');
var dateFormat = require('dateformat');
var linenums = require('./linenums.js');
// var __line = __line || {};
var consoleLog = true;
require('console-stamp')(console, '[HH:MM:ss.l]');
var logger = require('./libs/logger.js');
var message;
function forceUnicodeEncoding(string) {
  return unescape(encodeURIComponent(string));
}

var Args = require("vargs").Constructor;

var example2 = function () {
  var args = new Args(arguments);
  return args; //.callback.apply({},args.all);
};

// example2("The first parameter", console.log);
console.log(__line, example2("The first parameter", "and second parameter", null));
// example2("The first parameter", "and second parameter", "and third parameter", console.log);
console.log(__line, example2("The first parameter", "and second parameter", "and third parameter", "etc", null));

/*
 var example = function () {
 var args = new Args(arguments);
 args.callback.apply({},args.all);
 };

 example("The first parameter", console.log);
 example("The first parameter", "and second parameter", console.log);
 example("The first parameter", "and second parameter", "and third parameter", console.log);
 example("The first parameter", "and second parameter", "and third parameter", "etc", console.log);
 */