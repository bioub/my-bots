const path = require('path');

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const _ = require('lodash');

const config = require('../config');
const close = require('../utils/close');
const sendMail = require('../utils/send-mail');

const jsonFile = path.resolve(__dirname, '..', 'dbs', `${path.parse(__filename).name}.json`);
const NOM_SITE = 'SwissLife Location';

(async () => {
  let browser;
  try {
    const oldLinks = await fs.readJson(jsonFile);

    browser = await puppeteer.launch(config);
    const page = await browser.newPage();
    await page.goto('http://www.swisslife-immobilier.com/recherche/');

    await page.click('form[name=tridateenr] button');
    await page.waitForSelector('form[name=tridateenr] .triangleasc');

    await page.click('form[name=tridateenr] button');
    await page.waitForSelector('form[name=tridateenr] .triangledesc');

    const links = await page.evaluate(() => {
      var anchors = Array.from(document.querySelectorAll('article.panelBien'));
      return anchors.map(function (e) {
        return 'http://www.swisslife-immobilier.com' +
          e.getAttribute('onclick').match(/location.href='([^"]+)'/)[1];
      });
    });

    const newLinks = _.difference(links, oldLinks);
    console.log(`${new Date()} : ${newLinks.length} nouvelles annonces ${NOM_SITE}`);

    await fs.outputJson(jsonFile, links);

    if (newLinks.length) {
      sendMail(NOM_SITE, newLinks);
    }

    close(browser);
  }
  catch (err) {
    console.log(err.message);
    close(browser);
    process.exit(1);
  }
})();
