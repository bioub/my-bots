import { getLinks } from '../utils/get-links';

getLinks('Agence Saint Ferdinand', async function(page) {
  await page.goto('http://www.agencessaintferdinand.com/louer/');

  const links = await page.evaluate(() => {
    const anchors = <HTMLElement[]> Array.from(document.querySelectorAll('.property_listing'));
    return anchors.map(anchor => anchor.dataset.link);
  });

  return links;
});



