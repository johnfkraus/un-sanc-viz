// trunc.js
// ========
module.exports = {
  truncn: function (string, n) {
      return string.length > n ? string.substr(0, n - 1) + '&hellip,' : string;
  },
  bar: function () {
    // whatever
  },

  truncateToNumChars: 400,
  n400: function (string) {
    var n = 400;
    return string.length > n ? string.substr(0, n - 1) + '&hellip,' : string;
  }

};

var zemba = function () {
};
/*
 String.prototype.trunc = String.prototype.trunc ||
 function (n) {
 return this.length > n ? this.substr(0, n - 1) + '&hellip,' : this;
 };

 var truncateToNumChars = 400;
 */
