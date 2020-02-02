import qs from 'querystring';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { getConfiguration } from './registration';
import { AuthenticationUrlConfig, TokenResponse, DecodedIdToken } from '../types';

export const getAuthenticationUrl = async (config: AuthenticationUrlConfig): Promise<string> => {
  const providerConfig = await getConfiguration(config.iss);

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

  return `${providerConfig.authorization_endpoint}?${params}`;
};

export const getTokens = async (
  iss: string,
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<TokenResponse> => {
  const providerConfig = await getConfiguration(iss);

  const body = qs.stringify({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri
  });
  try {
    const response = await axios.post(providerConfig.token_endpoint, body, {
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
