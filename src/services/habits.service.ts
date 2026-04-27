import { apiRequest } from './api';

export type HabitFrequency = 'DAILY' | 'WEEKLY' | 'CUSTOM';

export type HabitView = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  frequency: HabitFrequency;
  weekdays: number[];
  targetPerWeek: number;
  xpPerCheckin: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  todayDone: boolean;
  streak: number;
  weekDone: number;
  weekTarget: number;
};

export type HabitCheckinView = {
  id: string;
  habitId: string;
  date: string;
  note: string | null;
  xpAwarded: number;
  source: string;
  createdAt: string;
};

export type CreateHabitPayload = {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  frequency?: HabitFrequency;
  weekdays?: number[];
  targetPerWeek?: number;
  xpPerCheckin?: number;
};

export type UpdateHabitPayload = Partial<CreateHabitPayload>;

export type CheckinPayload = {
  date?: string;
  note?: string;
};

export type AdjustCheckinPayload = {
  date: string;
  done: boolean;
  reason?: string;
};

export type ListHabitsParams = {
  archived?: boolean;
};

const buildQuery = (params: Record<string, string | number | boolean | undefined>): string => {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) search.set(k, String(v));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const habitsService = {
  list: (accessToken: string, params: ListHabitsParams = {}) =>
    apiRequest<HabitView[]>(`/habits${buildQuery(params)}`, {
      token: accessToken,
    }),

  get: (accessToken: string, habitId: string) =>
    apiRequest<HabitView>(`/habits/${habitId}`, { token: accessToken }),

  create: (accessToken: string, payload: CreateHabitPayload) =>
    apiRequest<HabitView>('/habits', {
      method: 'POST',
      token: accessToken,
      body: payload,
    }),

  update: (accessToken: string, habitId: string, payload: UpdateHabitPayload) =>
    apiRequest<HabitView>(`/habits/${habitId}`, {
      method: 'PATCH',
      token: accessToken,
      body: payload,
    }),

  archive: (accessToken: string, habitId: string) =>
    apiRequest<HabitView>(`/habits/${habitId}/archive`, {
      method: 'POST',
      token: accessToken,
    }),

  unarchive: (accessToken: string, habitId: string) =>
    apiRequest<HabitView>(`/habits/${habitId}/unarchive`, {
      method: 'POST',
      token: accessToken,
    }),

  remove: (accessToken: string, habitId: string) =>
    apiRequest<void>(`/habits/${habitId}`, {
      method: 'DELETE',
      token: accessToken,
    }),

  checkin: (accessToken: string, habitId: string, payload: CheckinPayload = {}) =>
    apiRequest<HabitView>(`/habits/${habitId}/checkin`, {
      method: 'POST',
      token: accessToken,
      body: payload,
    }),

  undoCheckin: (accessToken: string, habitId: string, date?: string) =>
    apiRequest<HabitView>(
      `/habits/${habitId}/checkin${buildQuery({ date })}`,
      { method: 'DELETE', token: accessToken },
    ),

  listCheckins: (
    accessToken: string,
    habitId: string,
    range: { from?: string; to?: string } = {},
  ) =>
    apiRequest<HabitCheckinView[]>(
      `/habits/${habitId}/checkins${buildQuery(range)}`,
      { token: accessToken },
    ),

  adjust: (accessToken: string, habitId: string, payload: AdjustCheckinPayload) =>
    apiRequest<HabitView>(`/habits/${habitId}/checkin/adjust`, {
      method: 'POST',
      token: accessToken,
      body: payload,
    }),
};
