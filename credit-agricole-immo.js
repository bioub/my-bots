const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const _ = require('lodash');

const NOM_SITE = 'Crédit Agricole Immobilier';

const api_key = 'key-2b0cc9c36ed603961e740e88a963976b';
const DOMAIN = 'mail.bioub.com';
const mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

const { name } = path.parse(__filename);
const jsonFile = path.join(__dirname, `${name}.json`);

async function close(browser) {
  try {
    await browser.close();
  }
  catch(err) {
    console.log(err.message);
  }
};

(async () => {
  let browser;
  try {
    const annoncesStr = await fs.readFile(jsonFile);
    const oldLinks = JSON.parse(annoncesStr);
  
    const options = {};
    if (process.env.USER === 'pi') {
      options.executablePath = '/usr/bin/chromium-browser';
    }

    browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    await page.goto('http://www.ca-immobilier-location.fr/liste_programmes.php');
    
    await page.click('#loc_1');
    await page.keyboard.type('Paris');

    await page.click('#loc_2');
    await page.keyboard.type('92200');

    await page.click('#loc_3');
    await page.keyboard.type('92300');

    await page.click('[name=pieces_3]');

    await page.click('#prix_max');
    await page.keyboard.type('2200');

    await page.click('#rech_bloc_valid');

    await page.waitForSelector('.liste_transaction');

    const links = await page.evaluate(() => {
      var anchors = Array.from(document.querySelectorAll('.voir_detail'));
      return anchors.map(function(e) {
        return e.getAttribute('onclick').match(/document.location.href="([^"]+)"/)[1];
      });
    });
  
    const newLinks = _.difference(links, oldLinks);
    console.log(`${new Date()} : ${newLinks.length} nouvelles annonces ${NOM_SITE}`);
    
    await fs.writeFile(jsonFile, JSON.stringify(links));
    
    if (newLinks.length) {
      const data = {
        from: `Bot ${NOM_SITE} <postmaster@mail.bioub.com>`,
        to: 'Romain Bohdanowicz <bioub@icloud.com>, Caroline Fournier <caroline.fournier14@gmail.com>',
        subject: `Nouvelles annonces ${NOM_SITE}`,
        text: newLinks.join('\n')
      };
  
      mailgun.messages().send(data, function (error, body) {
        console.log(body);
      });
    }
    close(browser);
  }
  catch(err) {
    console.log(err.message);
    close(browser);
    process.exit(1);
  }
})();