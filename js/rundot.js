
var exec = require('child_process').exec;
// exec('dot -Tsvg data/dot/crazy.gv.txt -o data/dot/crazy2.svg', function (error, stdout, stderr) {
  // output is in stdout
// });

//exec('dot -Tsvg data/dot/ethane.dot -o data/dot/ethane.svg', function (error, stdout, stderr) {
  // output is in stdout
// });
/*
exec('dot -Tsvg data/committees/1267/trunc_links.dot -o data/committees/1267/trunc_links.svg', function (error, stdout, stderr) {
  // output is in stdout
});

exec('dot -Tjpg data/committees/1267/trunc_links.dot -o data/committees/1267/trunc_links.jpg', function (error, stdout, stderr) {
  // output is in stdout
});


exec('sfdp -Tsvg data/committees/1267/links_1267_sfdp_strict.dot -o data/committees/1267/links_1267_sfdp_strict.svg.svg', function (error, stdout, stderr) {
  // output is in stdout
});

exec('sfdp -Tjpg data/committees/1267/links_1267_sfdp_strict.dot -o data/committees/1267/links_1267_sfdp_strict.svg.jpg', function (error, stdout, stderr) {
  // output is in stdout
});


exec('twopi -Tsvg data/dot/twopi2.gv -o data/dot/twopi2.svg', function (error, stdout, stderr) {
  // output is in stdout
});

exec('twopi -Tjpg data/dot/twopi2.gv -o data/dot/twopi2.jpg', function (error, stdout, stderr) {
  // output is in stdout
});


*/

// var fileNameNoExtension = 'twopi-links';

exec('twopi -Tsvg data/dot/twopi-links.gv -o data/dot/twopi-links.svg', function (error, stdout, stderr) {
  console.log(error);
  // output is in stdout
});

exec('twopi -Tjpg data/dot/twopi-links.gv -o data/dot/twopi-links.jpg', function (error, stdout, stderr) {
  // output is in stdout
  console.log(error);
});