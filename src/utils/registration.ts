import axios from './axios';
import cache from '../cache';
import { AuthorityConfiguration, ApplicationRegistrationData, ApplicationResponse } from '../types';

export const getConfigurationUrl = (iss: string): string => {
  if (!iss) return iss;

  const separator = iss.endsWith('/') ? '' : '/';
  const result = `${iss}${separator}.well-known/openid-configuration`;
  return result;
};

export const getConfiguration = async (iss: string, forceRefetch = false): Promise<AuthorityConfiguration> => {
  const cacheKey = `authorityConfig.${iss}`;
  const existsInCache = cache.has(cacheKey) && !forceRefetch;

  if (existsInCache) {
    const config = cache.get(cacheKey) as AuthorityConfiguration;
    if (config) {
      return config;
    }
  }

  try {
    const response = await axios.get(getConfigurationUrl(iss));
    if (response.data.issuer !== iss) {
      throw new Error('Issuer does not match requested one');
    }
    cache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(`Couldn't fetch authority config`);
  }
};

export const registerApplication = async (
  iss: string,
  config: ApplicationRegistrationData,
  forceReset = false
): Promise<ApplicationResponse> => {
  const cacheKey = `application.${iss}`;
  const existsInCache = cache.has(cacheKey) && !forceReset;

  if (existsInCache) {
    const config = cache.get(cacheKey) as ApplicationResponse;
    if (config) {
      return config;
    }
  }

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

  try {
    const response = await axios.post(endpoint, config);
    cache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error('Failed registering application');
  }
};

// TODO implement encryption and signing
