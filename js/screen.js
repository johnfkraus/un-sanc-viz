// screen.js

// var screenWidth = screen.width;

// console.log("\n ", __filename, "line", __line, ";  screenWidth = ", screenWidth);

(function (w) {
  $.ajax({
    type: 'POST',
    url: '/echo/json',
    data: {
      w: w.screen.width,
      h: w.screen.height
    },
    success: function () {
      console.log(arguments);
    },
    dataType: 'json'
  });
})(window);