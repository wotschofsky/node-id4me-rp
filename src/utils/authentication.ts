import qs from 'querystring';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { getConfiguration } from './registration';
import { AuthenticationUrlConfig, TokenResponse, DecodedIdToken } from '../types';

export const getAuthenticationUrl = async (config: AuthenticationUrlConfig): Promise<string> => {
  // Get Identity Authority config
  const authorityConfig = await getConfiguration(config.iss);

  // Build Querystring
  const params = qs.stringify({
    scope: 'openid',
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state: config.state,
    login_hint: config.loginHint,
    claims: JSON.stringify(config.claims),
    prompt: config.prompt
  });

  // Combine URL
  const url = `${authorityConfig.authorization_endpoint}?${params}`;

  return url;
};

export const getTokens = async (
  iss: string,
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<TokenResponse> => {
  // Extract Endpoint from Identity Authority config
  const providerConfig = await getConfiguration(iss);
  const endpoint = providerConfig.token_endpoint;

  // Build body for HTTP request
  const body = qs.stringify({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri
  });

  try {
    // Fetch Tokens from Identity Authority
    const response = await axios.post(endpoint, body, {
      auth: {
        username: clientId,
        password: clientSecret
      }
    });

    return response.data;
  } catch (error) {
    throw new Error('Failed getting tokens');
  }
};

export const decodeIdToken = (token: string): DecodedIdToken => {
  const content = jwt.decode(token, {
    json: true
  }) as DecodedIdToken;
  return content;
};
