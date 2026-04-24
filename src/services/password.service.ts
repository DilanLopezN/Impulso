import { apiRequest } from './api';

export const passwordService = {
  forgot: (email: string) =>
    apiRequest<{ status: 'accepted' }>('/auth/password/forgot', {
      method: 'POST',
      body: { email },
    }),

  reset: (token: string, password: string) =>
    apiRequest<void>('/auth/password/reset', {
      method: 'POST',
      body: { token, password },
    }),
};
