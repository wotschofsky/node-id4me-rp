import axios from 'axios';
import axiosRetry from 'axios-retry';
import jwt from 'jsonwebtoken';
import { getConfiguration } from './registration';
import { ClaimsOverview } from '../types';

export const getClaims = async (iss: string, token: string): Promise<ClaimsOverview> => {
  // Extract endpoint from Identity Authority configuration
  const config = await getConfiguration(iss);
  const endpoint = config.userinfo_endpoint;

  try {
    // Send HTTP request to userinfo endpoint specified in Identity Agent configuration
    const response = await axios.get(endpoint, {
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
  // TODO Find a solution without axios-retry
  axiosRetry(axios, {
    retries: 5
  });

  try {
    // Extract name/id of claim based on claim type
    const claimName = claims._claim_names[name];

    // Cancel if claim wasn't found
    if (!claimName) {
      return null;
    }

    // TODO Implement caching
    // Fetch JWT encoded claim
    const response = await axios.get(claims._claim_sources[claimName].endpoint, {
      headers: {
        Accept: 'application/jwt',
        Authorization: `Bearer ${claims._claim_sources[claimName].access_token}`
      }
    });

    // Decode response
    const content = jwt.decode(response.data) as { [key: string]: string | number };

    // Return requested claim value
    return content[name];
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error(err.config);
    } else {
      console.error(err);
    }
    return null;
  }

  // TODO Add support for recursion
};
