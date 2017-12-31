import { getAnnonces } from '../../utils/get-annonces';

getAnnonces('SwissLife Location', async function(page) {
  await page.goto('http://www.swisslife-immobilier.com/recherche/');

  await page.click('form[name=tridateenr] button');
  await page.waitForSelector('form[name=tridateenr] .triangleasc');

  await page.click('form[name=tridateenr] button');
  await page.waitForSelector('form[name=tridateenr] .triangledesc');

  const annonces = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('article.panelBien'));
    return anchors.map(a => ({
      lien:
        'http://www.swisslife-immobilier.com' +
        a.getAttribute('onclick').match(/location.href='([^"]+)'/)[1],
    }));
  });

  return annonces;
});
