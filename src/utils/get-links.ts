import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs-extra';
import { difference } from 'lodash';
import { Page } from 'puppeteer';
import config from './config';
import { close } from './close';
import { sendMail } from './send-mail';

const debug = process.argv[2] === '--debug';

const jsonFile = path.resolve(__dirname, '..', '..', 'dbs', `${path.parse(process.mainModule.filename).name}.json`);


export async function getLinks(siteName: string, callback: (page: Page) => Promise<any>) {
  let browser, oldLinks;
  try {
    try {
      oldLinks = await fs.readJson(jsonFile);
    }
    catch (err) {
      oldLinks = [];
    }

    browser = await puppeteer.launch(config);
    const page = await browser.newPage();

    const links = await callback(page);

    const newLinks = difference(links, oldLinks);
    console.log(`${new Date()} : ${newLinks.length} nouvelles annonces ${siteName}`);

    await fs.outputJson(jsonFile, links);

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
