import { config } from './config';
import { Annonce } from '../models/annonce';

import { createTransport } from 'nodemailer';
import * as mailgunTransportFactory from 'nodemailer-mailgun-transport';

const mailer = createTransport(mailgunTransportFactory(config.mailgun));


export function sendAnnonces(nomSite: string, annonces: Annonce[]) {
  const email = {
    from: `Bot ${nomSite} <postmaster@mail.bioub.com>`,
    to: config.dest.join(', '),
    subject: `Nouvelles annonces ${nomSite}`,
    text: annonces.map(a => a.lien).join('\n')
  };

  mailer.sendMail(email, (err, info) => {
    console.log('err', err);
    console.log('info', info);
  });
}
