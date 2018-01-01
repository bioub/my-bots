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
        `https://www.leboncoin.fr/_immobilier_/offres/ile_de_france/?th=1&q=${
          keyword
        }&location=Paris%2075017`,
      );

      const annonces = await page.evaluate(keyword => {
        const anchors = <HTMLAnchorElement[]>Array.from(
          document.querySelectorAll('.list_item'),
        );
        return anchors.map(
          a =>
            <Annonce>{
              lien: a.href,
              titre:
                keyword +
                ' : ' +
                a
                  .querySelector('h2')
                  .textContent.trim()
                  .replace(/\s+/g, ' '),
              description: a
                .querySelector('p.item_supp')
                .textContent.trim()
                .replace(/\s+/g, ' '),
              prix: a
                .querySelector('h3.item_price')
                .textContent.trim()
                .replace(/\s+/g, ' '),
              photos: Array.from(a.querySelectorAll('.item_image img')).map(
                (img: HTMLImageElement) => img.src,
              ),
            },
        );
      }, keyword);

      for (let a of annonces) {
        const already = currentAnnonces.find(ca => ca.lien === a.lien);
        if (!already) {
          currentAnnonces.push(a);
        }
      }
    }

    const newAnnonces = <Annonce[]>differenceBy(
      currentAnnonces,
      oldAnnonces,
      (a: Annonce) => a.lien,
    );
    logger.info(`LeBonCoin : ${newAnnonces.length} nouvelles annonces`);

    await outputJson(process.mainModule.filename, {
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
