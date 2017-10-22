const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const _ = require('lodash');

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
  
    browser = await puppeteer.launch();
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
    console.log(`${new Date()} : ${newLinks.length} nouvelles annonces Agence Pereire`);
    
    
    await fs.writeFile(__dirname + '/agencepereire.json', JSON.stringify(links));
    
    if (newLinks.length) {
      const data = {
        from: 'Bot Agence Pereire <postmaster@mail.bioub.com>',
        to: 'Romain Bohdanowicz <bioub@icloud.com>, Caroline Fournier <caroline.fournier14@gmail.com>',
        subject: 'Nouvelles annonces Agence Pereire',
        text: newLinks.join('\n')
      };
  
      mailgun.messages().send(data, function (error, body) {
        console.log(body);
      });
    }    
  }
  catch(err) {
    console.log(err.message);
  }
  finally {
    close(browser);
  }
})();