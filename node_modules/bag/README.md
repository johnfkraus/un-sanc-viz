# bag

An array-backed unordered collection.

## API

    var Bag = require('bag').Bag;
    
    // Create a new bag
    var bag = new Bag;
    
    // Get number of items in bag
    console.log(bag.length); // => 0
    console.log(bag.isEmpty()); // => true
    
    // Add some items
    bag.add(1);
    bag.add(2);
    bag.add(3);
    
    console.log(bag.length); // => 3
    console.log(bag.isEmpty()); // => false
    
    // Membership test
    bag.contains(1);  // => true
    bag.contains(4);  // => false
    
    // Iterator
    bag.forEach(function(value) { /* ... */ });
    
    // Remove the last item
    var removed = bag.removeLast();
    console.log(removed); // => 3
    
    // Remove a specific object
    bag.removeObject(2); // => true
    
    // Add all items from an array or another bag:
    bag.addAll([8,9,10]);
    
    // Remove all items from an array or another bag:
    bag.removeAll([8,9,10]);
    
    // Remove all items
    bag.clear();
    console.log(bag.length); // => 0
    console.log(bag.isEmpty()); // => true

There are also `get()`, `set()` and `remove()` methods which operate on specific indices but these should be avoided in most circumstances because the order of items within the bag is not constant.