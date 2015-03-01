var config = {
  "title": "U.N. Al Qaida Sanctions List",
  "graph": {
    "linkDistance": 150,
    "charge": -400,
    "height": 800,
    "numColors": 12,
    "labelPadding": {
      "left": 3,
      "right": 3,
      "top": 2,
      "bottom": 2
    },
    "labelMargin": {
      "left": 3,
      "right": 3,
      "top": 2,
      "bottom": 2
    },
    "ticksWithoutCollisions": 50
  },
  "types": {
    "group1": {
      "short": "Group 1",
      "long": "Group 1 long name for docs"
    },
    "group2": {
      "short": "Group 2",
      "long": "Group 2 long name for docs"
    },

    "none": {
      "short": "None",
      "long": "None long name for docs"
    }

  },
  "constraints": [
    {
      "has": {"type": "group1"},
      "type": "position",
      "x": 0.2,
      "y": 0.2,
      "weight": 0.7
    }, {
      "has": {"type": "group2"},
      "type": "position",
      "x": 0.8,
      "y": 0.2,
      "weight": 0.7
    },
    {
      "has": {
        "name": "ETL process 3"
      },
      "type": "position",
      "x": 0.75,
      "weight": 0.7
    }
  ]
};
