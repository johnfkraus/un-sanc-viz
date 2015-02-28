// http://www.i-programmer.info/programming/javascript/1031-javascript-jems-lambda-expressions.html?start=1

function test(a) {
  console.log(a);
}

var testFx = function (a) {
  console.log(a);
};

test.myMethod = function (a) {
  console.log(a);
};

test('hello');
test.myMethod('16 hello from test.myMethod');

testFx('hello');

console.log("20 test = ", test);
console.log("21 testFx = ", testFx);

var test2 = test;

test2("hello2");

console.log('27 test2("hello2") =',test2("hello2"));

test = function () {
  console.log("Hello1");
};

test2 = test;

test = function () {
  console.log("Hello2");
};
// test is a function that prints Hello2 but test2 is still the original function that prints Hello1, as you can confirm by using:

test();
test2();
console.log('40 test2() = ', test2());



Say = function (t) {
  t();
};

// This will simply call any function that you pass to it. If you define:
Hello = function () {
  console.log("48-Hello");
};

// Then

console.log('53 Say(Hello) = ', Say(Hello));

// Say(Hello);
// will call the Hello function and display an console.log.
//  Notice that you have to pass the variable that references the function without accidentally invoking the function.
// That is, don’t write:
//console.log('59 Say(Hello()) = ', Say(Hello()));


console.log(function sum(a,b){return a+b;}(1,2));