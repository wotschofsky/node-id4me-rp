import dns from 'dns';
import { promisify } from 'util';
import punycode from 'punycode';
import { ParsedDnsRecord } from '../types';

const promisifiedResolveTxt = promisify(dns.resolveTxt);

export const validateDnsRecord = (record: string): boolean => {
  if (typeof record !== 'string') {
    return false;
  }

  const records = record.split(';');

  const includesVersion = records.includes('v=OID1');
  const includesAuthority = records.findIndex(record => record.startsWith('iss=')) !== -1;

  if (!(includesVersion && includesAuthority)) {
    return false;
  }

  const authority = records.find(record => record.startsWith('iss=')) as string;
  const authorityValid = typeof authority === 'string' && /(([a-zA-Z0-9]+)[.])+([a-zA-Z])+/.test(authority);

  return authorityValid;
};

export const parseDnsRecord = (record: string): ParsedDnsRecord => {
  const records = record.split(';').map(record => record.split('='));

  const values: { [key: string]: string } = {};
  for (const record of records) {
    values[record[0]] = record[1];
  }

  return {
    v: values.v,
    iss: `https://${values.iss}`
  };
};

export const filterAtSign = (input: string): string => {
  const atSignsFound = (input.match(/@/g) || []).length;

  if (atSignsFound > 1) {
    throw new Error('Identifier may not have more than one at sign');
  }

  if (atSignsFound == 1) {
    return input.split('@')[1];
  } else {
    return input;
  }
};

export const findDnsRecord = async (identifier: string): Promise<ParsedDnsRecord> => {
  const domain = punycode.toASCII(filterAtSign(identifier));

  try {
    const addresses = await promisifiedResolveTxt(`_openid.${domain}`);
    for (const value of addresses) {
      const isValid = validateDnsRecord(value[0]);
      if (isValid) {
        return parseDnsRecord(value[0]);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOTFOUND' && error.code !== 'ENODATA') {
      throw error;
    }
  }

  const splitDomain = domain.split('.');
  if (splitDomain.length <= 2) {
    return Promise.reject(`No valid configuration found for ${domain}`);
  }
  splitDomain.shift();
  return findDnsRecord(splitDomain.join('.'));
};
