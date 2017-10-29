import { getLinks } from '../utils/get-links';

getLinks('Paris Neuilly Immobilier', async (page) => {
  await page.goto('http://www.parisneuillyimmobilier.com/louer');

  // await page.click('#svg-paris-92');
  // await page.click('#svg-paris-centre');
  // await page.click('#svg-paris-ouest');

  const links = await page.evaluate(() => {
    const finderPriceSlider = <any> document.querySelector('#finder-price-slider');
    finderPriceSlider.noUiSlider.set(2100);

    const finderRoomsSlider = <any> document.querySelector('#finder-rooms-slider');
    finderRoomsSlider.noUiSlider.set(2);

    const paris92 = document.querySelector('#svg-paris-92');
    const parisCentre = document.querySelector('#svg-paris-centre');
    const parisOuest = document.querySelector('#svg-paris-ouest');

    const event = document.createEvent('MouseEvent');
    event.initEvent('click', false, false);

    paris92.dispatchEvent(event);
    parisCentre.dispatchEvent(event);
    parisOuest.dispatchEvent(event);

    const anchors = <HTMLAnchorElement[]> Array.from(document.querySelectorAll('.finder-item:not(.hidden) a'));
    return anchors.map(anchor => anchor.href);
  });

  return links;
});



