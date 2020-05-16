import axios from './axios';
import cache from '../cache';
import { defaultStorageAdapter } from '../ApplicationStorageAdapter';
import { AuthorityConfiguration, ApplicationRegistrationData, ApplicationResponse } from '../types';

const removeTrailingSlash = (value: string): string => {
  // Test if last character is "/"
  if (value.endsWith('/')) {
    // Remove last character
    return value.slice(0, -1);
  }

  // Fallback
  return value;
};

export const getConfigurationUrl = (iss: string): string => {
  const strippedUrl = removeTrailingSlash(iss);
  const result = `${strippedUrl}/.well-known/openid-configuration`;
  return result;
};

export const getConfiguration = async (iss: string, forceRefetch = false): Promise<AuthorityConfiguration> => {
  const cacheKey = `authorityConfig.${iss}`;

  // If configuration object is available in cache get and return it
  if (cache.has(cacheKey) && !forceRefetch) {
    const config = cache.get(cacheKey) as AuthorityConfiguration;
    return config;
  }

  try {
    // Get Identity Agent config
    const endpoint = getConfigurationUrl(iss);
    const response = await axios.get(endpoint);

    // Test if the responding agent matches the requested one
    if (removeTrailingSlash(response.data.issuer) !== removeTrailingSlash(iss)) {
      throw new Error('Issuer does not match requested one');
    }

    // Put response into the cache
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
  // Try to get config from storage if forceReset is false
  if (!forceReset) {
    const savedData = await adapter.get(iss);
    if (savedData) {
      return savedData as ApplicationResponse;
    }
  }

  if (config.application_type === 'web' || !config.application_type) {
    for (const uri of config.redirect_uris) {
      // Prevent of the URIs being localhost
      if (/localhost/.test(uri)) {
        throw new Error('redirect_uris may not include "localhost" for web applications');
      }

      // Prevent non-https URIs
      if (!uri.startsWith('https:')) {
        throw new Error('redirect_uris for web applications need to be using the https scheme');
      }
    }
  }

  // Prevent sending both jwks_uri and jwks properties
  if (config.jwks_uri && config.jwks) {
    throw new Error('jwks_uri and jwks may not be defined at the same time');
  }

  try {
    // Extract registration endpoint from config
    const authorityConfig = await getConfiguration(iss);
    const endpoint = authorityConfig.registration_endpoint;

    // Register application with Identity Agent
    const response = await axios.post(endpoint, config);

    // Save response using ApplicationStorageAdapter
    adapter.save(iss, response.data);

    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error('Failed registering application');
  }
};

// TODO implement encryption and signing
