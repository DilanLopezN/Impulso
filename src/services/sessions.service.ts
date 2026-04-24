import { apiRequest } from './api';

export type SessionView = {
  id: string;
  deviceId: string | null;
  deviceName: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
};

export const sessionsService = {
  list: (accessToken: string) =>
    apiRequest<SessionView[]>('/sessions', { token: accessToken }),

  revokeOne: (accessToken: string, sessionId: string) =>
    apiRequest<void>(`/sessions/${sessionId}`, {
      method: 'DELETE',
      token: accessToken,
    }),

  revokeOthers: (accessToken: string) =>
    apiRequest<{ revoked: number }>('/sessions/others', {
      method: 'DELETE',
      token: accessToken,
    }),
};
