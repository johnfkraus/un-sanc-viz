// sync-request-test.js

var request = require('sync-request')

// Test GET request
// re.get("http://www.un.org/sc/committees/1267/AQList.xml", "/home/codio/workspace/data/xml/AQList.xml", function(error, filename) {
var res = request('GET', 'http://www.un.org/sc/committees/1267/AQList.xml');

// console.log(res);
console.log(res.body.toString());
console.log("Reponse Body Length: ", res.getBody().length);

// Test HTTPS POST request

/*
console.dir('https://talk.to/');
var res = request('POST', 'https://talk.to/', { body: '<body/>' });

console.log(res);
console.log("Reponse Body Length: ", res.getBody().length);

console.dir('https://apache.org');
var errored = false;
try {
  // Test unauthorized HTTPS GET request
  var res = request('GET', 'https://apache.org');
  console.log(res);
  console.log("Reponse Body: ", res.body.toString());
  errored = true;
} catch(ex) {
  console.log("Successully rejected unauthorized host: https://apache.org/");
}
if (errored)
  throw new Error('Should have rejected unauthorized https get request');
*/
process.exit(0);



