#!/bin/bash

#check if we need to pull wiki repo
! ls wiki &> /dev/null && echo "Pulling docs wiki repo" && git clone https://github.com/joeedh/STRUCT.wiki.git wiki

./node_modules/.bin/esdoc

