import { config } from './config';
import { Annonce } from '../models/annonce';
import axios from 'axios';

export function sendAnnonces(nomSite: string, annonces: Annonce[]) {
  axios.post('https://hooks.slack.com/services/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', {
    text: `*${annonces.length} nouvelle${annonces.length>1?'s':''} annonce${annonces.length>1?'s':''} ${nomSite}*\n` +
          annonces.map(a => a.lien).join('\n'),
  });
}
