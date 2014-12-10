// makeDocs.js
// add html to nodes
//==========================

// require_once 'markdown/Markdown.inc.php';
// use \Michelf\Markdown;
root = typeof exports !== "undefined" && exports !== null ? exports : this;
if (typeof define !== 'function') {
  var define = require('amdefine');
}
var markdownContent;
var logger = require('./libs/logger.js');
var trunc = require('./trunc.js');
var gulp = require('gulp');
// var markdown = require( "markdown" ).markdown;
// var markdown = require('gulp-markdown');
var md = require("markdown").markdown;
var fileExists = require('file-exists');
var async = require('async'),
  re = require('request-enhanced'),
  request = require('request'),
  fse = require('fs-extra'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect');
// var truncateToNumChars = 400;
var counter = 0;
// var numObjectsToShow = 2;
var data = {};
var nodes;
// var generatedFileDateString;
var Set = require("backpack-node").collections.Set;
// var Bag = require("backpack-node").collections.Bag;
var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};
var jsonFile = "";
var html = "";
var dateGenerated;
var consoleLog = false;

var get_html_docs = function () {
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, "; running docs.get_html_docs()");
  }
  var config;
  var functionCount = 0;
  var newData = {};
  var links = [];

  async.series([
    function (callback) {
      // read json file containing nodes and links
      var cleanJsonFileName = __dirname + "/../data/output/AQList-clean.json";
      var buffer = fse.readFileSync(cleanJsonFileName); //, fsOptions); //, function (err, data) {
      data = JSON.parse(buffer);
      delete data.ents;
      delete data.indivs;
      delete data.ENTITIES;
      delete data.INDIVIDUALS;
      delete data.$;

      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
        console.log("\n ", __filename, "line", __line, "; data read from: \n", cleanJsonFileName);
        console.log("\n ", __filename, "line", __line, "; data = \n", trunc.truncn(JSON.stringify(data), 200));
      }
      callback();
    },

    function (callback) {
      // var jsonData = JSON.stringify(data);
      saveJsonFile(JSON.stringify(data, null, " "), "./data/output/data31deleteEntsEtc.json");
      callback();
    },

    function (callback) {
      // read json file containing config
      var configJsonFileName = __dirname + "/../data/input/config.json";
      var buffer = fse.readFileSync(configJsonFileName); //, fsOptions); //, function (err, data) {
      config = JSON.parse(buffer);
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
        console.log("\n ", __filename, "line", __line, "; config data read from: \n", configJsonFileName);
        console.log("\n ", __filename, "line", __line, "; config = \n", trunc.truncn(JSON.stringify(config), 200));
      }
      callback();
    },

    function (callback) {
      nodes = getHTMLDocs(data.nodes, config);
      data.nodes = nodes;
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
        // console.log("\n ", __filename, "line", __line, "; data + html = \n", trunc.truncn(JSON.stringify(data), 200));
      }
      callback();
    },


    function (callback) {
      var jsonWithDocsFileName = __dirname + "/../data/output/AQList-docs.json";
      // data = newData; // = getHTMLDocs(JSON.stringify(data));
      saveJsonFile(JSON.stringify(data, null, " "), jsonWithDocsFileName);
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
        //  console.log("\n ", __filename, "line", __line, "; data + html = \n", trunc.truncn(JSON.stringify(data), 200));
      }
      callback();
    },
    function (callback) {
      var dummy = function () {
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
          console.log("\n ", __filename, "line", __line, "; last function");
        }
        callback();
      }();
    }]);
};

