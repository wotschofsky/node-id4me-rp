import axios from 'axios';

interface ApplicationRegistrationData {
  redirect_uris: string[];
  application_type?: 'native' | 'web';
  contacts?: string[];
  client_name?: string;
  logo_uri?: string;
  client_uri?: string;
  policy_uri?: string;
  tos_uri?: string;
  jwks_uri?: string;
  jwks?: {
    [key: string]: string;
  };
  default_max_age?: number;
  require_auth_time?: boolean;
  initiate_login_uri?: boolean;
}

export const getConfigurationUrl = (iss: string): string => {
  if (!iss) return iss;

  const separator = iss.endsWith('/') ? '' : '/';
  const result = `${iss}${separator}.well-known/openid-configuration`;
  return result;
};

export const getConfiguration = async (iss: string): Promise<Record<string, any>> => {
  const result = await axios.get(getConfigurationUrl(iss));
  if (result.data.issuer !== iss) {
    throw new Error('Issuer does not match requested one');
  }
  return Promise.resolve(result.data);
  // TODO create custom return type
  // TODO implement caching
};

export const registerApplication = async (
  iss: string,
  config: ApplicationRegistrationData
): Promise<Record<string, any>> => {
  if (config.application_type === 'web') {
    for (const uri of config.redirect_uris) {
      if (/localhost/.test(uri)) {
        throw new Error('redirect_uris may not include "localhost" for web applications');
      }
      if (!uri.startsWith('https:')) {
        throw new Error('redirect_uris for web applications need to be using the https scheme');
      }
    }
  }

  if (config.jwks_uri && config.jwks) {
    throw new Error('jwks_uri and jwks may not be defined at the same time');
  }

  const endpoint = (await getConfiguration(iss))['registration_endpoint'] as string;

  const response = await axios.post(endpoint, config);
  return response.data;

  // TODO create custom return type
  // TODO implement caching
};

// TODO implement encryption and signing
