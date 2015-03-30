// Programmatic access
var beautify_js = require('js-beautify'); // also available under "js" export
var beautify_css = require('js-beautify').css;
var beautify_html = require('js-beautify').html;
// All methods accept two arguments, the string to be beautified, and an options object.
var fse = require('fs-extra');
// var fs = require('fs');
var fsOptions = {
  flags: 'r+', encoding: 'utf-8', autoClose: true
};

var beautifyHtml = function(committeeParam) {
  var htmlNarrPath = 'C:/Users/User1/WebstormProjects/un-sanc-viz/data/committees/751/narratives/SOe001.html';
// var htmlNarrPath = 'C:/Users/User1/WebstormProjects/un-sanc-viz/data/committees/751/narratives/*.html';

// var htmlFileNameAndPath = 'C:/Users/User1/WebstormProjects/un-sanc-viz/js/foo.html';
  var htmlFile = fse.readFileSync(htmlNarrPath, fsOptions);
//var htmlFile = fse.readFileSync(htmlFileNameAndPath, fsOptions);
  console.log(beautify_html(htmlFile, {indent_size: 4}));
  var beautified_html_narr = beautify_html(htmlFile, {indent_size: 4});
  fse.writeFileSync(htmlNarrPath, beautified_html_narr, fsOptions);

};


module.exports = {

}

/*
defaults:

 {
 "indent_size": 4,
 "indent_char": " ",
 "indent_level": 0,
 "indent_with_tabs": false,
 "preserve_newlines": true,
 "max_preserve_newlines": 10,
 "jslint_happy": false,
 "space_after_anon_function": false,
 "brace_style": "collapse",
 "keep_array_indentation": false,
 "keep_function_indentation": false,
 "space_before_conditional": true,
 "break_chained_methods": false,
 "eval_code": false,
 "unescape_strings": false,
 "wrap_line_length": 0,
 "wrap_attributes": "auto",
 "wrap_attributes_indent_size": 4
 }


 CSS Beautifier Options:
 -s, --indent-size                  Indentation size [4]
 -c, --indent-char                  Indentation character [" "]
 -L, --selector-separator-newline   Add a newline between multiple selectors
 -N, --newline-between-rules        Add a newline between CSS rules

 HTML Beautifier Options:
 -I, --indent-inner-html            Indent <head> and <body> sections. Default is false.
 -s, --indent-size                  Indentation size [4]
 -c, --indent-char                  Indentation character [" "]
 -b, --brace-style                  [collapse|expand|end-expand|none] ["collapse"]
 -S, --indent-scripts               [keep|separate|normal] ["normal"]
 -w, --wrap-line-length             Maximum characters per line (0 disables) [250]
 -A, --wrap-attributes              Wrap attributes to new lines [auto|force] ["auto"]
 -i, --wrap-attributes-indent-size  Indent wrapped attributes to after N characters [indent-size]
 -p, --preserve-newlines            Preserve existing line-breaks (--no-preserve-newlines disables)
 -m, --max-preserve-newlines        Maximum number of line-breaks to be preserved in one chunk [10]
 -U, --unformatted                  List of tags (defaults to inline) that should not be reformatted
 -n, --end-with-newline             End output with newline




 var htmlNarrPath = 'C:/Users/User1/WebstormProjects/un-sanc-viz/data/committees/751/narratives/SOe001.html';
 // var htmlNarrPath = 'C:/Users/User1/WebstormProjects/un-sanc-viz/data/committees/751/narratives/*.html';

 // var htmlFileNameAndPath = 'C:/Users/User1/WebstormProjects/un-sanc-viz/js/foo.html';
 var htmlFile = fse.readFileSync(htmlNarrPath, fsOptions);
 //var htmlFile = fse.readFileSync(htmlFileNameAndPath, fsOptions);
 console.log(beautify_html(htmlFile, {indent_size: 4}));
 var beautified_html_narr = beautify_html(htmlFile, {indent_size: 4});
 fse.writeFileSync(htmlNarrPath, beautified_html_narr, fsOptions);




 */