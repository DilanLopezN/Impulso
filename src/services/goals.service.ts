import { apiRequest } from './api';

export type GoalType = 'HABIT' | 'DEADLINE' | 'NUMERIC' | 'PROJECT';
export type GoalFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export type MilestoneView = {
  id: string;
  title: string;
  date: string | null;
  done: boolean;
  xp: number;
  order: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GoalView = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  type: GoalType;
  icon: string | null;
  color: string | null;
  deadline: string | null;
  targetValue: number | null;
  targetUnit: string | null;
  frequency: GoalFrequency | null;
  progress: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  milestones: MilestoneView[];
};

export type CreateGoalPayload = {
  title: string;
  description?: string;
  category?: string;
  type: GoalType;
  icon?: string;
  color?: string;
  deadline?: string;
  targetValue?: number;
  targetUnit?: string;
  frequency?: GoalFrequency;
  milestones?: Array<{ title: string; date?: string; xp?: number }>;
};

export type UpdateGoalPayload = {
  title?: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
  deadline?: string | null;
  targetValue?: number | null;
  targetUnit?: string | null;
  frequency?: GoalFrequency | null;
};

export type CreateMilestonePayload = {
  title: string;
  date?: string;
  xp?: number;
  order?: number;
  done?: boolean;
};

export type UpdateMilestonePayload = {
  title?: string;
  date?: string | null;
  xp?: number;
  order?: number;
  done?: boolean;
};

export type ListGoalsParams = {
  archived?: boolean;
  includeDeleted?: boolean;
};

const buildQuery = (params: ListGoalsParams = {}): string => {
  const search = new URLSearchParams();
  if (params.archived !== undefined) {
    search.set('archived', String(params.archived));
  }
  if (params.includeDeleted !== undefined) {
    search.set('includeDeleted', String(params.includeDeleted));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const goalsService = {
  list: (accessToken: string, params: ListGoalsParams = {}) =>
    apiRequest<GoalView[]>(`/goals${buildQuery(params)}`, {
      token: accessToken,
    }),

  get: (accessToken: string, goalId: string) =>
    apiRequest<GoalView>(`/goals/${goalId}`, { token: accessToken }),

  create: (accessToken: string, payload: CreateGoalPayload) =>
    apiRequest<GoalView>('/goals', {
      method: 'POST',
      token: accessToken,
      body: payload,
    }),

  update: (accessToken: string, goalId: string, payload: UpdateGoalPayload) =>
    apiRequest<GoalView>(`/goals/${goalId}`, {
      method: 'PATCH',
      token: accessToken,
      body: payload,
    }),

  archive: (accessToken: string, goalId: string) =>
    apiRequest<GoalView>(`/goals/${goalId}/archive`, {
      method: 'POST',
      token: accessToken,
    }),

  unarchive: (accessToken: string, goalId: string) =>
    apiRequest<GoalView>(`/goals/${goalId}/unarchive`, {
      method: 'POST',
      token: accessToken,
    }),

  remove: (accessToken: string, goalId: string) =>
    apiRequest<void>(`/goals/${goalId}`, {
      method: 'DELETE',
      token: accessToken,
    }),

  addMilestone: (
    accessToken: string,
    goalId: string,
    payload: CreateMilestonePayload,
  ) =>
    apiRequest<GoalView>(`/goals/${goalId}/milestones`, {
      method: 'POST',
      token: accessToken,
      body: payload,
    }),

  updateMilestone: (
    accessToken: string,
    goalId: string,
    milestoneId: string,
    payload: UpdateMilestonePayload,
  ) =>
    apiRequest<GoalView>(`/goals/${goalId}/milestones/${milestoneId}`, {
      method: 'PATCH',
      token: accessToken,
      body: payload,
    }),

  removeMilestone: (
    accessToken: string,
    goalId: string,
    milestoneId: string,
  ) =>
    apiRequest<GoalView>(`/goals/${goalId}/milestones/${milestoneId}`, {
      method: 'DELETE',
      token: accessToken,
    }),
};
