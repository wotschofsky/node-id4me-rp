export interface ParsedDnsRecord {
  v: string;
  iss: string;
  cp: string;
}

export interface TokenResponse {
  id_token: string;
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

export interface AuthorityConfiguration {
  issuer: string;
  jwks_uri: string;
  authorization_endpoint: string;
  token_endpoint: string;
  registration_endpoint: string;
  introspection_endpoint: string;
  revocation_endpoint: string;
  scopes_supported: string[];
  response_types_supported: string[];
  response_modes_supported: string[];
  grant_types_supported: string[];
  code_challenge_methods_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  token_endpoint_auth_signing_alg_values_supported: string[];
  request_object_signing_alg_values_supported: string[];
  ui_locales_supported: string[];
  request_paramter_supported: boolean;
  request_uri_paramter_supported: boolean;
  require_request_uri_registration: boolean;
  tls_client_certificate_bound_access_tokens: boolean;
  request_uri_quota: number;
  subject_types_supported: string[];
  userinfo_endpoint: string;
  end_session_endpoint: string;
  id_token_signing_alg_values_supported: string[];
  id_token_encryption_alg_values_supported: string[];
  id_token_encryption_enc_values_supported: string[];
  userinfo_signing_alg_values_supported: string[];
  userinfo_encryption_alg_values_supported: string[];
  userinfo_encryption_enc_values_supported: string[];
  display_values_supported: string[];
  claim_types_supported: string[];
  claims_supported: string[];
  claims_parameter_supported: boolean;
  frontchannel_logout_supported: boolean;
  backchannel_logout_supported: boolean;
}

export interface ApplicationRegistrationData {
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

export interface ApplicationResponse {
  grant_types: string[];
  subject_type: string;
  application_type: string;
  logo_uri: string;
  registration_client_uri: string;
  redirect_uris: string[];
  registration_access_token: string;
  token_endpoint_auth_method: string;
  userinfo_signed_response_alg: string;
  id_token_signed_response_alg: string;
  client_id: string;
  client_secret_expires_at: number;
  tos_uri: string;
  client_id_issued_at: number;
  client_secret: string;
  tls_client_certificate_bound_access_tokens: false;
  client_name: string;
  response_types: string[];
  policy_uri: string;
}

export interface ClaimsConfig {
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

export interface AuthenticationUrlConfig {
  iss: string;
  clientId: string;
  redirectUri: string;
  state?: string;
  loginHint?: string;
  claims: ClaimsConfig;
  prompt?: 'none' | 'login' | 'consent' | 'select_account';
}

export interface DecodedIdToken {
  'id4me.identifier': string;
  amr: string[];
  aud: string;
  auth_time: number;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
}

export interface ClaimsOverview {
  _claim_sources: {
    [id: string]: {
      access_token: string;
      endpoint: string;
    };
  };
  sub: string;
  iss: string;
  _claim_names: {
    [claim: string]: string;
  };
  iat: number;
  aud: number;
}
