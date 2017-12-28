import { config } from './config';
import { Annonce } from '../models/annonce';

import { createTransport, SendMailOptions } from 'nodemailer';
import * as mailgunTransportFactory from 'nodemailer-mailgun-transport';

const mailer = createTransport(mailgunTransportFactory(config.mailgun));

export function sendAnnoncesLbc(annonces: Annonce[]) {
  const email = {
    from: `Bot LeBonCoin <postmaster@mail.bioub.com>`,
    to: config.dest.join(', '),
    subject: `Nouvelles annonces LeBonCoin`,
    template: {
      name: __dirname + '/../../templates/annonces-lbc.hbs',
      engine: 'handlebars',
      context: { annonces },
    },
  };

  mailer.sendMail(email, (err, info) => {
    console.log('err', err);
    console.log('info', info);
  });
}
