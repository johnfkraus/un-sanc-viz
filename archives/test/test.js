// test/test.js
// run this with the command 'mocha'

var chai = require('chai');
var expect = require('chai').expect;
var chaiXml = require('chai-xml');
var assert = require("assert");
var request = require('sync-request');
var fse = require('fs-extra');
//loads the plugin
chai.use(chaiXml);
var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};

describe('assert some xml', function () {

  var rawXmlFileName = __dirname + "/../data/committees/consolidated/consolidated.xml";

  var consolidatedSanctionsXml = fse.readFileSync(rawXmlFileName, fsOptions);
//  var res = request('GET', 'http://www.un.org/sc/committees/consolidated.xml');
  // var otherXml = res.body.toString();
  var someXml = '<root>\n\t<child name="foo" value="bar"></child>\n</root>';
  var brokeXml = '<root>\n\t<child name="foo" value="bar"></child>';
  var otherXml = '<root><child value="bar" name="foo" /></root>';

  it("should be valid", function () {
    expect(consolidatedSanctionsXml).xml.to.be.valid();
  });
  it("should be valid", function () {
    expect(someXml).xml.to.be.valid();
  });
  it("should be equal to otherXml ", function () {
    assert.equal(someXml, otherXml);
  });
  it("should be the same string as otherXml ", function () {
    expect(someXml).to.not.equal(otherXml);
  });
  it("should be the same XML as otherXml ", function () {
    expect(someXml).xml.to.equal(otherXml);
  });

  it("should be valid ", function () {
    expect(someXml).json.to.be.valid();
  });
});

describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1, 2, 3].indexOf(5));
      assert.equal(-1, [1, 2, 3].indexOf(0));
    })
  })
});

/*
 // $ npm install -g mocha
 // $ mkdir test
 // $ $EDITOR test/test.js
 // js/testXML.js
 // In addition to the chai package, youmo need to install the plugin :
 //  npm install chai-xml --save-dev
 // run this with the command 'mocha'

 XML must be a string
 Add the property xml to your chain
 The equal/eq/equals methods compare XML instead of the strings
 The valid method check whether the XML is well-formed
 Contributing
 0.1.0 initial release. Support xml property, valid method and overwrite the equal/eq/equals methods
 github.com/krampstudio/chai-xml
 chai, xml2js

 */





// $  mocha
// ✔ 1 test complete (1ms)

