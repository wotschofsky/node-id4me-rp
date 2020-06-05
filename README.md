[![npm](https://img.shields.io/npm/v/id4me-rp?style=flat-square)](https://www.npmjs.com/package/id4me-rp)

# node-id4me-rp

An Node.js ID4me Relying Party library implemented according to the [official guide](https://gitlab.com/ID4me/documentation/blob/master/id4ME%20Relying%20Party%20Implementation%20Guide.adoc)\
[Demo Application](https://id4me-demo.felisk.io)

## Installation

`npm install id4me-rp`\
or\
`yarn add id4me-rp`

## (Temporary) Documentation

### Methods available

#### Discovery

* validateDnsRecord(record: string): boolean
* parseDnsRecord(record: string): [ParsedDnsRecord](/src/types.ts#L1)
* findDnsRecord(domain: string): [ParsedDnsRecord](/src/types.ts#L1)

#### Registration

* getConfigurationUrl(iss: string): string
* `async` getConfiguration(iss: string, forceRefetch = false): [AuthorityConfiguration](/src/types.ts#L15)
* `async` registerApplication(iss: string, config: [ApplicationRegistrationData](/src/types.ts#L54), forceReset = false, adapter: [ApplicationStorageAdapter](/src/ApplicationStorageAdapter.ts) = memoryStorageAdapter): [ApplicationResponse](/src/types.ts#L74)

RegistrationsClient: Stores config and adapter to reduce code duplication
```javascript
  const registrationsClient = new id4me.RegistrationsClient(config: ApplicationRegistrationData, adapter: ApplicationStorageAdapter = memoryStorageAdapter);
  const app = await registrationsClient.getApplication(iss: string, forceReset = false);
```

❗ Even though there's a default for the adapter argument you should still pass a custom instance of [ApplicationStorageAdapter](/src/ApplicationStorageAdapter.ts) to prevent being blocked by an Identity Authority and to ensure consistency across instances of your application.

ApplicationStorageAdapter: Used to replace the default method of storing the credentials for applications registered at different Identity Authorities. In each function you're expected to write the code needed to connect your application to the database of your choice. All provided functions are expected to return a promise.
```javascript
  const adapter = new id4me.ApplicationStorageAdapter(
    async (identifier, data) => {
      // Save credentials
    },
    async identifier => {
      // Get and return credentials
    },
    async identifier => {
      // Delete credentials
      // Return boolean indicating success
    }
  );
```

#### Authentication

* `async` getAuthenticationUrl(config: [AuthenticationUrlConfig](/src/types.ts#L110)): string
* `async` getTokens(iss: string, clientId: string, clientSecret: string, code: string, redirectUri: string): [TokenResponse](/src/types.ts#L6)
* decodeIdToken(token: string): [DecodedIdToken](/src/types.ts#L120)

#### Claims

* `async` getClaims(iss: string, token: string): [ClaimsOverview](/src/types.ts#L131)
* `async` getDistributedClaim(claims: [ClaimsOverview](/src/types.ts#L131), name: string): string | number | null

ClaimsClient: Used to cut down on duplicate code when requesting multiple claims
```javascript
  const claimsClient = new id4me.ClaimsClient(identityAuthority, access_token);
  const email = await claimsClient.getClaim('email');
```

All methods can be required/imported from the package directly.\
For now I recommend you also take a look at the [example code](/demo) to see how the methods are used.\
While the library and the example app are written in TypeScript you can also use them with regular JavaScript without any problems.

## TODO

* Simplify general usage
* Support for encryption (Looking for help)
* Create more automated tests
