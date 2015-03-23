// test/test751.js
// run this with the command 'mocha'

var chai = require('chai');
var expect = require('chai').expect;
// var chaiXml = require('chai-xml');
//loads the plugin
//chai.use(chaiXml);
var assert = require("assert");
var request = require('sync-request');
var fse = require('fs-extra');
var logger = require('../js/tracer-logger-config.js').logger;
chai.use(require('chai-json-schema'));
var fsOptions = {
  flags: 'r+',
  encoding: 'utf-8',
  autoClose: true
};
var should = require('should');

// see http://tonylukasavage.com/blog/2014/05/29/custom-assertions-in-should-dot-js/
/*
 {
 "name": "string value",
 "value": 1234,
 "isSomething": true
 }
 */


describe('assert data.json', function () {
  it('should be valid', function () {
    var dataJsonPathAndFileName = __dirname + '/../data/committees/751/data.json';
    var data_json = JSON.parse(fse.readFileSync(dataJsonPathAndFileName, fsOptions));

    should.exist(data_json);
    data_json.should.be.an.Object;
    data_json.should.not.be.an.Array;
    (function () {
      JSON.stringify(data_json);
    }).should.not.throw();
//    logger.info('data_json.nodes.length = ', data_json.nodes.length, '\n');
    should.exist(data_json.dateGenerated);
    should.exist(data_json.dateCollected);
    should.exist(data_json.message);
    should.exist(data_json.nodes);
    data_json.nodes.forEach(function (node) {
      should.exist(node.id);
    });
    data_json.nodes.forEach(function (node) {
      should.equal(node.id.substring(0,2), 'SO', 'committee 751 node id should start would SO')
    });

    data_json.nodes.forEach(function (node) {
      should.exist(node.name);
    });

    data_json.nodes.forEach(function (node) {
      should.exist(node.indiv0OrEnt1);
      // logger.info('node.indiv0OrEnt1 = ', node.indiv0OrEnt1, '\n');
      //(node.indiv0OrEnt1).value.should.be.a.Number;
    });
    data_json.nodes.forEach(function (node) {
   node.should.have.property('indiv0OrEnt1').which.is.a.Number;
      // logger.info('node.indiv0OrEnt1 = ', node.indiv0OrEnt1, '\n');
      //(node.indiv0OrEnt1).value.should.be.a.Number;
    });
    data_json.nodes.forEach(function (node) {
      // node.should.have.property('indiv0OrEnt1').should.be.within(0,1);
      // node.should.have.property('indiv0OrEnt1').value.within(0,1);
      node.should.have.property('indiv0OrEnt1').which.is.a.Number.within(0,1);
      // logger.info('node.indiv0OrEnt1 = ', node.indiv0OrEnt1, '\n');
      //(node.indiv0OrEnt1).value.should.be.a.Number;
    });
    data_json.nodes.forEach(function (node) {
      should.exist(node.indivOrEntFromId);
    });

    (function () {
      data_json.nodes.forEach(function (node) {
        should.exist(node.id);
      });
    }).should.not.throw();
//      committeesConfig.value.should.be.a.Number;
//      should.exist(committeesConfig.isSomething);
//      committeesConfig.isSomething.should.be.a.Boolean;
  });

});


