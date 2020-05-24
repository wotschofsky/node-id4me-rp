import NodeCache from 'node-cache';
import {
  ApplicationSaveFunction,
  ApplicationGetFunction,
  ApplicationDeleteFunction,
  ApplicationResponse
} from './types';

export class ApplicationStorageAdapter {
  private saveFunction: (identifier: string, data: ApplicationResponse) => Promise<void>;
  private getFunction: (identifer: string) => Promise<ApplicationResponse | null>;
  private deleteFunction: (identifier: string) => Promise<boolean>;

  constructor(
    saveFunction: ApplicationSaveFunction,
    getFunction: ApplicationGetFunction,
    deleteFunction: ApplicationDeleteFunction
  ) {
    // Test if saveFunction wasn't provided
    if (!saveFunction) {
      throw new Error('saveFunction needs to be provided during ApplicationRegistrationAdapter creation');
    }

    // Test if getFunction wasn't provided
    if (!getFunction) {
      throw new Error('getFunction needs to be provided during ApplicationRegistrationAdapter creation');
    }

    // Test if deleteFunction wasn't provided
    if (!deleteFunction) {
      throw new Error('deleteFunction needs to be provided during ApplicationRegistrationAdapter creation');
    }

    // Save function references in class instance
    this.saveFunction = saveFunction;
    this.getFunction = getFunction;
    this.deleteFunction = deleteFunction;
  }

  public async save(identifier: string, data: ApplicationResponse): Promise<void> {
    await this.saveFunction(identifier, data);
  }

  public async get(identifer: string): Promise<ApplicationResponse | null> {
    const data = await this.getFunction(identifer);

    // Return null if data is falsy
    if (!data) {
      return null;
    }

    // Delete credentials if expiry date is available and in the past
    if (!!data.client_secret_expires_at && data.client_secret_expires_at < Date.now()) {
      await this.delete(identifer);
      return null;
    }

    return data;
  }

  public delete(identifer: string): Promise<boolean> {
    return this.deleteFunction(identifer);
  }
}

// Create NodeCache instance
const cache = new NodeCache();

// Create ApplicationStorageAdapter instance as fallback
export const defaultStorageAdapter = new ApplicationStorageAdapter(
  async (identifier, data) => {
    cache.set(`application.${identifier}`, data);
  },
  async (identifier) => {
    return cache.get(`application.${identifier}`) as ApplicationResponse;
  },
  async (identifier) => {
    const key = `application.${identifier}`;
    cache.del(key);
    return !cache.has(key);
  }
);