// create a links array in each entity/indiv containing ids of related parties
var getHTMLDocs = function (nodes, config) {
  nodes.forEach(function (node) {
    var nameId = node.id;
    var markdownFileName = "./data/markdown/" + nameId + ".mkdn";
    var type;
    if (node.indiv0OrEnt1 == 0) {
      node.type = "Individual";
    } else {
      node.type = "Entity";
    }
  //  if (config['types'][type]) {
  //    type = config['types'][type]['long'];
  //  }
    var markdownContent = "## " + node.name + "* ID: " + node.id + "* Type: " + node.type + "\n\n";
    if (fileExists(markdownFileName)) {
      markdownContent += "### Documentation\n\n";
      markdownContent += readFileSync(markdownFileName); //file_get_contents(docFileName);
    } else {
      markdownContent += "<div class=\"alert alert-warning\">No documentation for this object.</div>";
    }
    if (node) {
      // error_log("\n46 file exists,  obj = 'obj'", 3, "my-errors.log");
      markdownContent += "\n\n";
      markdownContent += get_depends_markdown('Linked to', node.linkSetArray);
      // markdownContent += get_depends_markdown('Depended on by', node['dependedOnBy']);
    }
    // Use {{object_id}} to link to an object
/*
    var arr = explode('{{', markdownContent);
    markdownContent = arr[0];
    var i, pieces, name, id_string, name_esc, clazz, errors = [];

    for (i = 1; i < arr.length; i++) {
      pieces = explode('}}', arr[i], 2);
      name = pieces[0];
      id_string = get_id_string(name);
      name_esc = str_replace('_', '\_', name);
      clazz = 'select-object';
      if (!(data.name)) {
        clazz += ' missing';
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; ", arr.name, " links to unrecognized object ", name);
        }
      }
      markdownContent += "<a href='#id_string' class='class' data-name='name'>name_esc</a>";
      markdownContent += pieces[1];
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, ";  markdownContent = ", markdownContent);
      }
    }
    */
    html = mdToHtml(markdownContent); //   markdownToHTML(markdownContent);
    // IE can't handle <pre><code> (it eats all the line breaks)
    html = str_replace('<pre><code>', '<pre>', html);
    html = str_replace('</code></pre>', '</pre>', html);
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, "; html = ", html);
    }
    node.docs = html;
//    return html;
  });
  return nodes;
};
var get_depends_markdown = function (header, linkSetArr) {
  markdownContent = "### " + header;
  if ((linkSetArr) && (linkSetArr.length > 0)) {
    markdownContent += "\n\n";
    linkSetArr.forEach(function (linkId) {
      markdownContent += "* " + linkId + "\n";
    });
    markdownContent += "\n";
  } else {
    markdownContent += " *(none)*\n\n";
  }
  return markdownContent;
};

function get_id_string(name) {
  return 'obj-' + name.replace(/@[^a-z0-9]+@i/g, '-');
}

var saveJsonFile = function (jsonData, fileName) {
  try {
    var myFile = fileName; //__dirname + "/../data/output/" + fileName;
    // var myJsonData = JSON.stringify(jsonData, null, " ");
    // if (consoleLog) { console.log("myJsonData =", myJsonData);
    fse.writeFileSync(myFile, jsonData, fsOptions);
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, ";  file written to: ", myFile);
      console.log("\n ", __filename, "line", __line, ";  file contained: ", trunc.n400(util.inspect(jsonData, false, null)));
    }
  } catch (e) {
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, ";  Error: ", e);
    }
  }
};

// equivalent javascript functions for php functions

var explode = function (delimiter, string, limit) {
  //  discuss at: http://phpjs.org/functions/explode/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //   example 1: explode(' ', 'Kevin van Zonneveld');
  //   returns 1: {0: 'Kevin', 1: 'van', 2: 'Zonneveld'}

  if (arguments.length < 2 || typeof delimiter === 'undefined' || typeof string === 'undefined') return null;
  if (delimiter === '' || delimiter === false || delimiter === null) return false;
  if (typeof delimiter === 'function' || typeof delimiter === 'object' || typeof string === 'function' || typeof string ===
    'object') {
    return {
      0: ''
    };
  }
  if (delimiter === true) delimiter = '1';

  // Here we go...
  delimiter += '';
  string += '';

  var s = string.split(delimiter);

  if (typeof limit === 'undefined') return s;

  // Support for limit
  if (limit === 0) limit = 1;

  // Positive limit
  if (limit > 0) {
    if (limit >= s.length) return s;
    return s.slice(0, limit - 1)
      .concat([s.slice(limit - 1)
        .join(delimiter)
      ]);
  }

  // Negative limit
  if (-limit >= s.length) return [];

  s.splice(s.length + limit);
  return s;
};

var str_replace = function (search, replace, subject, count) {
  var i = 0,
    j = 0,
    temp = '',
    repl = '',
    sl = 0,
    fl = 0,
    f = [].concat(search),
    r = [].concat(replace),
    s = subject,
    ra = Object.prototype.toString.call(r) === '[object Array]',
    sa = Object.prototype.toString.call(s) === '[object Array]';
  s = [].concat(s);
  if (count) {
    this.window[count] = 0;
  }

  for (i = 0, sl = s.length; i < sl; i++) {
    if (s[i] === '') {
      continue;
    }
    for (j = 0, fl = f.length; j < fl; j++) {
      temp = s[i] + '';
      repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
      s[i] = (temp)
        .split(f[j])
        .join(repl);
      if (count && s[i] !== temp) {
        this.window[count] += (temp.length - s[i].length) / f[j].length;
      }
    }
  }
  return sa ? s : s[0];
};

