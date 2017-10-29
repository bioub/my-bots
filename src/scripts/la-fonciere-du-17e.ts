import { getLinks } from '../utils/get-links';

getLinks('La Foncière du 17e', async (page) => {
  await page.goto('http://www.fonciere17.com/');

  await page.click('#transactionLocation');


  await page.click('#C_34_MIN');
  await page.keyboard.type('55');

  await page.click('#C_30_MAX');
  await page.keyboard.type('2200');

  await page.click('#search button[type="submit"]');

  await page.waitForNavigation();

  const links = await page.evaluate(() => {
    const anchors = <HTMLAnchorElement[]> Array.from(document.querySelectorAll('.bien a.thumbnail'));
    return anchors.map(anchor => `http://www.fonciere17.com/${anchor.href.slice(2)}`);
  });

  return links;
});



