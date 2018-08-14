import { resolve } from 'path';
import { spawnSync, execSync } from 'child_process';
import {
  readFileSync,
  unlinkSync,
  writeFileSync,
  remove,
  writeFile,
} from 'fs-extra';
import { sendWhoisToSlack } from '../../utils/send-whois-to-slack';
import { config, logError } from '../../utils';
import { readFile } from 'fs-extra';
import * as whoisJson from 'whois-json';

async function readDbWhois(domain) {
  domain = domain.replace('.', '_');
  let db;

  try {
    db = await readFile(resolve(__dirname, `../../../dbs/whois/${domain}`));
  } catch (err) {
    db = '';
  }

  return db;
}

async function writeDbWhois(domain: string, whois) {
  domain = domain.replace('.', '_');
  const dbPath = resolve(__dirname, `../../../dbs/whois/${domain}`);
  await remove(dbPath);
  await writeFile(dbPath, whois);
}

async function whois() {
  const domainsToWatchPath = resolve(
    __dirname,
    '../../../domains-to-watch.txt',
  );
  const domainsToWatchStr = await readFile(domainsToWatchPath, {
    encoding: 'utf-8',
  });
  const domains = domainsToWatchStr
    .split('\n')
    .filter((d) => d.match(/[a-z]+(-[a-z]+)*\.[a-z]+/));

  for (const domain of domains) {
    const previousWhois = await readDbWhois(domain);

    const currentWhois = await whoisJson('domain.fr');

    console.log(currentWhois);
    process.exit(0);

    await sendWhoisToSlack(config.slack.hooks.whois, domain, currentWhois);
    await writeDbWhois(domain, currentWhois);
    await timeout(400);
  }
}

function timeout(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

whois().catch((err) => console.log(err));