function isset() {
  var a = arguments,
    l = a.length,
    i = 0,
    undef;
  if (l === 0) {
    throw new Error('Empty isset');
  }
  while (i !== l) {
    if (a[i] === undef || a[i] === null) {
      return false;
    }
    i++;
  }
  return true;
}

var file_exists = function (url) {
  var req = this.window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
  if (!req) {
    throw new Error('XMLHttpRequest not supported');
  }
  // HEAD Results are usually shorter (faster) than GET
  req.open('HEAD', url, false);
  req.send(null);
  if (req.status == 200) {
    return true;
  }
  return false;
};

function file_get_contents(url, flags, context, offset, maxLen) {
  var tmp, headers = [],
    newTmp = [],
    k = 0,
    i = 0,
    href = '',
    pathPos = -1,
    flagNames = 0,
    content = null,
    http_stream = false;
  var func = function (value) {
    return value.substring(1) !== '';
  };
  // BEGIN REDUNDANT
  this.php_js = this.php_js || {};
  this.php_js.ini = this.php_js.ini || {};
  // END REDUNDANT
  var ini = this.php_js.ini;
  context = context || this.php_js.default_streams_context || null;

  if (!flags) {
    flags = 0;
  }
  var OPTS = {
    FILE_USE_INCLUDE_PATH: 1,
    FILE_TEXT: 32,
    FILE_BINARY: 64
  };
  if (typeof flags === 'number') { // Allow for a single string or an array of string flags
    flagNames = flags;
  } else {
    flags = [].concat(flags);
    for (i = 0; i < flags.length; i++) {
      if (OPTS[flags[i]]) {
        flagNames = flagNames | OPTS[flags[i]];
      }
    }
  }
  if (flagNames & OPTS.FILE_BINARY && (flagNames & OPTS.FILE_TEXT)) { // These flags shouldn't be together
    throw 'You cannot pass both FILE_BINARY and FILE_TEXT to file_get_contents()';
  }
  /*
   if ((flagNames & OPTS.FILE_USE_INCLUDE_PATH) && ini.include_path && ini.include_path.local_value) {
   var slash = ini.include_path.local_value.indexOf('/') !== -1 ? '/' : '\\';
   url = ini.include_path.local_value + slash + url;
   } else if (!/^(https?|file):/.test(url)) { // Allow references within or below the same directory (should fix to allow other relative references or root reference; could make dependent on parse_url())
   href = this.window.location.href;
   pathPos = url.indexOf('/') === 0 ? href.indexOf('/', 8) - 1 : href.lastIndexOf('/');
   url = href.slice(0, pathPos + 1) + url;
   }
   */
  var http_options;
  if (context) {
    http_options = context.stream_options && context.stream_options.http;
    http_stream = !!http_options;
  }
  if (!context || http_stream) {
    var req = this.window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest();
    if (!req) {
      throw new Error('XMLHttpRequest not supported');
    }
    var method = http_stream ? http_options.method : 'GET';
    var async = !!(context && context.stream_params && context.stream_params['phpjs.async']);
    if (ini['phpjs.ajaxBypassCache'] && ini['phpjs.ajaxBypassCache'].local_value) {
      url += (url.match(/\?/) == null ? '?' : '&') + (new Date())
        .getTime(); // Give optional means of forcing bypass of cache
    }
    req.open(method, url, async);
    if (async) {
      var notification = context.stream_params.notification;
      if (typeof notification === 'function') {
        // Fix: make work with req.addEventListener if available: https://developer.mozilla.org/En/Using_XMLHttpRequest
        if (0 && req.addEventListener) { // Unimplemented so don't allow to get here
          /*
           req.addEventListener('progress', updateProgress, false);
           req.addEventListener('load', transferComplete, false);
           req.addEventListener('error', transferFailed, false);
           req.addEventListener('abort', transferCanceled, false);
           */
        } else {
          req.onreadystatechange = function (aEvt) { // aEvt has stopPropagation(), preventDefault(); see https://developer.mozilla.org/en/NsIDOMEvent
            // Other XMLHttpRequest properties: multipart, responseXML, status, statusText, upload, withCredentials
            /*
             PHP Constants:
             STREAM_NOTIFY_RESOLVE   1       A remote address required for this stream has been resolved, or the resolution failed. See severity  for an indication of which happened.
             STREAM_NOTIFY_CONNECT   2     A connection with an external resource has been established.
             STREAM_NOTIFY_AUTH_REQUIRED 3     Additional authorization is required to access the specified resource. Typical issued with severity level of STREAM_NOTIFY_SEVERITY_ERR.
             STREAM_NOTIFY_MIME_TYPE_IS  4     The mime-type of resource has been identified, refer to message for a description of the discovered type.
             STREAM_NOTIFY_FILE_SIZE_IS  5     The size of the resource has been discovered.
             STREAM_NOTIFY_REDIRECTED    6     The external resource has redirected the stream to an alternate location. Refer to message .
             STREAM_NOTIFY_PROGRESS  7     Indicates current progress of the stream transfer in bytes_transferred and possibly bytes_max as well.
             STREAM_NOTIFY_COMPLETED 8     There is no more data available on the stream.
             STREAM_NOTIFY_FAILURE   9     A generic error occurred on the stream, consult message and message_code for details.
             STREAM_NOTIFY_AUTH_RESULT   10     Authorization has been completed (with or without success).

             STREAM_NOTIFY_SEVERITY_INFO 0     Normal, non-error related, notification.
             STREAM_NOTIFY_SEVERITY_WARN 1     Non critical error condition. Processing may continue.
             STREAM_NOTIFY_SEVERITY_ERR  2     A critical error occurred. Processing cannot continue.
             */
            var objContext = {
              responseText: req.responseText,
              responseXML: req.responseXML,
              status: req.status,
              statusText: req.statusText,
              readyState: req.readyState,
              evt: aEvt
            }; // properties are not available in PHP, but offered on notification via 'this' for convenience
            // notification args: notification_code, severity, message, message_code, bytes_transferred, bytes_max (all int's except string 'message')
            // Need to add message, etc.
            var bytes_transferred;
            switch (req.readyState) {
              case 0:
                //     UNINITIALIZED     open() has not been called yet.
                notification.call(objContext, 0, 0, '', 0, 0, 0);
                break;
              case 1:
                //     LOADING     send() has not been called yet.
                notification.call(objContext, 0, 0, '', 0, 0, 0);
                break;
              case 2:
                //     LOADED     send() has been called, and headers and status are available.
                notification.call(objContext, 0, 0, '', 0, 0, 0);
                break;
              case 3:
                //     INTERACTIVE     Downloading; responseText holds partial data.
                bytes_transferred = req.responseText.length * 2; // One character is two bytes
                notification.call(objContext, 7, 0, '', 0, bytes_transferred, 0);
                break;
              case 4:
                //     COMPLETED     The operation is complete.
                if (req.status >= 200 && req.status < 400) {
                  bytes_transferred = req.responseText.length * 2; // One character is two bytes
                  notification.call(objContext, 8, 0, '', req.status, bytes_transferred, 0);
                } else if (req.status === 403) { // Fix: These two are finished except for message
                  notification.call(objContext, 10, 2, '', req.status, 0, 0);
                } else { // Errors
                  notification.call(objContext, 9, 2, '', req.status, 0, 0);
                }
                break;
              default:
                throw 'Unrecognized ready state for file_get_contents()';
            }
          };
        }
      }
    }

    if (http_stream) {
      var sendHeaders = http_options.header && http_options.header.split(/\r?\n/);
      var userAgentSent = false;
      for (i = 0; i < sendHeaders.length; i++) {
        var sendHeader = sendHeaders[i];
        var breakPos = sendHeader.search(/:\s*/);
        var sendHeaderName = sendHeader.substring(0, breakPos);
        req.setRequestHeader(sendHeaderName, sendHeader.substring(breakPos + 1));
        if (sendHeaderName === 'User-Agent') {
          userAgentSent = true;
        }
      }
      if (!userAgentSent) {
        var user_agent = http_options.user_agent || (ini.user_agent && ini.user_agent.local_value);
        if (user_agent) {
          req.setRequestHeader('User-Agent', user_agent);
        }
      }
      content = http_options.content || null;
      /*
       // Presently unimplemented HTTP context options
       var request_fulluri = http_options.request_fulluri || false; // When set to TRUE, the entire URI will be used when constructing the request. (i.e. GET http://www.example.com/path/to/file.html HTTP/1.0). While this is a non-standard request format, some proxy servers require it.
       var max_redirects = http_options.max_redirects || 20; // The max number of redirects to follow. Value 1 or less means that no redirects are followed.
       var protocol_version = http_options.protocol_version || 1.0; // HTTP protocol version
       var timeout = http_options.timeout || (ini.default_socket_timeout && ini.default_socket_timeout.local_value); // Read timeout in seconds, specified by a float
       var ignore_errors = http_options.ignore_errors || false; // Fetch the content even on failure status codes.
       */
    }

    if (flagNames & OPTS.FILE_TEXT) { // Overrides how encoding is treated (regardless of what is returned from the server)
      var content_type = 'text/html';
      if (http_options && http_options['phpjs.override']) { // Fix: Could allow for non-HTTP as well
        content_type = http_options['phpjs.override']; // We use this, e.g., in gettext-related functions if character set
        //   overridden earlier by bind_textdomain_codeset()
      } else {
        var encoding = (ini['unicode.stream_encoding'] && ini['unicode.stream_encoding'].local_value) ||
          'UTF-8';
        if (http_options && http_options.header && (/^content-type:/im)
            .test(http_options.header)) { // We'll assume a content-type expects its own specified encoding if present
          content_type = http_options.header.match(/^content-type:\s*(.*)$/im)[1]; // We let any header encoding stand
        }
        if (!(/;\s*charset=/)
            .test(content_type)) { // If no encoding
          content_type += '; charset=' + encoding;
        }
      }
      req.overrideMimeType(content_type);
    }
    // Default is FILE_BINARY, but for binary, we apparently deviate from PHP in requiring the flag, since many if not
    //     most people will also want a way to have it be auto-converted into native JavaScript text instead
    else if (flagNames & OPTS.FILE_BINARY) { // Trick at https://developer.mozilla.org/En/Using_XMLHttpRequest to get binary
      req.overrideMimeType('text/plain; charset=x-user-defined');
      // Getting an individual byte then requires:
      // responseText.charCodeAt(x) & 0xFF; // throw away high-order byte (f7) where x is 0 to responseText.length-1 (see notes in our substr())
    }

    try {
      if (http_options && http_options['phpjs.sendAsBinary']) { // For content sent in a POST or PUT request (use with file_put_contents()?)
        req.sendAsBinary(content); // In Firefox, only available FF3+
      } else {
        req.send(content);
      }
    } catch (e) {
      // catches exception reported in issue #66
      return false;
    }

    tmp = req.getAllResponseHeaders();
    if (tmp) {
      tmp = tmp.split('\n');
      for (k = 0; k < tmp.length; k++) {
        if (func(tmp[k])) {
          newTmp.push(tmp[k]);
        }
      }
      tmp = newTmp;
      for (i = 0; i < tmp.length; i++) {
        headers[i] = tmp[i];
      }
      this.http_response_header = headers; // see http://php.net/manual/en/reserved.variables.httpresponseheader.php
    }

    if (offset || maxLen) {
      if (maxLen) {
        return req.responseText.substr(offset || 0, maxLen);
      }
      return req.responseText.substr(offset);
    }
    return req.responseText;
  }
  return false;
}

