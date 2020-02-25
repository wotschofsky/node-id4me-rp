import {
  ApplicationSaveFunction,
  ApplicationGetFunction,
  ApplicationDeleteFunction,
  ApplicationResponse
} from './types';

export class ApplicationStorageAdapter {
  private _saveMethod: (identifier: string, data: ApplicationResponse) => Promise<void>;
  private _getMethod: (identifer: string) => Promise<ApplicationResponse>;
  private _deleteMethod: (identifier: string) => Promise<boolean>;

  constructor(
    saveFunction: ApplicationSaveFunction,
    getFunction: ApplicationGetFunction,
    deleteFunction: ApplicationDeleteFunction
  ) {
    if (!saveFunction) {
      throw new Error('saveFunction needs to be provided during ApplicationRegistrationAdapter creation');
    }

    if (!getFunction) {
      throw new Error('getFunction needs to be provided during ApplicationRegistrationAdapter creation');
    }

    if (!deleteFunction) {
      throw new Error('deleteFunction needs to be provided during ApplicationRegistrationAdapter creation');
    }

    this._saveMethod = saveFunction;
    this._getMethod = getFunction;
    this._deleteMethod = deleteFunction;
  }

  public async save(identifier: string, data: ApplicationResponse): Promise<void> {
    await this._saveMethod(identifier, data);
  }

  public async get(identifer: string): Promise<ApplicationResponse | null> {
    const data = await this._getMethod(identifer);

    if (!data) {
      return null;
    }

    if (!!data.client_secret_expires_at && data.client_secret_expires_at < Date.now()) {
      await this.delete(identifer);
      return null;
    }

    return data;
  }

  public async delete(identifer: string): Promise<boolean> {
    return await this._deleteMethod(identifer);
  }
}
