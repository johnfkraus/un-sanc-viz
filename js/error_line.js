

$(function() {


  var gOldOnError = window.onerror;
// Override previous handler.
  window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
    if (gOldOnError)
    // Call previous handler.
      return gOldOnError(errorMsg, url, lineNumber);

    // Just let default handler run.
    return false;
  }


  window.onerror = function(msg, url, line) {
    $('body').append(msg + ' at ' + url + ':' + line);
  };

  // Handler for .ready() called.
  var stack = new Error().stack;

  var thisline = new Error().lineNumber;
  console.log('thisline = ' , thisline);

});

///
//
// console.log('filename: error_line.js, line: ', (new Error).lineNumber ,'; Error null target id where l.source.id = ');

// If that doesn't work in whatever environment you're using, you can try:


