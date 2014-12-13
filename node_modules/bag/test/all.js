var test = require('tape');
var Bag = require('../').Bag;

test('initial state', function(assert) {
  var bag = new Bag;
  assert.ok(bag.length === 0);
  assert.ok(bag.isEmpty());
  assert.end();
});

test('add', function(assert) {
  var bag = new Bag;
  bag.add(1);
  bag.add(2);
  bag.add(3);
  
  assert.ok(bag.length === 3);
  assert.notOk(bag.isEmpty());
  
  assert.ok(bag.get(0) === 1);
  assert.ok(bag.get(1) === 2);
  assert.ok(bag.get(2) === 3);
  
  assert.end();
});

test('remove', function(assert) {
  var bag = new Bag;
  bag.addAll([1,2,3,4,5]);
  bag.remove(0);
  
  assert.ok(bag.length === 4);
  assert.notOk(bag.contains(1));
  assert.end();
});

test('removeLast', function(assert) {
  var bag = new Bag;
  bag.addAll([1,2,3,4,5]);
  bag.removeLast();
  assert.ok(bag.length === 4);
  assert.notOk(bag.contains(5));
  assert.end();
});

test('removeObject', function(assert) {
  var bag = new Bag;
  bag.addAll([1,2,3,4,5]);
  bag.removeObject(1);
  bag.removeObject(4);
  bag.removeObject(5);
  
  assert.ok(bag.length === 2);
  assert.ok(bag.contains(2));
  assert.ok(bag.contains(3));
  assert.end();
});

test('removeAll', function(assert) {
  var bag = new Bag;
  bag.addAll([1,2,3,4,5]);
  bag.removeAll([1,3,5]);
  
  assert.ok(bag.length === 2);
  assert.ok(bag.contains(2));
  assert.ok(bag.contains(4));
  assert.end();
});

test('contains', function(assert) {
  var bag = new Bag;
  bag.add(1);
  bag.add(2);
  bag.add(3);
  
  assert.ok(bag.contains(1));
  assert.ok(bag.contains(2));
  assert.ok(bag.contains(3));
  assert.notOk(bag.contains(4));
  assert.end();
});

test('clear', function(assert) {
  var bag = new Bag;
  bag.add(1);
  bag.add(2);
  bag.add(3);
  
  assert.ok(bag.length === 3);
  
  bag.clear();
  
  assert.ok(bag.length === 0);
  assert.ok(bag.isEmpty());
  assert.notOk(bag.contains(1));
  assert.notOk(bag.contains(2));
  assert.notOk(bag.contains(3));
  
  assert.end();
});

test('addAll', function(assert) {
  var bag = new Bag;
  bag.addAll([1,2,3,4]);
  assert.ok(bag.length === 4);
  assert.ok(bag.contains(1));
  assert.ok(bag.contains(2));
  assert.ok(bag.contains(3));
  assert.ok(bag.contains(4));
  assert.end();
});