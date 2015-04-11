#!/bin/bash

# find /mnt/zip -name "*prefs copy" -print0 | xargs -0 -p /bin/rm

# find . -iname \*.xml -print0 

# find . -iname \*.xml -print0 | xargs -0 cp  ~/WebStormProjects/un-sanc-viz/data/xml/
# find . -iname \*.xml | xargs cp {}  ~/WebStormProjects/un-sanc-viz/data/xml/
# find ~/WebStormProjects/un-sanc-viz/data  -iname \*.xml | xargs cp {}  ~/WebStormProjects/un-sanc-viz/data/xml/
# find ~/WebStormProjects/un-sanc-viz/data  -iname \*.xml | xargs cp {}  C:\Users\User1\WebstormProjects\un-sanc-viz\data\xml

# find . -name "*.bak" -print0 | xargs -0 -I {} mv {} ~/old.files


# find ~/WebStormProjects/un-sanc-viz/data  -iname \*.xml -print0 | xargs -0 -I {} cp {}  ~/WebStormProjects/un-sanc-viz/data/xml
find ~/WebStormProjects/un-sanc-viz/data  -iname \*.json -print0 | xargs -0 -I {} cp {}  ~/WebStormProjects/un-sanc-viz/data/json


