
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

*/
exec('sfdp -Tsvg data/committees/1267/trunc_links.dot -o data/committees/1267/trunc_links.svg', function (error, stdout, stderr) {
  // output is in stdout
});

exec('sfdp -Tjpg data/committees/1267/trunc_links.dot -o data/committees/1267/trunc_links.jpg', function (error, stdout, stderr) {
  // output is in stdout
});
