var should = require('should');

(5).should.be.exactly(5).and.be.a.Number;


var user = new Object();
user.name = 'tj';
user.pets=['Fluffy', 'Wolfe', 'Banana', 'Bug'];


user.should.be.an.instanceOf(Object).and.have.property('name', 'tj');
user.pets.should.be.instanceof(Array).and.have.lengthOf(4);


('xyz').should.be.exactly(5).and.be.a.Number;
