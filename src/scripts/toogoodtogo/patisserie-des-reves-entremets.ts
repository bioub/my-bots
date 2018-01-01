import axios from 'axios';
import { stringify } from 'querystring';
import { config, logger, readDb, writeDb } from '../../utils';

(async function() {
  const db = await readDb(__filename);

  const res = await axios.post('https://apptoogoodtogo.com/index.php/api_tgtg/get_business', stringify({
    created_by: 2098525,
    user_id: 0,
  }));

  if (res.status === 200) {
    let newStock = Number.parseInt(res.data.business.todays_stock);

    logger.info(`La Pâtisserie des Rêves - Entremets : ${newStock} entremets`);

    if (newStock > db.stock || (!newStock && db.stock)) {
      await axios.post(config.slack.hooks.tgtg, {
        text: `La Pâtisserie des Rêves - Entremets`,
        attachments: [{
          title: `${newStock} disponibles`,
          title_link: 'http://romain.bohdanowicz.fr/toogoodtogo.php',
        }]
      });
    }

    await writeDb(__filename, {
      newStock
    });
  }
})().catch(err => {
  logger.error('La Pâtisserie des Rêves - Entremets : ' + err.message);
});
