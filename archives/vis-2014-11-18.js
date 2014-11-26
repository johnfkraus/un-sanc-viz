// major params
// charge, originally -200
// force.on("tick", forceTick)
// .charge(-200)
// .linkDistance(50)


var Network, RadialPlacement, activate, root;

root = typeof exports !== "undefined" && exports !== null ? exports : this;


RadialPlacement = function() {
  var center, current, increment, place, placement, radialLocation, radius, setKeys, start, values;
  values = d3.map();
  increment = 5;
  radius = 50;
  center = {
    "x": 0,
    "y": 0
  };
  start = -120;
  current = start;
  radialLocation = function(center, angle, radius) {
    var x, y;
    x = center.x + radius * Math.cos(angle * Math.PI / 180);
    y = center.y + radius * Math.sin(angle * Math.PI / 180);
    return {
      "x": x,
      "y": y
    };
  };
  placement = function(key) {
    var value;
    value = values.get(key);
    if(!values.has(key)) {
      value = place(key);
    }
    return value;
  };
  place = function(key) {

    var value;
    value = radialLocation(center, current, radius);
    values.set(key, value);
    current += increment;
    return value;
  };
  setKeys = function(keys) {
    var firstCircleCount, firstCircleKeys, secondCircleKeys;
    values = d3.map();
    firstCircleCount = 360 / increment;
    if(keys.length < firstCircleCount) {
      increment = 360 / keys.length;
    }
    firstCircleKeys = keys.slice(0, firstCircleCount);
    firstCircleKeys.forEach(function(k) {
      return place(k);
    });
    secondCircleKeys = keys.slice(firstCircleCount);
    radius = radius + radius / 1.8;
    increment = 360 / secondCircleKeys.length;
    return secondCircleKeys.forEach(function(k) {
      return place(k);
    });
  };
  placement.keys = function(_) {
    if(!arguments.length) {
      return d3.keys(values);
    }
    setKeys(_);
    return placement;
  };
  placement.center = function(_) {
    if(!arguments.length) {
      return center;
    }
    center = _;
    return placement;
  };
  placement.radius = function(_) {
    if(!arguments.length) {
      return radius;
    }
    radius = _;
    return placement;
  };
  placement.start = function(_) {
    if(!arguments.length) {
      return start;
    }
    start = _;
    current = start;
    return placement;
  };
  placement.increment = function(_) {
    if(!arguments.length) {
      return increment;
    }
    increment = _;
    return placement;
  };
  return placement;
};

