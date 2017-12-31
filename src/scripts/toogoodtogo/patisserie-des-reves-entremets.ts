import axios from 'axios';
import { readJson, writeJson } from 'fs-extra';
import { parse, resolve } from 'path';
import * as querystring from 'querystring';

const jsonFile = resolve(
  __dirname,
  '..',
  '..',
  '..',
  'dbs',
  `toogoodtogo-${parse(process.mainModule.filename).name}.json`,
);

let db;

(async function() {
  try {
    db = await readJson(jsonFile);
  } catch (err) {
    db = {};
  }

  const res = await axios.post('https://apptoogoodtogo.com/index.php/api_tgtg/get_business', querystring.stringify({
    created_by: 2098525,
    user_id: 0,
  }));

  if (res.status === 200) {
    let newStock = Number.parseInt(res.data.business.todays_stock);
    db.date = (new Date()).toDateString();
    db.stock = newStock;

    await writeJson(jsonFile, db);

    if (newStock && !db.stock) {
      console.log(`[${db.date}] TooGoodToGo La Patisserie des Rêves : nouveaux entremets`);

      await axios.post('https://hooks.slack.com/services/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', {
        text: `La Pâtisserie des Rêves - Entremets`,
        attachments: [{
          title: `${newStock} disponibles`,
          title_link: 'http://romain.bohdanowicz.fr/toogoodtogo.php',
        }]
      });
    }
    else if (!newStock) {
      console.log(`[${db.date}] TooGoodToGo La Patisserie des Rêves : plus aucun entremet`);
      await axios.post('https://hooks.slack.com/services/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', {
        text: `La Pâtisserie des Rêves - Entremets`,
        attachments: [{
          title: `0 disponibles`,
          title_link: 'http://romain.bohdanowicz.fr/toogoodtogo.php',
        }]
      });
    }
    else {
      console.log(`[${db.date}] TooGoodToGo La Patisserie des Rêves : le stock d'entremets evolue, avant ${db.stock}, maintenant ${newStock}`);
    }
  }
})().catch(err => {
  console.log('Erreur TooGoodToGo La Patisserie des Rêves : ' + err.message);
});
