import axios from 'axios';
import { readJson, writeJson } from 'fs-extra';
import { parse, resolve } from 'path';
import * as querystring from 'querystring';
import { config } from '../../utils/config';
import { createTransport } from 'nodemailer';
import * as mailgunTransportFactory from 'nodemailer-mailgun-transport';

const mailer = createTransport(mailgunTransportFactory(config.mailgun));


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
    db.date = (new Date()).toISOString();
    db.stock = newStock;

    await writeJson(jsonFile, db);

    if (newStock && !db.stock) {
      console.log('TooGoodToGo La Patisserie des Rêves : nouveaux entremets');
      const email = {
        from: `Bot TooGoodToGo <postmaster@mail.bioub.com>`,
        to: config.dest.join(', '),
        subject: `Nouveaux Entremets La Patisserie des Rêves`,
        text: `Stock : ${newStock}`,
      };

      mailer.sendMail(email, (err, info) => {
        console.log('err', err);
        console.log('info', info);
      });
    }
    else if (!newStock) {
      console.log('TooGoodToGo La Patisserie des Rêves : plus aucun entremet');
    }
    else {
      console.log(`TooGoodToGo La Patisserie des Rêves : le stock d'entremets evolue, avant ${db.stock}, maintenant ${newStock}`);
    }
  }
})().catch(err => {
  console.log('Erreur TooGoodToGo La Patisserie des Rêves : ' + err.message);
});
