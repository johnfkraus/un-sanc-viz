var should = require('should');

var a = new should.Assertion(42);

a.params = {
  operator: 'to be magic number',
};

a.assert(false);
//throws AssertionError: expected 42 to be magic number