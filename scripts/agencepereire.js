const getLinks = require('../utils/get-links');

getLinks('Agence Perreire', async function(page) {
  await page.goto('http://www.agencepereire.com/immobilier/pays/locations/france.htm');

  await page.click('[data-name="nb_pieces"]');

  const checkbox = await page.$('[data-name="nb_pieces"][data-value="3"]');

  if (checkbox) {
    await page.click('[data-name="nb_pieces"][data-value="3"]');
    await page.click('[data-name="nb_pieces"] + div .bouton-rechercher-location');
    await page.waitForSelector('[data-qry="nb_pieces"]');

    links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('#recherche-resultats-listing .span8 a[href^="http://www.agencepereire.com/annonces/"]'));
      return anchors.map(anchor => anchor.href);
    });
  }
  else {
    links = [];
  }

  return links;
});



