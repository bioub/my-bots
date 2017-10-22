const fs = require('fs-extra');

const config = fs.readJsonSync(__dirname + '/config.json');
let configLocal;

try {
  configLocal = fs.readJsonSync(__dirname + '/config.local.json');
}
catch (err) {
  configLocal = {};
}

module.exports = Object.assign(config, configLocal);
