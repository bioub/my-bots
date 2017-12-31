import { getAnnonces } from '../../utils/get-annonces';

getAnnonces('Agence Saint Ferdinand', async page => {
  await page.goto('http://www.agencessaintferdinand.com/louer/');

  const annonces = await page.evaluate(() => {
    const anchors = <HTMLElement[]>Array.from(
      document.querySelectorAll('.property_listing'),
    );
    return anchors.map(anchor => ({
      lien: anchor.dataset.link,
    }));
  });

  return annonces;
});
