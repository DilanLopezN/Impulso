import { apiRequest } from './api';

export type AuthTokens = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

export type PublicUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthResult = {
  user: PublicUser;
  tokens: AuthTokens;
};

export type SignupPayload = {
  email: string;
  password: string;
  displayName: string;
  timezone?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export const authService = {
  signup: (payload: SignupPayload) =>
    apiRequest<AuthResult>('/auth/signup', { method: 'POST', body: payload }),

  login: (payload: LoginPayload) =>
    apiRequest<AuthResult>('/auth/login', { method: 'POST', body: payload }),

  refresh: (refreshToken: string) =>
    apiRequest<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    }),

  logout: (refreshToken: string) =>
    apiRequest<void>('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
    }),
};
