import { config } from './config';
const mailgun = require('mailgun-js')({apiKey: config.mailgun.apiKey, domain: config.mailgun.domain});

export function sendMail(nomSite: string, newLinks: string[]) {
  const data = {
    from: `Bot ${nomSite} <postmaster@mail.bioub.com>`,
    to: config.dest.join(', '),
    subject: `Nouvelles annonces ${nomSite}`,
    text: newLinks.join('\n')
  };

  mailgun.messages().send(data, function (error, body) {
    console.log(body);
  });
};
