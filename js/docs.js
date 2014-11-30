// docs.js
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
var markdown = require('gulp-markdown');
var fileExists = require('file-exists');

var async = require('async'),
  re = require('request-enhanced'),
  request = require('request'),
  fse = require('fs-extra'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect');
// jsonpatch = require('json-patch'),
//parseString = require('xml2js')
// .parseString;
var truncateToNumChars = 400;
var counter = 0;
var numObjectsToShow = 2;
var data;
var generatedFileDateString;
// var backbone =  require('backbone');
var Set = require("backpack-node").collections.Set;
var Bag = require("backpack-node").collections.Bag;
//console.log("\n __dirname = ", __dirname + '\n');
// var counter = 0;

var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};

var jsonFile = "";
var getJsonFile = function () {
  return jsonFile;
};
var dateGenerated;
// var data;
// data.nodes = [];
var consoleLog = true;

var get_html_docs = function () {
  if (consoleLog) {
    console.log("\n ", __filename, "line", __line, "; running docs.get_html_docs()");
  }
  var data = {};
  var config;
  var functionCount = 0;
  // var nodes = [];
  var newData = {};
  var aliases;
  var comments = "";
  var links = [];
  var connectedToId;
  var aliasCount = 0;
  var aliasArray = [];
  var linkRegexMatch;
  var connection;
  var source;
  var target;
  var missing_ents;
  var missing_indivs;
  var ents = [];
  var indivs = [];

  async.series([
    function (callback) {
      // read json file containing nodes and links
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
      }
      var cleanJsonFileName = __dirname + "/../data/output/AQList-clean.json";
      var buffer = fse.readFileSync(cleanJsonFileName); //, fsOptions); //, function (err, data) {
      data = JSON.parse(buffer);
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; data read from: \n", cleanJsonFileName);
        console.log("\n ", __filename, "line", __line, "; data = \n", trunc.truncn(JSON.stringify(data), 200));
      }
      callback();
    },
    function (callback) {
      // read json file containing config
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
      }
      var configJsonFileName = __dirname + "/../data/output/config.json";
      var buffer = fse.readFileSync(configJsonFileName); //, fsOptions); //, function (err, data) {
      config = JSON.parse(buffer);
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; config data read from: \n", configJsonFileName);
        console.log("\n ", __filename, "line", __line, "; config = \n", trunc.truncn(JSON.stringify(config), 200));
      }
      callback();
    },

    function (callback) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
      }
      newData.nodes = getHTMLDocs(data.nodes, config);
      data = newData;
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; data + html = \n", trunc.truncn(JSON.stringify(data), 200));
      }
      callback();
    },
    function (callback) {
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
      }
      var jsonWithDocsFileName = __dirname + "/../data/output/AQList-docs.json";
      data = newData; // = getHTMLDocs(JSON.stringify(data));
      saveJsonFile(data, jsonWithDocsFileName);
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, "; data + html = \n", trunc.truncn(JSON.stringify(data), 200));
      }
      callback();
    },

    function (callback) {
      var dummy = function () {
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount);
        }
        if (consoleLog) {
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
    var docFileName = "data/" + name + ".mkdn";
    var type = node.type;
    if (config['types'][type]) {
      type = config['types'][type]['long'];
    }
    var markdownContent = "## name *type*\n\n";
    if (fileExists(docFileName)) {
      // if (file_exists(docFilename)) {
      markdownContent += "### Documentation\n\n";
      markdownContent += file_get_contents(docFileName);

    } else {
      markdownContent += "<div class=\"alert alert-warning\">35 No documentation for this object</div>";

    }

    if (node) {
      // error_log("\n46 file exists,  obj = 'obj'", 3, "my-errors.log");
      markdownContent += "\n\n";
      markdownContent += get_depends_markdown('Depends on', node['depends']);
      markdownContent += get_depends_markdown('Depended on by', node['dependedOnBy']);

    }

    // Use {{object_id}} to link to an object
    var arr = explode('{{', markdownContent);
    markdownContent = arr[0];
    var i, pieces, name, id_string, name_esc, clazz, errors = [];
    for (i = 1; i < arr.length; i++) {
      pieces = explode('}}', arr[i], 2);
      name = pieces[0];
      id_string = get_id_string(name);
      name_esc = str_replace('_', '\_', name);
      clazz = 'select-object';
      if (!(isset(data[name]))) {
        clazz += ' missing';
        if (consoleLog) {
          console.log("\n ", __filename, "line", __line, "; ", arr.name, " links to unrecognized object ", name);
        }
      }
      markdownContent += "<a href=\"#id_string\" class=\"class\" data-name=\"name\">name_esc</a>";
      markdownContent += pieces[1];
      if (consoleLog) {
        console.log("\n ", __filename, "line", __line, ";  markdownContent = ", markdownContent);
      }
    }

    html = markdownToHTML(markdownContent);
    // IE can't handle <pre><code> (it eats all the line breaks)
    html = str_replace('<pre><code>', '<pre>', html);
    html = str_replace('</code></pre>', '</pre>', html);
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, "; html = ", html);
    }
    node.docs = html;
