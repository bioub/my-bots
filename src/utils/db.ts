import { parse, resolve } from 'path';
import { config } from './config';
import { readJson, outputJson } from 'fs-extra';

function getDbPath(absScript) {
  let { dir, name } = parse(absScript);
  dir = dir.substr(dir.lastIndexOf('/') + 1);

  return resolve(config.rootDir, 'dbs', dir, `${name}.json`);
}

export async function readDb(absScript) {
  let db;

  try {
    db = await readJson(getDbPath(absScript));
  } catch (err) {
    db = {
      data: {}
    };
  }

  return db.data;
}

export async function writeDb(absScript, data) {
  const db = {
    updated: new Date(),
    data,
  };

  await outputJson(getDbPath(absScript), db);
}
