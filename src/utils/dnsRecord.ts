import dns from 'dns';
import { promisify } from 'util';
import punycode from 'punycode';
import { ParsedDnsRecord } from '../types';

export const validateDnsRecord = (record: string): boolean => {
  if (typeof record !== 'string') {
    return false;
  }

  const records = record.split(';');

  // Test if the version key exists and has the correct value
  const includesVersion = records.includes('v=OID1');

  // Test for a "iss" key
  const includesAuthority = records.findIndex((record) => record.startsWith('iss=')) !== -1;

  if (!(includesVersion && includesAuthority)) {
    return false;
  }

  // Find a record with the "iss" key
  const authority = records.find((record) => record.startsWith('iss='));

  // Test if "iss" contains a valid domain
  const authorityValid = typeof authority === 'string' && /(([a-zA-Z0-9]+)[.])+([a-zA-Z])+/.test(authority);

  return authorityValid;
};

export const parseDnsRecord = (record: string): ParsedDnsRecord => {
  // Separate record into list of key-value pairs
  const records = record.split(';').map((record) => record.split('='));

  // Convert array into object
  const values: { [key: string]: string } = {};
  for (const record of records) {
    values[record[0]] = record[1];
  }

  // Return object with selected values
  return {
    v: values.v,
    iss: `https://${values.iss}`
  };
};

export const filterAtSign = (input: string): string => {
  // Count at signs in string
  const atSignsFound = (input.match(/@/g) || []).length;

  // Throw if more than one at sign was found
  if (atSignsFound > 1) {
    throw new Error('Identifier may not have more than one at sign');
  }

  if (atSignsFound == 1) {
    // Remove part before at sign
    return input.split('@')[1];
  } else {
    // Return raw input if no at sign was found
    return input;
  }
};

const promisifiedResolveTxt = promisify(dns.resolveTxt);

export const findDnsRecord = async (identifier: string): Promise<ParsedDnsRecord> => {
  // Extract domain from email address and convert potential Unicode characters to ASCII
  const domain = punycode.toASCII(filterAtSign(identifier));

  try {
    // Get TXT openid records for current domain/subdomain
    const records = await promisifiedResolveTxt(`_openid.${domain}`);

    for (const record of records) {
      const value = record[0];

      // Test if record matches criteria
      const isValid = validateDnsRecord(value);

      if (isValid) {
        // Return to-object-converted record
        return parseDnsRecord(value);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOTFOUND' && error.code !== 'ENODATA') {
      throw error;
    }
  }

  // Split domain into segments
  const splitDomain = domain.split('.');

  // Throw error if apex was reached without finding a valid record
  if (splitDomain.length <= 2) {
    throw new Error(`No valid configuration found for ${domain}`);
  }

  // Remove last checked subdomain
  splitDomain.shift();

  // Recombine domain
  const reducedDomain = splitDomain.join('.');

  // Re-run search logic for higher level subdomain/apex
  return findDnsRecord(reducedDomain);
};
