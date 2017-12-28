import { getAnnonces } from '../utils/get-annonces';

getAnnonces('La Foncière du 17e', async page => {
  await page.goto('http://www.fonciere17.com/');

  await page.click('#transactionLocation');

  await page.click('#C_34_MIN');
  await page.keyboard.type('55');

  await page.click('#C_30_MAX');
  await page.keyboard.type('2200');

  await page.click('#search button[type="submit"]');

  await page.waitForNavigation();

  const annonces = await page.evaluate(() => {
    const anchors = <HTMLAnchorElement[]>Array.from(
      document.querySelectorAll('.bien a.thumbnail'),
    );
    return anchors.map(anchor => ({
      lien: anchor.href,
    }));
  });

  return annonces;
});
