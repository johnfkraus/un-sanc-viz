#!/bin/bash

# copy all json files

# find ~/WebStormProjects/un-sanc-viz/data  -iname \*.xml -print0 | xargs -0 -I {} cp {}  ~/WebStormProjects/un-sanc-viz/data/xml
find ~/WebStormProjects/un-sanc-viz/data  -iname \*.json -print0 | xargs -0 -I {} cp {}  ~/WebStormProjects/un-sanc-viz/data/json


