import { validateDnsRecord, parseDnsRecord } from './dnsRecord';

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

it('parse dns record', () => {
  const result1 = parseDnsRecord('v=OID1;iss=id.test.denic.de;clp=identityagent.de');
  expect(result1).toStrictEqual({
    v: 'OID1',
    iss: 'https://id.test.denic.de',
    cp: 'identityagent.de'
  });

  const result2 = parseDnsRecord(
    'v=OID1;iss=id4me.mailbox.org/auth/realms/mbo/;clp=id4me.mailbox.org/auth/realms/mbo/'
  );
  expect(result2).toStrictEqual({
    v: 'OID1',
    iss: 'https://id4me.mailbox.org/auth/realms/mbo/',
    cp: 'id4me.mailbox.org/auth/realms/mbo/'
  });
});