//    return html;
  })
};

var get_depends_markdown = function (header, arr) {
  // echo 'debug_view($header) = ';
  // debug_view($header);
  //      echo 'debug_view($arr) = ';
  // debug_view($arr);
  markdownContent = "### $header";
  if ((arr) && ((typeof arr) === 'Array') && count(arr)) {
    markdownContent += "\n\n";
    arr.forEach(function (name) {
      markdownContent += "* {{" + name + "}}\n";
    });
    // foreach (arr as name) {
    //     markdownContent += "* {{"+name+  "}}\n";
    //  }
    markdownContent += "\n";
  } else {
    markdownContent += " *(none)*\n\n";
  }
  return markdownContent;
}

/*
 function get_id_string($name) {
 return 'obj-' . preg_replace('@[^a-z0-9]+@i', '-', $name);
 }


 function read_config() {
 global $config, $dataset, $dataset_qs;

 $config = json_decode(file_get_contents("data/$dataset/config.json" ), true);
 $config['jsonUrl'] = "json.php$dataset_qs";
 }
 /*
 function read_data() {
 global $config, $data, $dataset, $errors;

 if (!$config) read_config();

 $json   = json_decode(file_get_contents("data/$dataset/objects.json"), true);
 $data   = array();
 $errors = array();

 foreach ($json as $obj) {
 $data[$obj['name']] = $obj;
 }

 foreach ($data as &$obj) {
 $obj['dependedOnBy'] = array();
 }
 unset($obj);
 foreach ($data as &$obj) {
 // echo '117 debug_view($data)';
 // echo dbug('print');
 // debug_view($data);
 // debug_view("116 $data = " + $data);
 // echo '121 debug_view($obj)';
 // debug_view($obj);

 if (!empty($obj['depends']) && ( is_array( $obj['depends']))) {

 foreach ($obj['depends'] as $name) {
 if ($data[$name]) {
 $data[$name]['dependedOnBy'][] = $obj['name'];
 } else {
 $errors[] = "137 Unrecognized dependency: '$obj[name]' depends on '$name'";
 error_log("\n141 Unrecognized dependency: '$obj[name]' depends on '$name'", 3, "my-errors.log");

 }
 }
 } else {
 $errors[] = "148 Unrecognized dependency: '$obj[name]' depends on '$name'";
 error_log("\n149 Unrecognized dependency: '$obj[name]' depends on '$name'", 3, "my-errors.log");
 }
 }
 unset($obj);
 foreach ($data as &$obj) {
 $xx = get_html_docs($obj);

 $obj['docs'] = $xx;
 //get_html_docs($obj);
 // $xx = $obj['docs'];

 error_log("\n167 obj [ docs ] = get_html _docs ( obj ) = '$xx'", 3, "my-errors.log");

 }
 unset($obj);
 }
 */
/*
 function debug_view ( $what ) {
 echo '<pre>';
 if ( is_array( $what ) )  {
 print_r ( $what );
 } else {
 var_dump ( $what );
 }
 echo '</pre>';
 }


 /**
 * dbug (mixed $expression [, mixed $expression [, $... ]])
 * Author : dcz
 * Feel free to use as you wish at your own risk ;-)
 */

/*
 function dbug() {
 static $output = '', $doc_root;
 $args = func_get_args();
 if (!empty($args) && $args[0] === 'print') {
 $_output = $output;
 $output = '';
 return $_output;
 }
 // do not repeat the obvious (matter of taste)
 if (!isset($doc_root)) {
 $doc_root = str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT']);
 }
 $backtrace = debug_backtrace();
 // you may want not to htmlspecialchars here
 $line = htmlspecialchars($backtrace[0]['line']);
 $file = htmlspecialchars(str_replace(array('\\', $doc_root), array('/', ''), $backtrace[0]['file']));
 $class = !empty($backtrace[1]['class']) ? htmlspecialchars($backtrace[1]['class']) . '::' : '';
 $function = !empty($backtrace[1]['function']) ? htmlspecialchars($backtrace[1]['function']) . '() ' : '';
 $output += "<b>$class$function =&gt;$file #$line</b><pre>";
 ob_start();
 foreach ($args as $arg) {
 var_dump($arg);
 }
 $output += htmlspecialchars(ob_get_contents(), ENT_COMPAT, 'UTF-8');
 ob_end_clean();
 $output += '</pre>';
 }
 */

