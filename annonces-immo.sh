#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
node credit-agricole-immo.js
node swisslife-immo.js
node agencepereire.js
