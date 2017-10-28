import { readJsonSync } from 'fs-extra';
import { resolve } from 'path';

const config = readJsonSync(resolve(__dirname, '..', '..', 'config', 'config.json'));
let configLocal;

try {
  const config = readJsonSync(resolve(__dirname, '..', '..', 'config', 'config.local.json'));
}
catch (err) {
  configLocal = {};
}

export default {...config, ...configLocal};
