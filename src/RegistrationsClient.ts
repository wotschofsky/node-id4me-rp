import { ApplicationRegistrationData, ApplicationResponse } from './types';
import { ApplicationStorageAdapter, memoryStorageAdapter } from './ApplicationStorageAdapter';
import { registerApplication } from './utils/registration';

export class RegistrationsClient {
  constructor(
    private config: ApplicationRegistrationData,
    private adapter: ApplicationStorageAdapter = memoryStorageAdapter
  ) {}

  public getApplication(iss: string, forceReset = false): Promise<ApplicationResponse> {
    return registerApplication(iss, this.config, forceReset, this.adapter);
  }
}
