import { apiRequest } from './api';

export type XpEventType =
  | 'HABIT_CHECKIN'
  | 'HABIT_CHECKIN_REVERTED'
  | 'MILESTONE_COMPLETED'
  | 'MILESTONE_REVERTED'
  | 'GOAL_COMPLETED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'MANUAL_ADJUSTMENT';

export type AchievementCategory =
  | 'HABITS'
  | 'GOALS'
  | 'STREAKS'
  | 'XP'
  | 'SPECIAL';

export type ProfileSummary = {
  userId: string;
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpToNext: number;
  longestStreak: number;
  achievementsUnlocked: number;
  updatedAt: string;
};

export type XpLedgerEntry = {
  id: string;
  type: XpEventType;
  amount: number;
  sourceType: string | null;
  sourceId: string | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
};

export type AchievementView = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string | null;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
};

export type ListLedgerParams = {
  limit?: number;
  cursor?: string;
};

const buildQuery = (params: ListLedgerParams = {}): string => {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set('limit', String(params.limit));
  if (params.cursor !== undefined) search.set('cursor', params.cursor);
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const gamificationService = {
  summary: (accessToken: string) =>
    apiRequest<ProfileSummary>('/profile/summary', { token: accessToken }),

  ledger: (accessToken: string, params: ListLedgerParams = {}) =>
    apiRequest<{ items: XpLedgerEntry[]; nextCursor: string | null }>(
      `/gamification/ledger${buildQuery(params)}`,
      { token: accessToken },
    ),

  achievements: (accessToken: string) =>
    apiRequest<AchievementView[]>('/achievements', { token: accessToken }),
};
