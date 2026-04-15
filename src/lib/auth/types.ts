export interface AuthUser {
  id: number;
  username: string;
  email: string;
  display_name: string;
  avatar: string;
  roles: string[];
  member_since: string;
}

export interface AuthTokens {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  name?: string;
}

export interface VerificationPending {
  requires_verification: true;
  username: string;
  email: string;
  message: string;
}

export type RegisterResult =
  | { kind: 'logged_in'; tokens: AuthTokens }
  | { kind: 'verification_pending'; pending: VerificationPending };
