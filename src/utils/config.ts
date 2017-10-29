import { readJsonSync } from 'fs-extra';
import { resolve } from 'path';

const configGlobal = readJsonSync(resolve(__dirname, '..', '..', 'config', 'config.json'));
let configLocal;

try {
  configLocal = readJsonSync(resolve(__dirname, '..', '..', 'config', 'config.local.json'));
}
catch (err) {
  configLocal = {};
}

export const config = {...configGlobal, ...configLocal};
