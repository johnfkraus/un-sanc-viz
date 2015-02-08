
var Bag = require('backpack-node').collections.Bag;
var myBag = new Bag();
myBag.add('5', 'pupu');
myBag.add('5', 'baba');
myBag.add('2', 'baba');

console.log(myBag.count);



myBag = new Bag();
myBag.add(1, 'a');
myBag.add(2, 'b');
myBag.add(2, 'c');

myBag.forEach(function (item)
{
  console.log('Key: ' + item.key);
  console.log('Value: ' + item.value);
});


/*
  *Properties:*

- **count**

Returns the items count.

- **collectionsCount**

Returns the number of collections (as known as how many unique keys exists in the bag).

  */