import { validateDnsRecord, parseDnsRecord, findDnsRecord, filterAtSign } from './dnsRecord';

jest.mock('dns', () => jest.requireActual('../../__mocks__/dns'));

it('should validate dns record', () => {
  const randomValue = validateDnsRecord('5&$Tn$4!;4#%^*984@;863');
  expect(randomValue).toBe(false);

  const siteVerification = validateDnsRecord('site-verification=KEY');
  expect(siteVerification).toBe(false);

  const missingVersion = validateDnsRecord('iss=id.test.denic.de;clp=identityagent.de');
  expect(missingVersion).toBe(false);

  const validKey = validateDnsRecord('v=OID1;iss=id.test.denic.de;clp=identityagent.de');
  expect(validKey).toBe(true);
});

it('should parse dns record', () => {
  const result1 = parseDnsRecord('v=OID1;iss=id.test.denic.de;clp=identityagent.de');
  expect(result1).toStrictEqual({
    v: 'OID1',
    iss: 'https://id.test.denic.de'
  });

  const result2 = parseDnsRecord(
    'v=OID1;iss=id4me.mailbox.org/auth/realms/mbo/;clp=id4me.mailbox.org/auth/realms/mbo/'
  );
  expect(result2).toStrictEqual({
    v: 'OID1',
    iss: 'https://id4me.mailbox.org/auth/realms/mbo/'
  });
});

it('should filter email addresses and return the domain', () => {
  const validDomain = filterAtSign('example.com');
  expect(validDomain).toBe('example.com');

  const validSubdomain = filterAtSign('test.example.com');
  expect(validSubdomain).toBe('test.example.com');

  const validEmail = filterAtSign('mail@example.com');
  expect(validEmail).toBe('example.com');

  expect(() => {
    filterAtSign('mail@e@xample.com');
  }).toThrow();
});

it('should try to find a valid dns record', () => {
  findDnsRecord('subsub.sub.example.com')
    .then((result) => {
      expect(result).toBe({
        v: 'OID1',
        iss: 'https://id.test.denic.de',
        cp: 'identityagent.de'
      });
    })
    .catch((error) => error);
});
