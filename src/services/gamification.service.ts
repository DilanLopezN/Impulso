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

export type RankingPeriod = 'weekly' | 'monthly' | 'all_time';
export type RankingScope = 'global' | 'friends' | 'team';

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

export type RankingEntry = {
  position: number;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  totalXp: number;
  checkinsCount: number;
  lastActivityAt: string;
};

export type RankingList = {
  period: RankingPeriod;
  scope: RankingScope;
  generatedAt: string;
  tieBreakers: string[];
  items: RankingEntry[];
};

export type ListLedgerParams = {
  limit?: number;
  cursor?: string;
};

export type ListRankingsParams = {
  period?: RankingPeriod;
  scope?: RankingScope;
  limit?: number;
  offset?: number;
  teamId?: string;
};

const buildQuery = (params: Record<string, string | number | undefined>): string => {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) search.set(k, String(v));
  }
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

  rankings: (accessToken: string, params: ListRankingsParams = {}) =>
    apiRequest<RankingList>(
      `/rankings${buildQuery({
        period: params.period,
        scope: params.scope,
        limit: params.limit,
        offset: params.offset,
        teamId: params.teamId,
      })}`,
      { token: accessToken },
    ),
};