var saveJsonFile = function (jsonData, fileName) {
/// if (consoleLog) { console.log("\n ", __filename, "line", __line, "; function #:", ++functionCount, "; save clean json file");
// var saveJson = function () {
  try {
    var myFile = fileName; //__dirname + "/../data/output/" + fileName;
    // var myJsonData = JSON.stringify(jsonData, null, " ");
    // if (consoleLog) { console.log("myJsonData =", myJsonData);
    fse.writeFileSync(myFile, myJsonData, fsOptions);
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, ";  file written to: ", myFile);
    }
    if (consoleLog) {
      console.log("\n ", __filename, "line", __line, ";  file contained: ", trunc.n400(util.inspect(myJsonData, false, null)));
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
}

var str_replace = function (search, replace, subject, count) {
  //  discuss at: http://phpjs.org/functions/str_replace/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Gabriel Paderni
  // improved by: Philip Peterson
  // improved by: Simon Willison (http://simonwillison.net)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Onno Marsman
  // improved by: Brett Zamir (http://brett-zamir.me)
  //  revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // bugfixed by: Anton Ongson
  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Oleg Eremeev
  //    input by: Onno Marsman
  //    input by: Brett Zamir (http://brett-zamir.me)
  //    input by: Oleg Eremeev
  //        note: The count parameter must be passed as a string in order
  //        note: to find a global variable in which the result will be given
  //   example 1: str_replace(' ', '.', 'Kevin van Zonneveld');
  //   returns 1: 'Kevin.van.Zonneveld'
  //   example 2: str_replace(['{name}', 'l'], ['hello', 'm'], '{name}, lars');
  //   returns 2: 'hemmo, mars'

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
}

function isset() {
  //  discuss at: http://phpjs.org/functions/isset/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: FremyCompany
  // improved by: Onno Marsman
  // improved by: Rafał Kukawski
  //   example 1: isset( undefined, true);
  //   returns 1: false
  //   example 2: isset( 'Kevin van Zonneveld' );
  //   returns 2: true

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
  // http://kevin.vanzonneveld.net
  // +   original by: Enrique Gonzalez
  // +      input by: Jani Hartikainen
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // %        note 1: This function uses XmlHttpRequest and cannot retrieve resource from different domain.
  // %        note 1: Synchronous so may lock up browser, mainly here for study purposes.
  // *     example 1: file_exists('http://kevin.vanzonneveld.net/pj_test_supportfile_1.htm');
  // *     returns 1: '123'
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
}

function file_get_contents(url, flags, context, offset, maxLen) {
  //  discuss at: http://phpjs.org/functions/file_get_contents/
  // original by: Legaev Andrey
  //    input by: Jani Hartikainen
  //    input by: Raphael (Ao) RUDLER
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Brett Zamir (http://brett-zamir.me)
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  //        note: This function uses XmlHttpRequest and cannot retrieve resource from different domain without modifications.
  //        note: Synchronous by default (as in PHP) so may lock up browser. Can
  //        note: get async by setting a custom "phpjs.async" property to true and "notification" for an
  //        note: optional callback (both as context params, with responseText, and other JS-specific
  //        note: request properties available via 'this'). Note that file_get_contents() will not return the text
  //        note: in such a case (use this.responseText within the callback). Or, consider using
  //        note: jQuery's: $('#divId').load('http://url') instead.
  //        note: The context argument is only implemented for http, and only partially (see below for
  //        note: "Presently unimplemented HTTP context options"); also the arguments passed to
  //        note: notification are incomplete
  //        test: skip
  //   example 1: var buf file_get_contents('http://google.com');
  //   example 1: buf.indexOf('Google') !== -1
  //   returns 1: true

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

  if ((flagNames & OPTS.FILE_USE_INCLUDE_PATH) && ini.include_path && ini.include_path.local_value) {
    var slash = ini.include_path.local_value.indexOf('/') !== -1 ? '/' : '\\';
    url = ini.include_path.local_value + slash + url;
  } else if (!/^(https?|file):/.test(url)) { // Allow references within or below the same directory (should fix to allow other relative references or root reference; could make dependent on parse_url())
    href = this.window.location.href;
    pathPos = url.indexOf('/') === 0 ? href.indexOf('/', 8) - 1 : href.lastIndexOf('/');
    url = href.slice(0, pathPos + 1) + url;
  }

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
      this.$http_response_header = headers; // see http://php.net/manual/en/reserved.variables.httpresponseheader.php
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

var markdownToHTML = function (inputFileName, outputFileName) {
  gulp.task('default', function () {
    return gulp.src('inputFileName')
      .pipe(markdown())
      .pipe(gulp.dest('dist'));
  });
}

module.exports = {
  get_html_docs: get_html_docs
};

