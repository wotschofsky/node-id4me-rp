import { getConfigurationUrl } from './registration';

it('should compose a valid configuration url', () => {
  const trailingSlash = getConfigurationUrl('https://example.com/');
  expect(trailingSlash).toBe('https://example.com/.well-known/openid-configuration');

  const noTrailingSlash = getConfigurationUrl('https://example.com');
  expect(noTrailingSlash).toBe('https://example.com/.well-known/openid-configuration');
});
