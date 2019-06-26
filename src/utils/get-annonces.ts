import { launch, Page } from 'puppeteer';
import { differenceBy } from 'lodash';

import { Annonce } from '../models/annonce';
import { config, close, sendAnnonces, readDb, writeDb, logger } from '.';

const debug = process.argv[2] === '--debug';

export async function getAnnonces(
  siteName: string,
  callback: (page: Page) => Promise<Annonce[]>,
) {
  let browser;
  try {
    const db = await readDb(process.mainModule.filename);
    const oldAnnonces = db.annonces || [];

    browser = await launch(config);
    const page = await browser.newPage();

    const currentAnnonces = await callback(page);

    const newAnnonces = <Annonce[]>(
      differenceBy(currentAnnonces, oldAnnonces, (a: Annonce) => a.lien)
    );
    logger.info(`${siteName} : ${newAnnonces.length} nouvelles annonces`);

    await writeDb(process.mainModule.filename, {
      annonces: [...oldAnnonces, ...newAnnonces],
    });

    if (newAnnonces.length) {
      sendAnnonces(siteName, newAnnonces);
    }

    if (!debug) {
      close(browser);
    }
  } catch (err) {
    logger.error(`${siteName} : ${err.message}`);
    if (!debug) {
      close(browser);
    }
    process.exit(1);
  }
}
