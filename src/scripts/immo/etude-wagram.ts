import { getAnnonces } from '../../utils/get-annonces';

getAnnonces('Etude Wagram', async function(page) {
  await page.goto('https://www.etude-wagram.com/locations/');

  await page.evaluate(() => {
    const option = <HTMLOptionElement>(
      document.querySelector(`select[name="filter[rooms]"] [value="3"]`)
    );
    option.selected = true;
  });

  await page.click(
    'form[action="https://www.etude-wagram.com/locations/"] input[type="submit"]',
  );
  await page.waitForNavigation();

  const annonces = await page.evaluate(() => {
    const anchors = <HTMLAnchorElement[]>(
      Array.from(document.querySelectorAll('.property_list .property .title a'))
    );
    return anchors.map((e) => ({
      lien: e.href.split('?')[0],
    }));
  });

  return annonces;
});
