#!/bin/bash
#
# Example of how to parse short/long options with 'getopt'
#

OPTS=`getopt -o wgjdcCrm --long webdriver,json-to-mongo,download-images,cleanup,credits,reset,mongo -- "$@"`

if [ $? != 0 ] ; then echo "Failed parsing options." >&2 ; exit 1 ; fi

eval set -- "$OPTS"

WEBDRIVER=false
GENERATEJSON=false
JSONTOMONGO=false
DOWNLOADIMAGES=false
CLEANUP=false
CREDITS=false
RESET=false
MONGO=false

while true; do
  case "$1" in
    -w | --webdriver ) WEBDRIVER=true; shift ;;
    -g | --generate-json) GENERATEJSON=true; shift ;;
    -j | --json-to-mongo) JSONTOMONGO=true; shift ;;
    -d | --download-images) DOWNLOADIMAGES=true; shift ;;
    -c | --cleanup) CLEANUP=true; shift ;;
    -C | --credits ) CREDITS=true; shift ;;
    -r | --reset ) RESET=true; shift ;;
    -m | --mongo) MONGO=true; shift ;;
    -- ) shift; break ;;
    * ) break ;;
  esac
done

if $WEBDRIVER
  then
    echo --- RUNNING WEBDRIVER ---
    pkill -f webdriver
    ./node_modules/protractor/bin/webdriver-manager update > /dev/null 2>&1
    sleep 10
    ./node_modules/protractor/bin/webdriver-manager start > /dev/null 2>&1 &
    sleep 10
fi

if $GENERATEJSON
  then
    echo --- RUNNING GENERATEJSON ---
    ./node_modules/protractor/bin/protractor conf.js
fi

if $MONGO
  then
    echo --- RUNNING MONGO ---
    pkill -f mongod
    mongod --dbpath ../mongodb > /dev/null 2>&1 &
    sleep 10
fi

if $JSONTOMONGO
  then
    echo --- RUNNING JSONTOMONGO ---
    node jsonToMongo.js
fi

if $DOWNLOADIMAGES
  then
    echo --- RUNNING DOWNLOADIMAGES ---
    java -jar ./target/reddit-image-fetcher-1.0-SNAPSHOT-jar-with-dependencies.jar
fi

if $CLEANUP
  then
    echo --- RUNNING CLEANUP ---
    ./cleanup.sh
fi

if $CREDITS
  then
    echo --- RUNNING CREDITS ---
    echo you have `imgur -c` imgur credits left
fi

if $RESET
  then
    echo --- RUNNING RESET ---
    echo imgur credits will reset at `imgur -r`
fi
