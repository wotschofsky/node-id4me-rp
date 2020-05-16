import { getClaims, getDistributedClaim } from './utils/claims';
import { ClaimsOverview } from './types';

export class ClaimsClient {
  private claims: ClaimsOverview | null = null;
  private iss: string;
  private token: string;

  constructor(iss: string, token: string) {
    this.iss = iss;
    this.token = token;
  }

  public async getClaim(name: string): Promise<string | number | null> {
    // Load claims if not done yet
    if (!this.claims) {
      const claims = await getClaims(this.iss, this.token);
      this.claims = claims;
    }

    // Test if claim is available as non-distributed claim
    if (name in this.claims) {
      return this.claims[name];
    }

    // Fall back to logic for distributed claims
    return getDistributedClaim(this.claims, name);
  }
}
