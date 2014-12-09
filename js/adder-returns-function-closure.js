function makeAdder(x){
  return function (y) {
    console.log(y + " this is y");
    console.log(x + " this is x");
    return x + y;
  }
}
var add10 = makeAdder(10);
console.log(add10(2)); // 12