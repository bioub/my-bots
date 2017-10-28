const path = require('path');

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const _ = require('lodash');

const config = require('../config');
const close = require('./close');
const sendMail = require('./send-mail');

const jsonFile = path.resolve(__dirname, '..', 'dbs', `${path.parse(process.mainModule.filename).name}.json`);

module.exports = async function getLinks(siteName, callback) {
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

    const newLinks = _.difference(links, oldLinks);
    console.log(`${new Date()} : ${newLinks.length} nouvelles annonces ${siteName}`);

    await fs.outputJson(jsonFile, links);

    if (newLinks.length) {
      sendMail(siteName, newLinks);
    }

    close(browser);
  }
  catch(err) {
    console.log(err.message);
    close(browser);
    process.exit(1);
  }
}
