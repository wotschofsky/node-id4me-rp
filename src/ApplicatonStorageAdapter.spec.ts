import { ApplicationStorageAdapter, defaultStorageAdapter } from './ApplicationStorageAdapter';
import { ApplicationResponse } from './types';

const dummyResponse: ApplicationResponse = {
  grant_types: ['string'],
  subject_type: 'string',
  application_type: 'web',
  logo_uri: 'string',
  registration_client_uri: 'string',
  redirect_uris: ['string'],
  registration_access_token: 'string',
  token_endpoint_auth_method: 'string',
  userinfo_signed_response_alg: 'string',
  id_token_signed_response_alg: 'string',
  client_id: 'string',
  client_secret_expires_at: 646843546843213843,
  tos_uri: 'string',
  client_id_issued_at: 4874424864348,
  client_secret: 'string',
  tls_client_certificate_bound_access_tokens: false,
  client_name: 'string',
  response_types: ['string'],
  policy_uri: 'string'
};

it('should return the stored value', async () => {
  const storage: { [key: string]: ApplicationResponse } = {};

  const customAdapter = new ApplicationStorageAdapter(
    async (identifier, data) => {
      storage[identifier] = data;
    },
    async (identifier) => {
      return storage[identifier];
    },
    async (identifier) => {
      delete storage[identifier];
      return !storage[identifier];
    }
  );

  customAdapter.save('example.com', dummyResponse);
  const returnedValueCustom = await customAdapter.get('example.com');
  expect(returnedValueCustom).toMatchObject(dummyResponse);

  defaultStorageAdapter.save('example.com', dummyResponse);
  const returnedValueDefault = await defaultStorageAdapter.get('example.com');
  expect(returnedValueDefault).toMatchObject(dummyResponse);
});
