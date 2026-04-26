import type {
  Achievement,
  UserAchievement,
  UserGamificationProfile,
  XpLedger,
} from '@prisma/client';

export type XpEventTypeView =
  | 'HABIT_CHECKIN'
  | 'HABIT_CHECKIN_REVERTED'
  | 'MILESTONE_COMPLETED'
  | 'MILESTONE_REVERTED'
  | 'GOAL_COMPLETED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'MANUAL_ADJUSTMENT';

export type AchievementCategoryView =
  | 'HABITS'
  | 'GOALS'
  | 'STREAKS'
  | 'XP'
  | 'SPECIAL';

export interface XpLedgerEntryView {
  id: string;
  type: XpEventTypeView;
  amount: number;
  sourceType: string | null;
  sourceId: string | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
}

export interface ProfileSummaryView {
  userId: string;
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpToNext: number;
  longestStreak: number;
  achievementsUnlocked: number;
  updatedAt: string;
}

export interface AchievementView {
  id: string;
  code: string;
  title: string;
  description: string;
  category: AchievementCategoryView;
  icon: string | null;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export function toLedgerEntryView(entry: XpLedger): XpLedgerEntryView {
  return {
    id: entry.id,
    type: entry.type,
    amount: entry.amount,
    sourceType: entry.sourceType,
    sourceId: entry.sourceId,
    metadata:
      entry.metadata == null
        ? null
        : (entry.metadata as Record<string, unknown>),
    occurredAt: entry.occurredAt.toISOString(),
  };
}

export function toProfileSummaryView(
  profile: UserGamificationProfile,
  achievementsUnlocked: number,
): ProfileSummaryView {
  return {
    userId: profile.userId,
    totalXp: profile.totalXp,
    level: profile.level,
    xpIntoLevel: profile.xpIntoLevel,
    xpToNext: profile.xpToNext,
    longestStreak: profile.longestStreak,
    achievementsUnlocked,
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export function toAchievementView(
  achievement: Achievement,
  unlock: UserAchievement | null,
): AchievementView {
  return {
    id: achievement.id,
    code: achievement.code,
    title: achievement.title,
    description: achievement.description,
    category: achievement.category,
    icon: achievement.icon,
    xpReward: achievement.xpReward,
    unlocked: unlock !== null,
    unlockedAt: unlock ? unlock.unlockedAt.toISOString() : null,
  };
}
