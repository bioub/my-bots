#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
node annonces-ca-immo.js
node annonces-swisslife-immo.js
node agencepereire.js
