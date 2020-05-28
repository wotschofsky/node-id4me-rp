import { ClaimsOverview } from '../src/types';

export const getClaims = async (iss: string, token: string) => {
  return {
    sub: 'KMQYlRNODaiENVFp50m9S/vZsU2ototmRunFuKqHkEChKvIraY2sN7BER6fnnShs',
    _claim_names: { name: 'CMuDTvD8zvN7Rdcn53oc7BeynP3g5A28wR39B9nZ' },
    _claim_sources: {
      CMuDTvD8zvN7Rdcn53oc7BeynP3g5A28wR39B9nZ: {
        access_token: '4qrqS242v8My7GxM5oe2pwP4mQxrAJ6UpvjJrhpj',
        endpoint: 'https://identityagent.de/userinfo'
      }
    },
    iss: iss,
    email: 'mail@example.com'
  };
};

export const getDistributedClaim = async (claims: ClaimsOverview, name: string) => {
  const claimName = claims._claim_names[name];

  if (!claimName || !claims._claim_sources[claimName].endpoint) {
    return null;
  }

  return `Distributed claim value of ${name}`;
};
