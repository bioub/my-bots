import axios from 'axios';
import { readJson, writeJson } from 'fs-extra';
import { parse, resolve } from 'path';
import * as querystring from 'querystring';
import { config } from '../../utils/config';
import { logger } from '../../utils/logger';

const filename = `tgtg-${parse(process.mainModule.filename).name}.json`;

const jsonFile = resolve(
  config.rootDir,
  'dbs',
  filename
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

    logger.info(`La Patisserie des Rêves : ${newStock} entremets`);

    if (newStock > db.stock || (!newStock && db.stock)) {
      await axios.post(config.slack.hooks.tgtg, {
        text: `La Pâtisserie des Rêves - Entremets`,
        attachments: [{
          title: `${newStock} disponibles`,
          title_link: 'http://romain.bohdanowicz.fr/toogoodtogo.php',
        }]
      });
    }

    db.date = (new Date()).toDateString();
    db.stock = newStock;
    await writeJson(jsonFile, db);
  }
})().catch(err => {
  logger.error('La Patisserie des Rêves : ' + err.message);
});
