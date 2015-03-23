// getting-started.js
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
console.log('connected');
  // yay!

  var kittySchema = mongoose.Schema({
    name: String
  });

// var silence = new Kitten({ name: 'Silence' });
// console.log(silence.name); // 'Silence'

// NOTE: methods must be added to the schema before compiling it with mongoose.model()
  kittySchema.methods.speak = function () {
    var greeting = this.name
      ? "Meow name is " + this.name
      : "I don't have a name";
    console.log(greeting);
  };
  var Kitten = mongoose.model('Kitten', kittySchema);
//Kitten = mongoose.model('Kitten', kittySchema);

  var fluffy = new Kitten({ name: 'fluffy' });
  fluffy.speak(); // "Meow name is fluffy"
  var booger = new Kitten({name: 'booger'});
  booger.speak(); // "Meow name is fluffy"

  fluffy.save(function (err, fluffy) {
    if (err) return console.error(err);
    fluffy.speak();
  });

  booger.save(function (err, booger) {
    if (err) return console.error(err);
    booger.speak();
  });

  Kitten.find(function (err, kittens) {
    if (err) return console.error(err);
    console.log(kittens)
  });

  Kitten.find({ name: /^Fluff/ }, callback);

  Kitten.find({ name: /^xxFluff/ }, callback);

});

