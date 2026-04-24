import { apiRequest } from './api';

export type UserDataExport = {
  schemaVersion: 1;
  generatedAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    timezone: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  sessions: Array<{
    id: string;
    deviceId: string | null;
    deviceName: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: string;
    lastSeenAt: string;
    revokedAt: string | null;
  }>;
};

export const accountService = {
  exportData: (accessToken: string) =>
    apiRequest<UserDataExport>('/users/me/export', { token: accessToken }),

  deleteAccount: (accessToken: string, password: string) =>
    apiRequest<void>('/users/me', {
      method: 'DELETE',
      token: accessToken,
      body: { password },
    }),
};
