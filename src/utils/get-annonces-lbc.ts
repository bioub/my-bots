import { differenceBy } from 'lodash';
import axios from 'axios';

import { readDb, writeDb, logger, sendAnnoncesToSlack } from '.';
import { Annonce } from '../models/annonce';
import { config } from './config';

export async function getAnnoncesLbc(keywords: string[]) {
  try {
    const db = await readDb(process.mainModule.filename);
    const oldAnnonces = db.annonces || [];

    const currentAnnonces = [];

    for (let keyword of keywords) {
      const data = {
        filters: {
          enums: {
            ad_type: ['offer'],
          },
          keywords: {
            type: 'all',
            text: keyword,
          },
          category: {
            id: '8',
          },
          location: {
            city_zipcodes: [
              {
                city: 'Paris',
                zipcode: '75017',
              },
            ],
          },
        },
        limit: 20,
        sort_order: 'desc',
        sort_by: 'time',
      };

      const headers = {
        api_key: 'ba0c2dad52b3ec',
      };

      const res = await axios.post(
        'https://api.leboncoin.fr/finder/search',
        data,
        { headers },
      );
      let annonces: Annonce[] = [];

      if (res.data.total) {
        annonces = res.data.ads.map((ad) => {
          const annonce: Annonce = {
            lien: ad.url,
            categorie: ad.category_name,
            titre: ad.subject,
            description: ad.body,
            prix: ad.price[0],
            photos: ad.images.urls ? ad.images.urls : [],
          };

          if (ad.attributes) {
            const roomObj = ad.attributes.find((at) => at.key === 'rooms');
            if (roomObj) {
              annonce.pieces = roomObj.value_label;
            }

            const squareObj = ad.attributes.find((at) => at.key === 'square');
            if (roomObj) {
              annonce.superficie = squareObj.value_label;
            }
          }

          return annonce;
        });
      }

      for (let a of annonces) {
        const already = currentAnnonces.find((ca) => ca.lien === a.lien);
        if (!already) {
          currentAnnonces.push(a);
        }
      }
    }

    const newAnnonces = <Annonce[]>(
      differenceBy(currentAnnonces, oldAnnonces, (a: Annonce) => a.lien)
    );
    logger.info(`LeBonCoin : ${newAnnonces.length} nouvelles annonces`);

    await writeDb(process.mainModule.filename, {
      annonces: [...oldAnnonces, ...newAnnonces],
    });

    if (newAnnonces.length) {
      sendAnnoncesToSlack(
        config.slack.hooks.leboncoin,
        'LeBonCoin',
        newAnnonces,
      );
    }
  } catch (err) {
    logger.error(`LeBonCoin : ${err.message}`);
    process.exit(1);
  }
}
