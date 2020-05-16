import axios from './axios';
import cache from '../cache';
import { defaultStorageAdapter } from '../ApplicationStorageAdapter';
import { AuthorityConfiguration, ApplicationRegistrationData, ApplicationResponse } from '../types';

const removeTrailingSlash = (value: string): string => {
  if (value.endsWith('/')) {
    return value.slice(0, -1);
  }
  return value;
};

export const getConfigurationUrl = (iss: string): string => {
  if (!iss) return iss;

  const strippedUrl = removeTrailingSlash(iss);
  const result = `${strippedUrl}/.well-known/openid-configuration`;
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
    if (removeTrailingSlash(response.data.issuer) !== removeTrailingSlash(iss)) {
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
  adapter = defaultStorageAdapter,
  forceReset = false
): Promise<ApplicationResponse> => {
  if (!forceReset) {
    const savedData = await adapter.get(iss);
    if (savedData) {
      return savedData as ApplicationResponse;
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
    adapter.save(iss, response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error('Failed registering application');
  }
};

// TODO implement encryption and signing