Network = function() {
  var allData, charge, curLinksData, curNodesData, filter, filterLinks, filterNodes, force, forceTick, groupCenters, height, hideDetails, layout, link, linkedByIndex, linksG, mapNodes, moveToRadialLayout, neighboring, network, node, nodeColors, nodeCounts, nodesG, radialTick, setFilter, setLayout, setSort, setupData, showDetails, sort, sortedArtists, strokeFor, tooltip, update, updateCenters, updateLinks, updateNodes, width;
  var forceChargeParam;
  var songfile = "al-qaida.json";

  var w = window.innerWidth;
  var h = window.innerHeight;
  
  width = w - 20; // 1152;
  height = 960;
  allData = [];
  curLinksData = [];
  curNodesData = [];
  linkedByIndex = {};
  nodesG = null;
  linksG = null;
  node = null;
  link = null;
  layout = "force";
  filter = "all";
  sort = "songs";
  groupCenters = null;
  force = d3.layout.force();
  nodeColors = d3.scale.category20();
  tooltip = Tooltip("vis-tooltip", 230);
  charge = function(node) {
    return -Math.pow(node.radius, 2.0) / 2;
  };
  // forceChargeParam = $("#force_charge_select").val();
  // console.log("vis 138 forceChargeParam = ", forceChargeParam);  

  charge2 = function(node) {
    return -Math.pow(node.radius, 4.0) / 15;
  };
  network = function(selection, data) {
    var vis;
    allData = setupData(data);
    vis = d3.select(selection)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    linksG = vis.append("g")
      .attr("id", "links");
    nodesG = vis.append("g")
      .attr("id", "nodes");
    force.size([width, height]);
    setLayout("force");
    setFilter("all");
    return update();
  };
  update = function() {
    // forceChargeParam = $("#force_charge_select").val();
    var artists;
    curNodesData = filterNodes(allData.nodes);
    curLinksData = filterLinks(allData.links, curNodesData);
    if(layout === "radial") {
      artists = sortedArtists(curNodesData, curLinksData);
      updateCenters(artists);
    }
    force.nodes(curNodesData);
    updateNodes();
    if(layout === "force") {
      force.links(curLinksData);
      updateLinks();
    } else {
      force.links([]);
      if(link) {
        link.data([])
          .exit()
          .remove();
        link = null;
      }
    }
    return force.start();
  };
  network.toggleLayout = function(newLayout) {
    force.stop();
    setLayout(newLayout);
    return update();
  };
  network.toggleForce = function(newLayout) {
    force.stop();
       network.forceChargeParam = $('#force_charge_select')
        .val();
       console.log("network.forceChargeParam = ", $('#force_charge_select'));
  
    setLayout(newLayout);
    
    return update();
  };

  
  network.toggleFilter = function(newFilter) {
    force.stop();
    setFilter(newFilter);
    return update();
  };
  network.toggleSort = function(newSort) {
    force.stop();
    setSort(newSort);
    return update();
  };
  network.updateSearch = function(searchTerm) {
    var searchRegEx;
    searchRegEx = new RegExp(searchTerm, "i"); // .toLowerCase());
    return node.each(function(d) {
      var element, match;
      element = d3.select(this);
      match = d.id
        .search(searchRegEx);
      if(searchTerm.length > 0 && match >= 0) {
        element.style("fill", "#F38630")
          .style("stroke-width", 2.0)
          .style("stroke", "#555");
        return d.searched = true;
      } else {
        d.searched = false;
        return element.style("fill", function(d) {
          return nodeColors(d.artist);
        })
          .style("stroke-width", 1.0);
      }
    });
  };
  network.updateSearch2 = function(searchTerm) {
    var searchRegEx;
    searchRegEx = new RegExp(searchTerm, "i"); // .toLowerCase());
    return node.each(function(d) {
      var element, match;
      element = d3.select(this);
      match = d.name
        .search(searchRegEx);
      if(searchTerm.length > 0 && match >= 0) {
        element.style("fill", "#F38630")
          .style("stroke-width", 2.0)
          .style("stroke", "#555");
        return d.searched = true;
      } else {
        d.searched = false;
        return element.style("fill", function(d) {
          return nodeColors(d.artist);
        })
          .style("stroke-width", 1.0);
      }
    });
  };

  network.updateData = function(newData) {
    allData = setupData(newData);
    link.remove();
    node.remove();
    return update();
  };
  setupData = function(data) {
    var circleRadius, count, countExtent, nodesMap;
    var result;
    countExtent = d3.extent(data.nodes, function(d) {
      return parseInt(d.sourceCount, 10);
    });
           
    circleRadius = d3.scale.sqrt()
      .range([3, 12])
      .domain(countExtent);
    data.nodes.forEach(function(n) {
      var randomnumber;
      n.x = randomnumber = Math.floor(Math.random() * width);
      n.y = randomnumber = Math.floor(Math.random() * height);

      // data.nodes.forEach(function(n) {
        // console.log('254 showProps(n, "n")');
        // console.log(showProps(n, "n"));
      //});

      return n.radius = circleRadius(n.sourceCount + n.targetCount); //n.playcount);
    });
    nodesMap = mapNodes(data.nodes);
    count = 0;
    var linkedByIndexData;
    data.links.forEach(function(l) {
      count++;
      if(!(nodesMap.get(l.target))) {
        console.log("274 count = ", count, "l.target is undefined; l.source = ", nodesMap.get(l.source));
      }
      l.source = nodesMap.get(l.source);
      l.target = nodesMap.get(l.target);
      return linkedByIndex["" + l.source.id + "," + l.target.id] = 1;
    });
    return data;
  };
  mapNodes = function(nodes) {
    var nodesMap;
    nodesMap = d3.map();
    nodes.forEach(function(n) {
      return nodesMap.set(n.id, n);
    });
    return nodesMap;
  };
  nodeCounts = function(nodes, attr) {
    // console.log("296 attr = ");
    // console.log(attr);
    var counts;
    counts = {};
    nodes.forEach(function(d) {
      var _name;
      if(counts[_name = d[attr]] == null) {
        counts[_name] = 0;
      }
      return counts[d[attr]] += 1;
    });
    // console.log("vis.js 239 counts = ");
    // console.log(counts);
    return counts;
  };
  neighboring = function(a, b) {
    // console.log("vis.js 243 neighboring = ", linkedByIndex[a.id + "," + b.id] || linkedByIndex[b.id + "," + a.id]);
    return linkedByIndex[a.id + "," + b.id] || linkedByIndex[b.id + "," + a.id];
  };
  filterNodes = function(allNodes) {
    var cutoff, filteredNodes, playcounts;
    filteredNodes = allNodes;
    if(filter === "popular" || filter === "obscure") {
      playcounts = allNodes.map(function(d) {
        return d.playcount;
      })
        .sort(d3.ascending);
      cutoff = d3.quantile(playcounts, 0.5);
      filteredNodes = allNodes.filter(function(n) {
        if(filter === "popular") {
          return n.playcount > cutoff;
        } else if(filter === "obscure") {
          return n.playcount <= cutoff;
        }
      });
    }
    return filteredNodes;
  };
  sortedArtists = function(nodes, links) {
    var artists, counts;
    artists = [];
    if(sort === "links") {
      counts = {};
      links.forEach(function(l) {
        var _name, _name1;
        if(counts[_name = l.source.artist] == null) {
          counts[_name] = 0;
        }
        counts[l.source.artist] += 1;
        if(counts[_name1 = l.target.artist] == null) {
          counts[_name1] = 0;
        }
        return counts[l.target.artist] += 1;
      });
      nodes.forEach(function(n) {
        var _name;
        return counts[_name = n.artist] != null ? counts[_name] : counts[_name] = 0;
      });
      artists = d3.entries(counts)
        .sort(function(a, b) {
          return b.value - a.value;
        });
      artists = artists.map(function(v) {
        return v.key;
      });
    } else {
      counts = nodeCounts(nodes, "artist");
      artists = d3.entries(counts)
        .sort(function(a, b) {
          return b.value - a.value;
        });
      artists = artists.map(function(v) {
        return v.key;
      });
    }
    return artists;
  };
  updateCenters = function(artists) {
    if(layout === "radial") {
      return groupCenters = RadialPlacement()
        .center({
          "x": width / 2,
          "y": height / 2 - 100
        })
        .radius(300)
        .increment(18)
        .keys(artists);
    }
  };
  filterLinks = function(allLinks, curNodes) {
    curNodes = mapNodes(curNodes);
    return allLinks.filter(function(l) {
      return curNodes.get(l.source.id) && curNodes.get(l.target.id);
    });
  };
  updateNodes = function() {
    node = nodesG.selectAll("circle.node")
      .data(curNodesData, function(d) {
        return d.id;
      });
    node.enter()
      .append("circle")
      .attr("class", "node")
      .attr("cx", function(d) {
        return d.x;
      })
      .attr("cy", function(d) {
        return d.y;
      })
      .attr("r", function(d) {

        return(d.radius);
      })
      .style("fill", function(d) {
        return nodeColors(d.artist);
      })
      .style("stroke", function(d) {
        return strokeFor(d);
      })
      .style("stroke-width", 1.0);

    // console.log("400 node = ");
    // console.log(node);

    node.on("mouseover", showDetails)
      .on("mouseout", hideDetails);

    // console.log('409 vis.js showProps(node, "node") = ');
    // console.log(showProps(node, "node"));
    //console.log(stringify(node, null, '\t'));

    // var serialized = CircularJSON.stringify(node);

    // console.log("serialized = ", serialized);
var countN = 0;
    node.forEach(function(n) {
      // console.log('646 vis.js node.forEach(function (n) { showProps(n, "n")');
      // console.log(showProps(n, "n"));

      n.forEach(function(circle) {
        // console.log(" JSON.pruned(circle, 4, 10)\n");
        //   console.log(JSON.pruned(circle, 4, 4));
       countN++;
        if (countN < 5) {
          console.log("825 showProps(circle.r, 'circle.r'), # = ", countN);
          console.log(showProps(circle.r, "circle.r"));
        }
        
      });

    });

    return node.exit()
      .remove();
  };
  updateLinks = function() {
    link = linksG.selectAll("line.link")
      .data(curLinksData, function(d) {
        return "" + d.source.id + "_" + d.target.id;
      });
    link.enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#ddd")
      .attr("stroke-opacity", 0.8)
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });
    return link.exit()
      .remove();
  };
  setLayout = function(newLayout) {
    layout = newLayout;
    if(layout === "force") {
      return force.on("tick", forceTick)
        .charge($('#force_charge_select').val())
        .linkDistance($('#link_distance_select').val());
    } else if(layout === "radial") {
      return force.on("tick", radialTick)
        .charge(charge);
    }
  };
  setFilter = function(newFilter) {
    return filter = newFilter;
  };
  setSort = function(newSort) {
    return sort = newSort;
  };
  forceTick = function(e) {
    node.attr("cx", function(d) {
      return d.x;
    })
      .attr("cy", function(d) {
        return d.y;
      });
    return link.attr("x1", function(d) {
      return d.source.x;
    })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });
  };
  radialTick0 = function(e) {
    node.each(moveToRadialLayout(e.alpha));
    node.attr("cx", function(d) {
      return d.x;
    })
      .attr("cy", function(d) {
        return d.y;
      });
    if(e.alpha < 0.03) {
      force.stop();
      return updateLinks();
    }
  };

  // tick function for radial layout
  radialTick = function(e) {
    node.each(moveToRadialLayout(e.alpha));
    node.attr("cx", function(d) {
      return d.x;
    })
      .attr("cy", function(d) {
        return d.y;
      });
    // once alpha is sufficiently low (i.e. 
    // node positions are stabilized and not moving rapidly)
    // stop the animation and update the links
    if(e.alpha < 0.03) {
      force.stop();
      return updateLinks();
    }
      // need to manually update the weight of each node. 
      // This is usually done on force.start.
      // However in this layout no links are present at this 
      // point so all weight values are zero.
    //  link.each(function(l) {
    //    l.source.weight += 1;
     //   l.target.weight += 1;
    //  });
     // node.attr("r", function(d) {
      //  console.log(d.weight);                
      //  return Math.max(radius, radius + 2 * Math.log(d.weight));
     // });
     // console.log("729 node.r = ", node.r);
     // return 1;
    //}
  };

  moveToRadialLayout = function(alpha) {
    var k;
    k = alpha * 0.1;
    return function(d) {
      var centerNode;
      centerNode = groupCenters(d.artist);
      d.x += (centerNode.x - d.x) * k;
      return d.y += (centerNode.y - d.y) * k;
    };
  };
  strokeFor = function(d) {
    return d3.rgb(nodeColors(d.artist))
      .darker()
      .toString();
  };
  showDetails = function(d, i) {
    var content;
    content = '<p class="main">' + d.name + '</span></p>';
    content += '<hr class="tooltip-hr">';
    content += '<p class="main">' + d.artist + '</span></p>';
    tooltip.showTooltip(content, d3.event);
    if(link) {
      link.attr("stroke", function(l) {
        if(l.source === d || l.target === d) {
          return "#555";
        } else {
          return "#ddd";
        }
      })
        .attr("stroke-opacity", function(l) {
          if(l.source === d || l.target === d) {
            return 1.0;
          } else {
            return 0.5;
          }
        });
    }
    node.style("stroke", function(n) {
      if(n.searched || neighboring(d, n)) {
        return "#555";
      } else {
        return strokeFor(n);
      }
    })
      .style("stroke-width", function(n) {
        if(n.searched || neighboring(d, n)) {
          return 2.0;
        } else {
          return 1.0;
        }
      });
    return d3.select(this)
      .style("stroke", "black")
      .style("stroke-width", 2.0);
  };
  hideDetails = function(d, i) {
    tooltip.hideTooltip();
    node.style("stroke", function(n) {
      if(!n.searched) {
        return strokeFor(n);
      } else {
        return "#555";
      }
    })
      .style("stroke-width", function(n) {
        if(!n.searched) {
          return 1.0;
        } else {
          return 2.0;
        }
      });
    if(link) {
      return link.attr("stroke", "#ddd")
        .attr("stroke-opacity", 0.8);
    }
  };
  return network;
};

