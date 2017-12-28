import { resolve, parse } from 'path';

import { launch, Page } from 'puppeteer';
import { readJson, outputJson } from 'fs-extra';
import { differenceBy } from 'lodash';

import { config } from './config';
import { close } from './close';
import { Annonce } from '../models/annonce';
import { sendAnnonces } from './send-annonces';

const debug = process.argv[2] === '--debug';

const jsonFile = resolve(
  __dirname,
  '..',
  '..',
  'dbs',
  `${parse(process.mainModule.filename).name}.json`,
);

export async function getAnnonces(
  siteName: string,
  callback: (page: Page) => Promise<Annonce[]>,
) {
  let browser, oldAnnonces;
  try {
    try {
      oldAnnonces = await readJson(jsonFile);
    } catch (err) {
      oldAnnonces = [];
    }

    browser = await launch(config);
    const page = await browser.newPage();

    const currentAnnonces = await callback(page);

    const newAnnonces = <Annonce[]>differenceBy(
      currentAnnonces,
      oldAnnonces,
      (a: Annonce) => a.lien,
    );
    console.log(
      `${new Date()} : ${newAnnonces.length} nouvelles annonces ${siteName}`,
    );

    await outputJson(jsonFile, [...oldAnnonces, ...newAnnonces]);

    if (newAnnonces.length) {
      sendAnnonces(siteName, newAnnonces);
    }

    if (!debug) {
      close(browser);
    }
  } catch (err) {
    console.log(`[Erreur] ${siteName} : ${err.message}`);
    if (!debug) {
      close(browser);
    }
    process.exit(1);
  }
}
