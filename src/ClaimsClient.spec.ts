import { ClaimsClient } from './ClaimsClient';

jest.mock('./utils/claims', () => jest.requireActual('../__mocks__/claims'));

it('should return the claims value', async () => {
  const client = new ClaimsClient('https://example.com', 'token');

  // Regular claim
  const email = await client.getClaim('email');
  expect(email).toBe('mail@example.com');

  // Distributed claim
  const name = await client.getClaim('name');
  expect(name).toBe('Distributed claim value of name');

  // Not available claim
  const age = await client.getClaim('picture');
  expect(age).toBeNull();
});
