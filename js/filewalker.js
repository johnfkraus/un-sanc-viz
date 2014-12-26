var filewalker = require('filewalker');

var defaultPath = "./data/output";
filewalker(path)
  .on('dir', function(p) {
    console.log('dir:  %s', p);
  })
  .on('file', function(p, s) {
    console.log('file: %s, %d bytes', p, s.size);
  })
  .on('error', function(err) {
    console.error(err);
  })
  .on('done', function() {
    console.log('%d dirs, %d files, %d bytes', this.dirs, this.files, this.bytes);
  })
  .walk();

module.exports = {
  filewalker: filewalker
};
