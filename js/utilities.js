function showProps(obj, objName) {
  var result = "";
  for(var i in obj) {
    if(obj.hasOwnProperty(i)) {
      result += objName + "." + i + " = " + obj[i] + "\n";
    }
  }
  // console.log(result);
  return result;
}

// circular json   https://github.com/WebReflection/circular-json/blob/master/src/circular-json.js

// should be a not so common char
// possibly one JSON does not encode
// possibly one encodeURIComponent does not encode
// right now this char is '~' but this might change in the future

var specialChar = '~';
var safeSpecialChar = '\\x' + ('0' + specialChar.charCodeAt(0)
  .toString(16))
  .slice(-2);
var escapedSafeSpecialChar = '\\' + safeSpecialChar;
var specialCharRG = new RegExp(safeSpecialChar, 'g');
var safeSpecialCharRG = new RegExp(escapedSafeSpecialChar, 'g');
var safeStartWithSpecialCharRG = new RegExp('(?:^|([^\\\\]))' + escapedSafeSpecialChar);
var indexOf = [].indexOf || function(v) {
    for(var i = this.length; i-- && this[i] !== v;);
    return i;
  };
var $String = String; // there's no way to drop warnings in JSHint
// about new String ... well, I need that here!
// faked, and happy linter!

function generateReplacer(value, replacer, resolve) {
  var
  path = [],
    all = [value],
    seen = [value],
    mapp = [resolve ? specialChar : '[Circular]'],
    last = value,
    lvl = 1,
    i;
  return function(key, value) {
    // the replacer has rights to decide
    // if a new object should be returned
    // or if there's some key to drop
    // let's call it here rather than "too late"
    if(replacer) value = replacer.call(this, key, value);

    // did you know ? Safari passes keys as integers for arrays
    // which means if (key) when key === 0 won't pass the check
    if(key !== '') {
      if(last !== this) {
        i = lvl - indexOf.call(all, this) - 1;
        lvl -= i;
        all.splice(lvl, all.length);
        path.splice(lvl - 1, path.length);
        last = this;
      }
      // console.log(lvl, key, path);
      if(typeof value === 'object' && value) {
        lvl = all.push(last = value);
        i = indexOf.call(seen, value);
        if(i < 0) {
          i = seen.push(value) - 1;
          if(resolve) {
            // key cannot contain specialChar but could be not a string
            path.push(('' + key)
              .replace(specialCharRG, safeSpecialChar));
            mapp[i] = specialChar + path.join(specialChar);
          } else {
            mapp[i] = mapp[0];
          }
        } else {
          value = mapp[i];
        }
      } else {
        if(typeof value === 'string' && resolve) {
          // ensure no special char involved on deserialization
          // in this case only first char is important
          // no need to replace all value (better performance)
          value = value.replace(safeSpecialChar, escapedSafeSpecialChar)
            .replace(specialChar, safeSpecialChar);
        }
      }
    }
    return value;
  };
}

function retrieveFromPath(current, keys) {
  for(var i = 0, length = keys.length; i < length; current = current[
    // keys should be normalized back here
    keys[i++].replace(safeSpecialCharRG, specialChar)
  ]);
  return current;
}

function generateReviver(reviver) {
  return function(key, value) {
    var isString = typeof value === 'string';
    if(isString && value.charAt(0) === specialChar) {
      return new $String(value.slice(1));
    }
    if(key === '') value = regenerate(value, value, {});
    // again, only one needed, do not use the RegExp for this replacement
    // only keys need the RegExp
    if(isString) value = value.replace(safeStartWithSpecialCharRG, '$1' + specialChar)
      .replace(escapedSafeSpecialChar, safeSpecialChar);
    return reviver ? reviver.call(this, key, value) : value;
  };
}

function regenerateArray(root, current, retrieve) {
  for(var i = 0, length = current.length; i < length; i++) {
    current[i] = regenerate(root, current[i], retrieve);
  }
  return current;
}

function regenerateObject(root, current, retrieve) {
  for(var key in current) {
    if(current.hasOwnProperty(key)) {
      current[key] = regenerate(root, current[key], retrieve);
    }
  }
  return current;
}

function regenerate(root, current, retrieve) {
  return current instanceof Array ?
  // fast Array reconstruction
  regenerateArray(root, current, retrieve) :
    (
    current instanceof $String ?
    (
      // root is an empty string
      current.length ?
      (
        retrieve.hasOwnProperty(current) ?
        retrieve[current] :
        retrieve[current] = retrieveFromPath(
          root, current.split(specialChar)
        )
      ) :
      root
    ) :
    (
      current instanceof Object ?
      // dedicated Object parser
      regenerateObject(root, current, retrieve) :
      // value as it is
      current
    )
  );
}

function stringifyRecursion(value, replacer, space, doNotResolve) {
  return JSON.stringify(value, generateReplacer(value, replacer, !doNotResolve), space);
}

function parseRecursion(text, reviver) {
  return JSON.parse(text, generateReviver(reviver));
}

