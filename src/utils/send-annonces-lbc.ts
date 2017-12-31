import { config } from './config';
import { Annonce } from '../models/annonce';
import axios from 'axios';

export async function sendAnnoncesLbc(annonces: Annonce[]) {
  const attachments = annonces.map(a => {
    const attachment = {
      fallback: `${a.titre} ${a.lien}`,
      title: a.titre,
      title_link: a.lien,
      text: `${a.description} ${a.prix}`,
    };

    if (a.photos.length) {
      attachment['image_url'] = a.photos[0];
    }

    return attachment;
  })

  await axios.post('https://hooks.slack.com/services/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', {
    text: `${annonces.length} nouvelle${annonces.length>1?'s':''} annonce${annonces.length>1?'s':''} LeBonCoin`,
    attachments,
  });
}
