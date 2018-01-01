import { resolve } from 'path';
import { config } from './config';
import * as moment from 'moment';

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const dateFormat = format((info, opts) => {
  info.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

  return info;
});

const myFormat = printf(info => {
  return `[${info.timestamp}] ${info.level}: ${info.message}`;
});

export const logger = createLogger({
  format: combine(dateFormat(), myFormat),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: resolve(config.rootDir, 'logs', 'app.log'),
    }),
  ],
});
