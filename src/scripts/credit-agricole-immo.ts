import { getAnnonces } from '../utils/get-annonces';

getAnnonces('Crédit Agricole Immobilier', async function (page) {
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

  const annonces = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('.voir_detail'));
    return anchors.map(a => ({
      lien: a.getAttribute('onclick').match(/document.location.href="([^"]+)"/)[1]
    }));
  });

  return annonces;
});
