// Bag implementation
// Ported from Artemis entity system (com.artemis.utils.Bag)

exports.Bag = Bag;

var DEFAULT_CAPACITY = 16;

function Bag(capacity, eq) {
  
  if (typeof capacity === 'function') {
    eq = capacity;
    capacity = null;
  }

  this.data = new Array(capacity || DEFAULT_CAPACITY);
  this.length = 0;
  this.eq = eq || function(l, r) { return l === r; };

}

Bag.prototype = {
  forEach: function(iterator) {
    for (var i = 0; i < this.length; ++i) {
      iterator(this.data[i]);
    }
  },
  
  remove: function(ix) {
    var item = this.data[ix];
    this.data[ix] = this.data[--this.length];
    this.data[this.length] = null;
    return item;
  },
  
  removeLast: function() {
    var item = null;
    if (this.length > 0) {
      item = this.data[--this.length];
      this.data[this.length] = null;
    }
    return item;
  },
  
  removeObject: function(obj) {
    for (var i = 0; i < this.length; i++) {
      var tmp = this.data[i];
      if (this.eq(tmp, obj)) {
        this.data[i] = this.data[--this.length];
        this.data[this.length] = null;
        return true;
      }
    }
    return false;
  },
  
  contains: function(obj) {
    for (var i = 0; i < this.length; ++i) {
      if (this.eq(obj, this.data[i]))
        return true;
    }
    return false;
  },
  
  removeAll: function(other) {
    var modified = false;
    
    var otherLen = other.length;
    if (!Array.isArray(other)) {
      other = other.data; // assume bag
    }
    
    for (var i = 0; i < otherLen; ++i) {
      var o1 = other[i];
      for (var j = 0; j < this.length; ++j) {
        var o2 = this.data[j];
        if (this.eq(o1, o2)) {
          this.remove(j);
          j--;
          modified = true;
          break;
        }
      }
    }
    
    return modified;
  },
  
  get: function(ix) {
    return this.data[ix];
  },
  
  isEmpty: function() {
    return this.length == 0;
  },
  
  add: function(obj) {
    this.data[this.length++] = obj;
  },
  
  set: function(ix, obj) {
    if (ix > this.length) {
      throw "now why would you want to do that?"
    } else if (ix == this.length) {
      this.data[this.length++] = obj;
    } else {
      this.data[ix] = obj;
    }
  },
  
  clear: function() {
    this.data.splice(0, this.length);
    this.length = 0;
  },
  
  addAll: function(collection) {
    var length = collection.length;
    if (!Array.isArray(collection)) {
      collection = collection.data; // assume bag
    }
    for (var i = 0; i < length; ++i) {
      this.data[this.length++] = collection[i];
    }
  }
};