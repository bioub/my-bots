import { getLinks } from '../utils/get-links';

getLinks('Consultants Immobilier', async (page) => {
  await page.setViewport({width: 1500, height: 2000});
  await page.goto('https://www.consultants-immobilier.com/louer/');

  await page.click('a[href="/louer"]');
  await page.waitForNavigation();

  await page.waitForFunction(function() {
    const div = <HTMLElement> document.querySelector('.bloc-criteria');
    return !!div.style.height;
  });

  // #form_budget_max -> 2200
  await page.click('#form_budget_max');
  await page.keyboard.type('2200');

  // #bedroom -> 2
  await page.click('#bedroom');
  await page.keyboard.type('2');

  // .submitsearchform
  await page.click('.submitsearchform');
  await page.waitForNavigation();

  const links = await page.evaluate(() => {
    const anchors = <HTMLElement[]> Array.from(document.querySelectorAll('.annonces .annonce .carousel-inner.more'));
    console.log(anchors);
    return anchors.map(
      anchor => `https://www.consultants-immobilier.com/achat/paris/appartement/${anchor.dataset.slug}/`
    );
  });

  return links;
});



