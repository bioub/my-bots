import { getAnnonces } from '../utils/get-annonces';

getAnnonces('Paris Neuilly Immobilier', async (page) => {
  await page.goto('http://www.parisneuillyimmobilier.com/louer');

  const annonces = await page.evaluate(() => {
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
    return anchors.map(anchor => ({
      lien: anchor.href
    }));
  });

  return annonces;
});



