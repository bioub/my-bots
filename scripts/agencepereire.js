const path = require('path');

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const _ = require('lodash');

const config = require('../config');
const close = require('../utils/close');
const sendMail = require('../utils/send-mail');

const jsonFile = path.resolve(__dirname, '..', 'dbs', `${path.parse(__filename).name}.json`);
const NOM_SITE = 'Agence Perreire';

(async () => {
  let browser;
  try {
    const oldLinks = await fs.readJson(jsonFile);

    browser = await puppeteer.launch(config);
    const page = await browser.newPage();
    await page.goto('http://www.agencepereire.com/immobilier/pays/locations/france.htm');

    await page.click('[data-name="nb_pieces"]');
    await page.click('[data-name="nb_pieces"][data-value="3"]');
    await page.click('[data-name="nb_pieces"] + div .bouton-rechercher-location');
    await page.waitForSelector('[data-qry="nb_pieces"]');

    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('#recherche-resultats-listing .span8 a[href^="http://www.agencepereire.com/annonces/"]'));
      return anchors.map(anchor => anchor.href);
    });

    const newLinks = _.difference(links, oldLinks);
    console.log(`${new Date()} : ${newLinks.length} nouvelles annonces ${NOM_SITE}`);

    await fs.outputJson(jsonFile, links);

    if (newLinks.length) {
      sendMail(NOM_SITE, newLinks);
    }

    close(browser);
  }
  catch(err) {
    console.log(err.message);
    close(browser);
    process.exit(1);
  }
})();
