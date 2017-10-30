import { resolve, parse } from 'path';

import { launch, Page } from 'puppeteer';
import { readJson, outputJson } from 'fs-extra';
import { difference } from 'lodash';

import { config } from './config';
import { close } from './close';
import { sendMail } from './send-mail';

const debug = process.argv[2] === '--debug';

const jsonFile = resolve(__dirname, '..', '..', 'dbs', `${parse(process.mainModule.filename).name}.json`);


export async function getLinks(siteName: string, callback: (page: Page) => Promise<any>) {
  let browser, oldLinks;
  try {
    try {
      oldLinks = await readJson(jsonFile);
    }
    catch (err) {
      oldLinks = [];
    }

    browser = await launch(config);
    const page = await browser.newPage();

    const links = await callback(page);

    const newLinks = <string[]> difference(links, oldLinks);
    console.log(`${new Date()} : ${newLinks.length} nouvelles annonces ${siteName}`);

    await outputJson(jsonFile, [...oldLinks, ...newLinks]);

    if (newLinks.length) {
      sendMail(siteName, newLinks);
    }

    if (!debug) {
      close(browser);
    }
  }
  catch(err) {
    console.log(err.message);
    if (!debug) {
      close(browser);
    }
    process.exit(1);
  }
}
