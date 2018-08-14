import { parse } from 'date-fns';

function format(whoisObj, domain) {}

function formatFr(whoisObj, domain): DomainModel {
  const { expiryDate, created, lastUpdate, status } = whoisObj;

  return {
    domain,
    expires: parse(expiryDate),
    creation: parse(created),
    lastUpdate: parse(lastUpdate),
    status,
  };
}

function formatUnsuported(whoisObj, domain): never {
  throw new Error('Unsupported domain extension');
}
