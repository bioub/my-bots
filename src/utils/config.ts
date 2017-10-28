import * as fs from 'fs-extra';

const config = fs.readJsonSync(__dirname + '/../../config/config.json');
let configLocal;

try {
  configLocal = fs.readJsonSync(__dirname + '/../../config/config.local.json');
}
catch (err) {
  configLocal = {};
}

export default Object.assign(config, configLocal);
