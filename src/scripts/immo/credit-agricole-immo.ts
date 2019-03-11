import { getAnnonces } from '../../utils/get-annonces';

getAnnonces('Crédit Agricole Immobilier', async function(page) {
  await page.goto(
    'https://www.ca-immobilier.fr/louer/location/logement/75_paris',
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
