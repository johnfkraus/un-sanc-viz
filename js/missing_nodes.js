var missing_nodes = [{
     "match": 1,
      "name": "Fahd Mohammed Ahmed al-Quso (no longer listed)",
      "artist": "QI.A.288.10",
      "id": "QI.A.288.10",
      "playcount": 100
  }, {
    "match": 1,
    "name": "Usama Bin Laden (no longer listed)",
    "artist": "QI.B.8.01",
    "id": "QI.B.8.01",
    "playcount": 100
  }, {
   "match": 1,
      "name": "International Islamic Relief Organization, Philippines, branch offices (no longer listed)",
      "artist": "QE.I.126.06",
      "id": "QE.I.126.06",
      "playcount": 100
  }
];

console.log(missing_nodes);

missing_nodes.forEach(function(node) {             
  console.log(node.name);
});

