#!/bin/bash
export PATH=/usr/local/bin:$PATH
cd /Users/romain/Bots
/Users/romain/Bots/node_modules/casperjs/bin/casperjs annonces-ca-immo.js
/Users/romain/Bots/node_modules/casperjs/bin/casperjs annonces-swisslife-immo.js
/usr/local/bin/node agencepereire.js