// console.log( markdown.toHTML( "Hello *World*!" ) );
var markdownToHTML = function (markdownContent) {
  return markdown.toHTML(markdownContent);
};

var markdownToHTML00 = function (markdownContent, outputFileName) {
  var result;
  gulp.task('default', function () {
    result = gulp.src(markdownContent)
      .pipe(markdown())
      .pipe(gulp.dest('./data/output/markdown.mkdn'));
  });
  return result;
};

var XmarkdownToHTML = function (inputFileName, outputFileName) {
  gulp.task('default', function () {
    return gulp.src('inputFileName')
      .pipe(markdown())
      .pipe(gulp.dest('dist'));
  });
};

var readFileSync = function (filePathAndName) {
  // read "raw" unprocessed json file
//  var rawJsonFileName = __dirname + "/../data/output/AQList-raw.json";
  jsonFile = fse.readFileSync(filePathAndName); //, fsOptions); //, function (err, data) {
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, "; jsonFile = \n", trunc.truncn(JSON.stringify(jsonFile), 200));
  }
  return jsonFile;
};

var mdToHtml = function (markdownContent) {

  var text = "[Markdown] is a simple text-based [markup language]\n" +
    "created by [John Gruber]\n\n" +
    "[John Gruber]: http://daringfireball.net";

// parse the markdown into a tree and grab the link references
  var tree = md.parse(markdownContent),
    refs = tree[1].references;

// iterate through the tree finding link references
  (function find_link_refs(jsonml) {
    if (jsonml[0] === "link_ref") {
      var ref = jsonml[1].ref;

      // if there's no reference, define a wiki link
      if (!refs[ref]) {
        refs[ref] = {
          href: "http://en.wikipedia.org/wiki/" + ref.replace(/\s+/, "_")
        };
      }
    }
    else if (Array.isArray(jsonml[1])) {
      jsonml[1].forEach(find_link_refs);
    }
    else if (Array.isArray(jsonml[2])) {
      jsonml[2].forEach(find_link_refs);
    }
  })(tree);

// convert the tree into html
  var html = md.renderJsonML(md.toHTMLTree(tree));
  console.log(html);
  return html;
};

module.exports = {
  get_html_docs: get_html_docs
};

