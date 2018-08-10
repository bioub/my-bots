import { Annonce } from '../../models/annonce';
import axios from 'axios';
import { getDistance, PositionAsDecimal } from 'geolib';
import { logError, readDb, config, writeDb, logger } from '../../utils';
import { sendAnnoncesToSlack } from '../../utils/send-annonces-to-slack';

// https://ws.pap.fr/immobilier/annonces?recherche[geo][ids][]=37784&recherche[geo][ids][]=37775&order=date-desc

// 11 rue Laugier
const home = {
  latitude: 48.87996159999999,
  longitude: 2.2967449,
};

async function getAnnoncesPap() {
  const db = await readDb(process.mainModule.filename);
  const oldAnnonces = db.annonces || [];
  const oldAnnoncesIds = oldAnnonces.map((a) => a.id);

  const res = await axios.get(
    'https://ws.pap.fr/immobilier/annonces?recherche[geo][ids][]=37784&recherche[geo][ids][]=37775&order=date-desc',
  );

  const annoncesWithMarkers = res.data._embedded.annonce.filter(
    (a) => !!a.marker,
  );
  const annonces: Annonce[] = [];

  for (const a of annoncesWithMarkers) {
    const coords: PositionAsDecimal = {
      latitude: a.marker.lat,
      longitude: a.marker.lng,
    };

    // nouvelles annonces uniquement
    if (oldAnnoncesIds.includes(a.id)) {
      continue;
    }

    // annonce dans un rayon de 1200m
    if (getDistance(coords, home) > 1200) {
      continue;
    }

    const resAn = await axios.get(a._links.self.href);

    annonces.push({
      id: resAn.data.id,
      prix: resAn.data.prix,
      superficie: resAn.data.surface,
      pieces: resAn.data.nb_pieces,
      categorie: resAn.data.produit,
      titre: 'Annonce PAP',
      lien: resAn.data._links.desktop_canonical.href,
      description: resAn.data.texte,
      photos: resAn.data._embedded.photo.map((p) => p._links.self.href),
    });
  }

  logger.info(`PAP : ${annonces.length} nouvelles annonces`);

  await writeDb(process.mainModule.filename, {
    annonces: [...oldAnnonces, ...annonces],
  });

  if (annonces.length) {
    await sendAnnoncesToSlack(config.slack.hooks.pap, 'PAP', annonces);
  }
}

getAnnoncesPap().catch(logError('PAP'));
