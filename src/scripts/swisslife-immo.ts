import { getLinks } from '../utils/get-links';

getLinks('SwissLife Location', async function (page) {
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

  return links;
});