/*! (C) WebReflection Mit Style License */
var CircularJSON = function(JSON, RegExp) {
  var specialChar = "~",
    safeSpecialChar = "\\x" + ("0" + specialChar.charCodeAt(0)
      .toString(16))
      .slice(-2),
    escapedSafeSpecialChar = "\\" + safeSpecialChar,
    specialCharRG = new RegExp(safeSpecialChar, "g"),
    safeSpecialCharRG = new RegExp(escapedSafeSpecialChar, "g"),
    safeStartWithSpecialCharRG = new RegExp("(?:^|([^\\\\]))" + escapedSafeSpecialChar),
    indexOf = [].indexOf || function(v) {
      for(var i = this.length; i-- && this[i] !== v;);
      return i;
    }, $String = String;

  function generateReplacer(value, replacer, resolve) {
    var path = [],
      all = [value],
      seen = [value],
      mapp = [resolve ? specialChar : "[Circular]"],
      last = value,
      lvl = 1,
      i;
    return function(key, value) {
      if(replacer) value = replacer.call(this, key, value);
      if(key !== "") {
        if(last !== this) {
          i = lvl - indexOf.call(all, this) - 1;
          lvl -= i;
          all.splice(lvl, all.length);
          path.splice(lvl - 1, path.length);
          last = this;
        }
        if(typeof value === "object" && value) {
          lvl = all.push(last = value);
          i = indexOf.call(seen, value);
          if(i < 0) {
            i = seen.push(value) - 1;
            if(resolve) {
              path.push(("" + key)
                .replace(specialCharRG, safeSpecialChar));
              mapp[i] = specialChar + path.join(specialChar);
            } else {
              mapp[i] = mapp[0];
            }
          } else {
            value = mapp[i];
          }
        } else {
          if(typeof value === "string" && resolve) {
            value = value.replace(safeSpecialChar, escapedSafeSpecialChar)
              .replace(specialChar, safeSpecialChar);
          }
        }
      }
      return value;
    };
  }

  function retrieveFromPath(current, keys) {
    for(var i = 0, length = keys.length; i < length; current = current[keys[i++].replace(safeSpecialCharRG, specialChar)]);
    return current;
  }

  function generateReviver(reviver) {
    return function(key, value) {
      var isString = typeof value === "string";
      if(isString && value.charAt(0) === specialChar) {
        return new $String(value.slice(1));
      }
      if(key === "") value = regenerate(value, value, {});
      if(isString) value = value.replace(safeStartWithSpecialCharRG, "$1" + specialChar)
        .replace(escapedSafeSpecialChar, safeSpecialChar);
      return reviver ? reviver.call(this, key, value) : value;
    };
  }

  function regenerateArray(root, current, retrieve) {
    for(var i = 0, length = current.length; i < length; i++) {
      current[i] = regenerate(root, current[i], retrieve);
    }
    return current;
  }

  function regenerateObject(root, current, retrieve) {
    for(var key in current) {
      if(current.hasOwnProperty(key)) {
        current[key] = regenerate(root, current[key], retrieve);
      }
    }
    return current;
  }

  function regenerate(root, current, retrieve) {
    return current instanceof Array ? regenerateArray(root, current, retrieve) : current instanceof $String ? current.length ? retrieve.hasOwnProperty(current) ? retrieve[current] : retrieve[current] = retrieveFromPath(root, current.split(specialChar)) : root : current instanceof Object ? regenerateObject(root, current, retrieve) : current;
  }

  function stringifyRecursion(value, replacer, space, doNotResolve) {
    return JSON.stringify(value, generateReplacer(value, replacer, !doNotResolve), space);
  }

  function parseRecursion(text, reviver) {
    return JSON.parse(text, generateReviver(reviver));
  }
  return {
    stringify: stringifyRecursion,
    parse: parseRecursion
  };
}(JSON, RegExp);

// stringify.js   https://raw.githubusercontent.com/isaacs/json-stringify-safe/master/stringify.js
// module.exports = stringify;

function getSerialize(fn, decycle) {
  var seen = [],
    keys = [];
  decycle = decycle || function(key, value) {
    return '[Circular ' + getPath(value, seen, keys) + ']';
  };
  return function(key, value) {
    var ret = value;
    if(typeof value === 'object' && value) {
      if(seen.indexOf(value) !== -1)
        ret = decycle(key, value);
      else {
        seen.push(value);
        keys.push(key);
      }
    }
    if(fn) ret = fn(key, ret);
    return ret;
  };
}

function getPath(value, seen, keys) {
  var index = seen.indexOf(value);
  var path = [keys[index]];
  for(index--; index >= 0; index--) {
    try {
      if(seen[index][path[0]] === value) {
        value = seen[index];
        path.unshift(keys[index]);
      }
    } catch(e) {
      // console.log("seen[index][path[0]] = ", seen[index][path[0]]);
      //console.log(e);

    }

  }
  return '~' + path.join('.');
}

function stringify(obj, fn, spaces, decycle) {
  return JSON.stringify(obj, getSerialize(fn, decycle), spaces);
}

stringify.getSerialize = getSerialize;

// end of stringify.js