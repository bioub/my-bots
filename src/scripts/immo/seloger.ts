import { Annonce } from '../../models/annonce';
import axios from 'axios';
import { logError, readDb, config, writeDb, logger } from '../../utils';
import { sendAnnoncesToSlack } from '../../utils/send-annonces-to-slack';

// https://api-seloger.svc.groupe-seloger.com/api/v1/listings/search
/*

*/

async function getAnnoncesSeLoger() {
  const db = await readDb(process.mainModule.filename);
  const oldAnnonces = db.annonces || [];
  const oldAnnoncesIds = oldAnnonces.map((a) => a.id);

  const authRes = await axios.get(
    'https://api-seloger.svc.groupe-seloger.com/api/v1/security/authenticate',
    {
      headers: {
        AppGuid: '63ee714d-a62a-4a27-9fbe-40b7a2c318e4',
        AppToken:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHAiOiI2M2VlNzE0ZC1hNjJhLTRhMjctOWZiZS00MGI3YTJjMzE4ZTQiLCJqdGkiOiJFOUJFNEQwMi1FQjdBLTRDRkMtOEFEMi02MjBBMEQyRjkzMDAiLCJpc3MiOiJTZUxvZ2VyLW1vYmlsZSIsImF1ZCI6IlNlTG9nZXItTW9iaWxlLTYuMCIsImlhdCI6MTU2MTQ4OTE1MX0.BHdliN26ZuTYqCnzfnaDWn-tiP37ls8NMZTnJQi8Aw0',
      },
    },
  );

  const res = await axios.post(
    'https://api-seloger.svc.groupe-seloger.com/api/v1/listings/search',
    {
      pageSize: 1000,
      query: {
        realtyTypes: 1,
        rooms: [3, 4, 5],
        inseeCodes: ['750108', '750117'],
        transactionType: 1,
        maximumPrice: 2500,
      },
      pageIndex: 1,
    },
    {
      headers: {
        AppToken: authRes.data,
      },
    },
  );

  const annonces: Annonce[] = res.data.items
    .filter((item) => !oldAnnoncesIds.includes(item.id))
    .filter(
      (item) =>
        item.price / item.livingArea > 20 && item.price / item.livingArea < 30,
    )
    .map((item) => ({
      id: item.id,
      prix: item.price,
      superficie: item.livingArea,
      pieces: item.rooms,
      titre: 'Annonce SeLoger',
      lien: item.permalink,
      photos: item.photos,
    }));

  logger.info(`SeLoger : ${annonces.length} nouvelles annonces`);

  await writeDb(process.mainModule.filename, {
    annonces: [...oldAnnonces, ...annonces],
  });

  if (annonces.length) {
    await sendAnnoncesToSlack(config.slack.hooks.seloger, 'SeLoger', annonces);
  }
}

getAnnoncesSeLoger().catch(logError('SeLoger'));
