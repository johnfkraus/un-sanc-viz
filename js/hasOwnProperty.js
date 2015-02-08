function is(x, y) {
  if (x === y) {
    if (x === 0) {
      return 1 / x === 1 / y;
    }

    return true;
  }

  var x1 = x,
    y1 = y;

  return x !== x1 && y !== y1;
}

function hasOwnProperty(object, property) {
  var prototype;

  return property in object && (!(property in (prototype = object.__proto__ || object.constructor.prototype)) || !is(object[property], prototype[property]));
}

function NewClass() {}
NewClass.prototype = {
  a: 'there'
};

var obj = new NewClass();

if (obj.hasOwnProperty("a")) {
  console.log("has property")
}

if (hasOwnProperty(obj, "a")) {
  console.log("has property")
}