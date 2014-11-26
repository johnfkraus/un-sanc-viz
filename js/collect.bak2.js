if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}


define(['require', 'async', 're', 'fs', 'util', 'dateFormat', 'parseString'], function(require) {
  var async = require('async'),
    re = require('request-enhanced'),
    fs = require('fs'),
    util = require('util'),
    dateFormat = require('dateformat'),
    parseString = require('xml2js')
      .parseString;

  return function() {

    String.prototype.trunc = String.prototype.trunc ||
      function(n) {
        return this.length > n ? this.substr(0, n - 1) + '&hellip,' : this;
    };
    require('console-stamp')(console, '[HH:MM:ss.l]');
    // dateFormat.masks.hammerTime = 'yyyy-mm-dd-HHMMss';
    Object.defineProperty(global, '__stack', {
      get: function() {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack) {
          return stack;
        };
        var err = new Error();
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
      }
    });

    Object.defineProperty(global, '__line', {
      get: function() {
        return __stack[1].getLineNumber();
      }
    });

    require('console-stamp')(console, '[HH:MM:ss.l]');

    var now = new Date();
    dateFormat.masks.hammerTime = 'yyyy-mm-dd-HHMMss';
    var fileDateString = dateFormat(now, "hammerTime");
    var xmlCollectedFileName = '/home/codio/workspace/data/xml/AQ-' + fileDateString + '.xml';

    var aqFilePath = "http://www.un.org/sc/committees/1267/AQList.xml";

    xmlStandardFileName = '/home/codio/workspace/data/xml/AQList.xml';

    options = {
      flags: 'r+',
      encoding: 'utf-8',
      autoClose: true
    };

    outputFileName = "/home/codio/workspace/data/xml/AQ-" + fileDateString + '.xml';

    xmlToJson = function(data) {
      // var xml = "<root>Hello xml2js!</root>";
      parseString(data, {
        async: 'true',
        attrNameProcessors: 'nameToUpperCase'
      }, function(err, result) {
        console.dir("76 xmlToJson = \n", result);
      });

    };

    return {

      async: {
        series: [
          function() {
            re.get("http://www.un.org/sc/committees/1267/AQList.xml", "/home/codio/workspace/data/xml/AQList.xml", function(error, filename) {
              if(error) {
                console.log("62 error!!! \n" + error);
              }
              console.log('64 Saved content to: \n', filename);
            });
          },
          function() {
            var xmlData = re.get("http://www.un.org/sc/committees/1267/AQList.xml", function(error, data) {
              if(error) {
                console.log("70 error!!! \n" + error);
              }
              console.log('72 Fetched from ', aqFilePath, '\n and saved to data, data.toString() = \n', data.toString()
                .trunc(999));
            });
          },
          function() {
            parseString(data.toString(), {
                async: 'true',
                attrNameProcessors: 'nameToUpperCase'
              },
              function(err, result) {
                console.dir("76 xmlToJson = \n", result);
              });
          },
          function() {
            request
              .get(aqFilePath)
              .on('error', function(err) {
                console.log("88 Error: ", err);
              })
              .pipe(fs.createWriteStream(outputFileName));

          },
          function() {
            request
              .get(aqFilePath)
              .on('error', function(err) {
                console.log("101 Error: ", err);
              })
              .pipe(fs.createWriteStream("/home/codio/workspace/data/xml/AQList.xml"));
          },
          function() {
            fs.readFileSync("/home/codio/workspace/data/xml/AQList.xml", options, function(err, data) {
              console.log("102 data = \n", data.toString()
                .trunc(999));
              console.log("120 data.inspect = \n", data.inspect);
            });
          },
          function() {
            try {
              var fr = fs.readFileSync("/home/codio/workspace/data/xml/AQList.xml", options);
              console.log("127 aq-request file read = \n", fr.toString()
                .trunc(888));
            } catch(e) {
              console.log('129 Error: ', e);
            }
          },
          function() {

            try {
              fs.writeFileSync(outputFileName, modifiedFile, options);
              console.log("125 file written");
            } catch(e) {
              console.log('127 Error: ', e);
            }

          }
        ]
      }
    };
  };
});