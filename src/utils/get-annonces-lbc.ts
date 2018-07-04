import { resolve, parse } from 'path';

import { launch, Page } from 'puppeteer';
import { readJson, outputJson } from 'fs-extra';
import { differenceBy } from 'lodash';

import { config, close, readDb, writeDb, sendAnnoncesLbc, logger } from './';
import { Annonce } from '../models/annonce';

const debug = process.argv[2] === '--debug';

export async function getAnnoncesLbc(keywords: string[]) {
  let browser, oldAnnonces;
  try {
    const db = await readDb(process.mainModule.filename);
    const oldAnnonces = db.annonces || [];

    browser = await launch(config);
    const page = await browser.newPage();

    const currentAnnonces = [];

    for (let keyword of keywords) {
      await page.goto(
        `https://www.leboncoin.fr/_immobilier_/offres/ile_de_france/?th=1&q=${keyword}&location=Paris%2075017`,
      );

      const annonces = await page.evaluate((keyword) => {
        function trim(str: string) {
          return str.trim().replace(/\s+/g, ' ');
        }

        const anchors = <HTMLAnchorElement[]>(
          Array.from(document.querySelectorAll('.list_item'))
        );
        return anchors.map((a) => {
          const titre = a.querySelector('h2')
            ? keyword + ' : ' + trim(a.querySelector('h2').textContent)
            : '';
          const description = a.querySelector('p.item_supp')
            ? trim(a.querySelector('p.item_supp').textContent)
            : '';
          const prix = a.querySelector('h3.item_price')
            ? trim(a.querySelector('h3.item_price').textContent)
            : '';

          const photos = Array.from(a.querySelectorAll('.item_image img')).map(
            (img: HTMLImageElement) => img.src,
          );

          return <Annonce>{
            lien: a.href,
            titre,
            description,
            prix,
            photos,
          };
        });
      }, keyword);

      for (let a of annonces) {
        const already = currentAnnonces.find((ca) => ca.lien === a.lien);
        if (!already) {
          currentAnnonces.push(a);
        }
      }
    }

    const newAnnonces = <Annonce[]>(
      differenceBy(currentAnnonces, oldAnnonces, (a: Annonce) => a.lien)
    );
    logger.info(`LeBonCoin : ${newAnnonces.length} nouvelles annonces`);

    await writeDb(process.mainModule.filename, {
      annonces: [...oldAnnonces, ...newAnnonces],
    });

    if (newAnnonces.length) {
      sendAnnoncesLbc(newAnnonces);
    }

    if (!debug) {
      close(browser);
    }
  } catch (err) {
    logger.error(`LeBonCoin : ${err.message}`);
    if (!debug) {
      close(browser);
    }
    process.exit(1);
  }
}
