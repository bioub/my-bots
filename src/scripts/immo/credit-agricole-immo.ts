import { getAnnonces } from '../../utils/get-annonces';

getAnnonces('Crédit Agricole Immobilier', async function(page) {
  await page.goto(
    'https://www.ca-immobilier.fr/louer/recherche?sections=location&codes=75%3Aparis&zones=3%2C4%2C5%2Cmore&maxprice=2200&sortby=price_asc',
  );

  const annonces = await page.evaluate(() => {
    const anchors = <HTMLAnchorElement[]>(
      Array.from(
        document.querySelectorAll(
          '#preview-zone .columns .sub_card-entities--top_hover a',
        ),
      )
    );
    return anchors.map((a) => ({
      lien: a.href,
    }));
  });

  return annonces;
});
