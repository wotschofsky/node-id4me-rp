import qs from 'querystring';
import axios from 'axios';
import { getConfiguration } from './registration';

interface ClaimsConfig {
  userinfo: {
    [key: string]: {
      essential?: boolean;
      reason: string;
    } | null;
  };
  id_token: {
    auth_time: {
      essential: boolean;
    };
  };
}

interface AuthenticationUrlConfig {
  iss: string;
  clientId: string;
  redirectUri: string;
  state?: string;
  loginHint?: string;
  claims: ClaimsConfig;
  // TODO implement prompt
}

export const getAuthenticationUrl = async (config: AuthenticationUrlConfig): Promise<string> => {
  const providerConfig = await getConfiguration(config.iss);

  const params = qs.stringify({
    scope: 'openid',
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state: config.state,
    login_hint: config.loginHint,
    claims: JSON.stringify(config.claims)
  })

  return providerConfig.authorization_endpoint + params;
};
