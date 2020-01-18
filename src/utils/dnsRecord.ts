import dns from 'dns';
import { promisify } from 'util';

export type ParsedDnsRecord = {
  v: string;
  iss: string;
  cp: string;
};

const promisifiedResolveTxt = promisify(dns.resolveTxt);

export const validateDnsRecord = (record: string): boolean => {
  if (typeof record !== 'string') {
    return false;
  }

  const records = record.split(';');

  const includesVersion = records.includes('v=OID1');
  const includesAuthority = records.findIndex(record => record.startsWith('iss=')) !== -1;
  const includesAgent = records.findIndex(record => record.startsWith('clp=')) !== -1;

  if (!(includesVersion && includesAuthority && includesAgent)) {
    return false;
  }

  const authority = records.find(record => record.startsWith('iss=')) as string;
  const authorityValid = typeof authority === 'string' && /(([a-zA-Z0-9]+)[.])+([a-zA-Z])+/.test(authority);

  const agent = records.find(record => record.startsWith('clp=')) as string;
  const agentValid = typeof agent === 'string' && /(([a-zA-Z0-9]+)[.])+([a-zA-Z])+/.test(authority);

  return authorityValid && agentValid;
};

export const parseDnsRecord = (record: string): ParsedDnsRecord => {
  const records = record.split(';').map(record => record.split('='));

  const values: { [key: string]: string } = {};
  for (const record of records) {
    values[record[0]] = record[1];
  }

  return {
    v: values.v,
    iss: `https://${values.iss}`,
    cp: values.clp
  };
};

export const findDnsRecord = async (domain: string): Promise<ParsedDnsRecord> => {
  if (domain.split('.').length < 2) {
    return Promise.reject('No valid configuration found');
  }

  try {
    const addresses = await promisifiedResolveTxt(`_openid.${domain}`);
    for (const value of addresses) {
      const isValid = validateDnsRecord(value[0]);
      if (isValid) {
        return parseDnsRecord(value[0]);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOTFOUND') {
      console.error(error);
    }
  }

  const splitDomain = domain.split('.');
  splitDomain.shift();
  return findDnsRecord(splitDomain.join('.'));
};
