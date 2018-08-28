import { Annonce } from './../models/annonce';
import * as pluralize from 'pluralize';
import { IncomingWebhook } from '@slack/client';

export async function sendAnnoncesToSlack(
  slackHookUrl: string,
  scriptName: string,
  annonces: Annonce[],
) {
  const attachments = annonces.map((a) => {
    const attachment = {
      fallback: `${a.titre} ${a.lien}`,
      title: a.titre,
      title_link: a.lien,
      text: `${a.description} ${a.prix}`,
      fields: [],
    };

    if (a.photos.length) {
      attachment['image_url'] = a.photos[0];
    }

    if (a.categorie) {
      attachment.fields.push({
        title: 'Catégorie',
        value: a.categorie,
        short: true,
      });
    }

    if (a.prix) {
      attachment.fields.push({
        title: 'Prix',
        value: a.prix,
        short: true,
      });
    }

    if (a.pieces) {
      attachment.fields.push({
        title: 'Pièces',
        value: a.pieces,
        short: true,
      });
    }

    if (a.superficie) {
      attachment.fields.push({
        title: 'Superficie',
        value: a.superficie,
        short: true,
      });
    }

    return attachment;
  });

  const webhook = new IncomingWebhook(slackHookUrl);
  const res = await webhook.send({
    text: `*${pluralize('nouvelle', annonces.length, true)} ${pluralize(
      'annonce',
      annonces.length,
    )} ${scriptName}*`,
    attachments,
  });
}
