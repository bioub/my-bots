#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

for f in dist/scripts/toogoodtogo/*.js; do
node $f;
done
