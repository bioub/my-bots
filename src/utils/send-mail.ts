import config from './config';
const mailgun = require('mailgun-js')({apiKey: config.mailgun.apiKey, domain: config.mailgun.domain});

export function sendMail(NOM_SITE, newLinks) {
  const data = {
    from: `Bot ${NOM_SITE} <postmaster@mail.bioub.com>`,
    to: config.dest.join(', '),
    subject: `Nouvelles annonces ${NOM_SITE}`,
    text: newLinks.join('\n')
  };

  mailgun.messages().send(data, function (error, body) {
    console.log(body);
  });
};
