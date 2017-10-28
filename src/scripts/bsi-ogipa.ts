import { getLinks } from '../utils/get-links';

getLinks('BSI OGIPA', async function(page) {
  await page.goto('http://www.bsi-ogipa.fr/recherche-location?field_type_offre_value=All&TypeTrans=02&field_surface_habitable_value=&field_surface_habitable_value_1=&field_loyer_value=&field_loyer_value_1=2200&field_nombre_de_piece_value=3&Cp1=&field_code_postal_value=&field_ville_value=&disponibilite=');

  const links = await page.evaluate(() => {
    const anchors = <HTMLAnchorElement[]> Array.from(document.querySelectorAll('.views-field-view-node a'));
    return anchors.map(anchor => anchor.href);
  });

  return links;
});



