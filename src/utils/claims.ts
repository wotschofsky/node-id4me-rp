import axios from './axios';
import axiosRetry from 'axios-retry';
import jwt from 'jsonwebtoken';
import { getConfiguration } from './registration';
import { ClaimsOverview } from '../types';

export const getClaims = async (iss: string, token: string): Promise<ClaimsOverview> => {
  const config = await getConfiguration(iss);

  try {
    const response = await axios.get(config.userinfo_endpoint, {
      headers: {
        Accept: 'application/jwt',
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    });

    return response.data;
  } catch (error) {
    throw new Error('Failed getting available claims');
  }
};

export const getDistributedClaim = async (claims: ClaimsOverview, name: string): Promise<string | number | null> => {
  axiosRetry(axios, {
    retries: 5
  });

  try {
    const claimName = claims._claim_names[name];
    if (!claimName) {
      return null;
    }

    const response = await axios.get(claims._claim_sources[claimName].endpoint, {
      headers: {
        Accept: 'application/jwt',
        Authorization: `Bearer ${claims._claim_sources[claimName].access_token}`
      }
    });

    const content = jwt.decode(response.data) as Record<string, string | number>;

    return content[name];
  } catch (err) {
    console.error(err.config);
    return null;
  }

  // TODO add support for recursion
};
