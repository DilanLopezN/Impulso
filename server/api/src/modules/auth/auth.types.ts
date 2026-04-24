import type { User } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  sid: string;
}

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}

export interface RequestContext {
  userAgent?: string;
  ipAddress?: string;
  deviceName?: string;
  deviceId?: string;
}

export interface AuthenticatedRequestUser {
  userId: string;
  sessionId: string;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    timezone: user.timezone,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