activate = function(group, link) {
  d3.selectAll("#" + group + " a")
    .classed("active", false);
  return d3.select("#" + group + " #" + link)
    .classed("active", true);
};

$(function() {
  var myNetwork;
  myNetwork = Network();
  d3.selectAll("#layouts a")
    .on("click", function(d) {
      var newLayout;
      newLayout = d3.select(this)
        .attr("id");
      activate("layouts", newLayout);
    console.log("newLayout = ", newLayout);
      return myNetwork.toggleLayout(newLayout);
    });
  d3.selectAll("#filters a")
    .on("click", function(d) {
      var newFilter;
      newFilter = d3.select(this)
        .attr("id");
      activate("filters", newFilter);
      return myNetwork.toggleFilter(newFilter);
    });
  d3.selectAll("#sorts a")
    .on("click", function(d) {
      var newSort;
      newSort = d3.select(this)
        .attr("id");
      activate("sorts", newSort);
      return myNetwork.toggleSort(newSort);
    });
  $("#song_select")
    .on("change", function(e) {
      var songFile;
      songFile = $(this)
        .val();
      console.log("vis 564 songfile = ", songfile);
      return d3.json("data/" + songFile, function(json) {
        return myNetwork.updateData(json);
      });
    });
  
  $("#force_charge_select")
    .on("change", function(e) {
      // console.log("vis 677 forceChargeParam = ", forceChargeParam);
      //var forceChargeParam;
      //forceChargeParam = $(this)
       // .val();
       //    myNetwork.forceChargeParam = forceChargeParam;
     // console.log("vis 685 myNetwork.forceChargeParam = ", myNetwork.forceChargeParam);
 
    activate("layouts", "force");
      return myNetwork.toggleLayout("force");

    //return d3.json("data/al-qaida.json", function(json) {
     //   return myNetwork.updateData(json);
     // });
    });

  
    $("#link_distance_select")
    .on("change", function(e) {
      // console.log("vis 677 forceChargeParam = ", forceChargeParam);
//      var linkDistanceChange;
 //     linkDistanceChange = $('#link_distance_select').val();
       // myNetwork.forceChargeParam = forceChargeParam;
     // console.log("vis 685 myNetwork.forceChargeParam = ", myNetwork.forceChargeParam);
 
    activate("layouts", "force");
      return myNetwork.toggleLayout("force");
    });

  
  
  $("#search")
    .keyup(function() {
      var searchTerm;
      searchTerm = $(this)
        .val();
      return myNetwork.updateSearch(searchTerm);
    });

  $("#search2")
    .keyup(function() {
      var searchTerm;
      searchTerm = $(this)
        .val();
      return myNetwork.updateSearch2(searchTerm);
    });

  
  
  
  // LOAD THE JSON DATA FILE HERE
  return d3.json("data/al-qaida.json", function(json) {    
    console.log(json);
    return myNetwork("#vis", json);
  });

});



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

var
// should be a not so common char
// possibly one JSON does not encode
// possibly one encodeURIComponent does not encode
// right now this char is '~' but this might change in the future
specialChar = '~',
  safeSpecialChar = '\\x' + (
    '0' + specialChar.charCodeAt(0)
    .toString(16)
  )
    .slice(-2),
  escapedSafeSpecialChar = '\\' + safeSpecialChar,
  specialCharRG = new RegExp(safeSpecialChar, 'g'),
  safeSpecialCharRG = new RegExp(escapedSafeSpecialChar, 'g'),

  safeStartWithSpecialCharRG = new RegExp('(?:^|([^\\\\]))' + escapedSafeSpecialChar),

  indexOf = [].indexOf || function(v) {
    for(var i = this.length; i-- && this[i] !== v;);
    return i;
  },
  $String = String // there's no way to drop warnings in JSHint
  // about new String ... well, I need that here!
  // faked, and happy linter!
  ;

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

// jend of stringify.js
