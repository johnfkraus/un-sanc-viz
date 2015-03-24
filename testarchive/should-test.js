var should = require('should');

var user = {
  name: 'tj'
  , pets: ['tobi', 'loki', 'jane', 'bandit']
};

user.should.have.property('name', 'tj');
user.should.have.property('pets').with.lengthOf(4);

// If the object was created with Object.create(null) 
// then it doesn't inherit `Object.prototype`, so it will not have `.should` getter 
// so you can do: 
should(user).have.property('name', 'tj');

// also you can test in that way for null's 
should(null).not.be.ok;

someAsyncTask(foo, function(err, result){
  should.not.exist(err);
  should.exist(result);
  result.bar.should.equal(foo);
});