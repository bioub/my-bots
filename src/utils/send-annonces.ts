import { config } from './config';
import { Annonce } from '../models/annonce';
import axios from 'axios';
import * as pluralize from 'pluralize';

export function sendAnnonces(scriptName: string, annonces: Annonce[]) {
  const count = annonces.length;

  axios.post(config.slack.hooks.botImmo, {
    text:
      `*${pluralize('nouvelle', count, true)} ${pluralize(
        'annonce',
        count,
      )} ${scriptName}*\n` + annonces.map((a) => a.lien).join('\n'),
  });
}
