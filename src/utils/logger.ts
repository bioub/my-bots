import { resolve } from 'path';
import { config } from './config';
import * as moment from 'moment';

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const dateFormat = format((info, opts) => {
  info.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

  return info;
});

const myFormat = printf((info) => {
  return `[${info.timestamp}] ${info.level}: ${info.message}`;
});

const myTransports = [
  new transports.File({
    filename: resolve(config.rootDir, 'logs', 'app.log'),
  }),
];

if (!config.production) {
  myTransports.push(new transports.Console());
}

export const logger = createLogger({
  format: combine(dateFormat(), myFormat),
  transports: myTransports,
});

export function logError(scriptName) {
  return function(err) {
    logger.error(`${scriptName} : ${err.message}`);
    process.exit(1);
  };
}
