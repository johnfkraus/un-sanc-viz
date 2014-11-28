if(typeof define !== 'function') {
  var define = require('amdefine');
}


var async = require('async'),
  re = require('request-enhanced'),
  request = require('request'),
fse = require('fs-extra'),
  util = require('util'),
  dateFormat = require('dateformat'),
  inspect = require('object-inspect'),
  jsonpatch = require('json-patch'),
  parseString = require('xml2js')
    .parseString;



var removeAFile = function() {

console.log(__dirname);
var newPath = (__dirname + "/../data/output/AQList.xml").toString();
console.log("newPath = ", newPath);
console.log("fse.exists(newPath) = ", fse.exists(newPath));
  
  fse.unlink(newPath, function (err) {
  if (err) throw err;
  console.log('successfully deleted ", newPath');
});
  
  
 if (fse.exists(newPath)) {
    response.errors.push("File name already exists,updating");
    fse.removeSync('newPath', function (err) {
      if (err) response.errors.push("Error : " + err);
      console.log('successfully deleted : '+ newPath );
    });
   console.log("removed "+newPath);
    //response.isErrors = true;
} //end if exists file

};

module.exports = {
  removeAFile: removeAFile
};
