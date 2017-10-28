const getLinks = require('../utils/get-links');

getLinks('Etude Wagram', async function(page) {
  await page.goto('https://www.etude-wagram.com/locations/');

  await page.evaluate(() => {
    document.querySelector(`select[name="filter[rooms]"] [value="3"]`).selected = true;
  });

  await page.click('form[action="https://www.etude-wagram.com/locations/"] input[type="submit"]');
  await page.waitForNavigation();

  const links = await page.evaluate(() => {
    var anchors = Array.from(document.querySelectorAll('.property_list .property .title a'));
    return anchors.map(function (e) {
      return e.href.split('?')[0];
    });
  });

  return links;
});



