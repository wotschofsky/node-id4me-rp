import { getClaims, getClaim } from './utils/claims';
import { ClaimsOverview } from './types';

export class ClaimsClient {
  private claims: ClaimsOverview | null = null;
  private iss: string;
  private token: string;

  constructor(iss: string, token: string) {
    this.iss = iss;
    this.token = token;
  }

  public async loadClaims(): Promise<void> {
    const claims = await getClaims(this.iss, this.token)
    this.claims = claims;
  }

  public async getClaim(name: string): Promise<string | number | null> {
    if (!this.claims) {
      throw new Error(
        'Claims need be loaded first using ClaimsClient.loadClaims() before calling ClaimsClient.getClaim()'
      );
    }
    return getClaim(this.claims, name);
  }
}
