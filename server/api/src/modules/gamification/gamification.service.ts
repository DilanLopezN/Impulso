import { Injectable, Logger } from '@nestjs/common';
import type { Prisma, XpEventType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import {
  ACHIEVEMENTS_CATALOG,
  type AchievementRule,
} from './achievements.catalog';
import { levelFromXp } from './leveling';
import {
  type AchievementView,
  type ProfileSummaryView,
  type XpLedgerEntryView,
  toAchievementView,
  toLedgerEntryView,
  toProfileSummaryView,
} from './gamification.types';

const RULE_VERSION = 1;

// Anti-fraud thresholds. Kept tight enough to make scripted abuse painful but
// loose enough that legitimate burst usage (e.g. catching up after offline)
// passes through.
const RATE_LIMITS: Array<{ action: string; bucketSize: 'minute' | 'hour'; max: number }> = [
  { action: 'XP_AWARD', bucketSize: 'minute', max: 60 },
  { action: 'XP_AWARD', bucketSize: 'hour', max: 1500 },
];

export interface AwardXpInput {
  userId: string;
  type: XpEventType;
  amount: number;
  idempotencyKey: string;
  sourceType?: string | null;
  sourceId?: string | null;
  metadata?: Record<string, unknown> | null;
  // When provided, the engine uses this transaction client instead of opening
  // a new one. This is the path used by `HabitsService.checkin` so the ledger
  // insert lives in the same atomic boundary as the check-in row.
  tx?: Prisma.TransactionClient;
}

export interface AwardXpResult {
  awarded: number;
  applied: boolean;
  reason?: 'idempotent' | 'rate_limited' | 'zero_amount';
  ledgerId?: string;
}

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);
  private catalogReady = false;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Award (or compensate, with negative `amount`) XP to a user. The operation
   * is idempotent: re-issuing the same `idempotencyKey` for the same user is
   * a no-op. A rate-limit check is applied to positive awards as a basic
   * anti-fraud guard.
   */
  async awardXp(input: AwardXpInput): Promise<AwardXpResult> {
    if (input.amount === 0) {
      return { awarded: 0, applied: false, reason: 'zero_amount' };
    }

    const exec = async (tx: Prisma.TransactionClient): Promise<AwardXpResult> => {
      // Positive awards count toward the per-user rate-limit. Negative
      // entries (compensation) are always allowed: they are bookkeeping for
      // an action the user already took.
      if (input.amount > 0) {
        const limited = await this.isRateLimited(tx, input.userId);
        if (limited) {
          this.logger.warn(
            `XP rate-limit hit for user=${input.userId} type=${input.type}`,
          );
          return { awarded: 0, applied: false, reason: 'rate_limited' };
        }
      }

      let ledgerId: string;
      try {
        const created = await tx.xpLedger.create({
          data: {
            userId: input.userId,
            type: input.type,
            amount: input.amount,
            idempotencyKey: input.idempotencyKey,
            sourceType: input.sourceType ?? null,
            sourceId: input.sourceId ?? null,
            metadata:
              input.metadata == null
                ? undefined
                : (input.metadata as Prisma.InputJsonValue),
            ruleVersion: RULE_VERSION,
          },
          select: { id: true },
        });
        ledgerId = created.id;
      } catch (e: unknown) {
        if (this.isUniqueViolation(e)) {
          return { awarded: 0, applied: false, reason: 'idempotent' };
        }
        throw e;
      }

      if (input.amount > 0) {
        await this.bumpRateBuckets(tx, input.userId);
      }
      await this.recomputeProfile(tx, input.userId);

      return { awarded: input.amount, applied: true, ledgerId };
    };

    if (input.tx) {
      return exec(input.tx);
    }
    return this.prisma.$transaction(exec);
  }

  /**
   * Recompute the snapshot in `user_gamification_profile` from the ledger.
   * Called from inside the transaction that wrote the ledger row so the
   * snapshot never drifts.
   */
  async recomputeProfile(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<void> {
    const totals = await tx.xpLedger.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    const totalXp = totals._sum.amount ?? 0;
    const { level, xpIntoLevel, xpToNext } = levelFromXp(totalXp);

    const existing = await tx.userGamificationProfile.findUnique({
      where: { userId },
      select: { longestStreak: true },
    });
    const longestStreak = existing?.longestStreak ?? 0;

    await tx.userGamificationProfile.upsert({
      where: { userId },
      create: {
        userId,
        totalXp,
        level,
        xpIntoLevel,
        xpToNext,
        longestStreak,
      },
      update: { totalXp, level, xpIntoLevel, xpToNext },
    });
  }

  async updateLongestStreak(
    tx: Prisma.TransactionClient,
    userId: string,
    candidate: number,
  ): Promise<void> {
    if (candidate <= 0) return;
    const profile = await tx.userGamificationProfile.upsert({
      where: { userId },
      create: { userId, longestStreak: candidate },
      update: {},
      select: { longestStreak: true },
    });
    if (candidate > profile.longestStreak) {
      await tx.userGamificationProfile.update({
        where: { userId },
        data: { longestStreak: candidate },
      });
    }
  }

  // --------------------------------------------------------------- read API

  async getSummary(userId: string): Promise<ProfileSummaryView> {
    const [profile, achievementsUnlocked] = await Promise.all([
      this.prisma.userGamificationProfile.upsert({
        where: { userId },
        create: { userId },
        update: {},
      }),
      this.prisma.userAchievement.count({ where: { userId } }),
    ]);
    return toProfileSummaryView(profile, achievementsUnlocked);
  }

  async listLedger(
    userId: string,
    opts: { limit?: number; cursor?: string } = {},
  ): Promise<{ items: XpLedgerEntryView[]; nextCursor: string | null }> {
    const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
    const entries = await this.prisma.xpLedger.findMany({
      where: { userId },
      orderBy: { occurredAt: 'desc' },
      take: limit + 1,
      ...(opts.cursor
        ? { cursor: { id: opts.cursor }, skip: 1 }
        : {}),
    });
    const hasMore = entries.length > limit;
    const items = entries.slice(0, limit).map(toLedgerEntryView);
    const nextCursor = hasMore ? entries[limit - 1]!.id : null;
    return { items, nextCursor };
  }

  async listAchievements(userId: string): Promise<AchievementView[]> {
    await this.ensureCatalog();
    const [achievements, unlocks] = await Promise.all([
      this.prisma.achievement.findMany({
        where: { active: true },
        orderBy: [{ category: 'asc' }, { code: 'asc' }],
      }),
      this.prisma.userAchievement.findMany({ where: { userId } }),
    ]);
    const unlockMap = new Map(unlocks.map((u) => [u.achievementId, u]));
    return achievements.map((a) =>
      toAchievementView(a, unlockMap.get(a.id) ?? null),
    );
  }

  // --------------------------------------------------------- achievements

  /**
   * Evaluate every active achievement against the current state and unlock
   * the ones whose rule is satisfied. Called from check-in flows after the
   * XP ledger row was written. Newly unlocked achievements emit their own
   * `ACHIEVEMENT_UNLOCKED` ledger entry inside the same transaction.
   */
  async evaluateAchievements(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<void> {
    await this.ensureCatalog(tx);
    const [achievements, unlocks] = await Promise.all([
      tx.achievement.findMany({ where: { active: true } }),
      tx.userAchievement.findMany({ where: { userId } }),
    ]);
    const unlockedIds = new Set(unlocks.map((u) => u.achievementId));
    const pending = achievements.filter((a) => !unlockedIds.has(a.id));
    if (pending.length === 0) return;

    // Pre-compute the metrics that the rules need so each achievement check
    // is a simple comparison.
    const metrics = await this.computeMetrics(tx, userId);

    for (const achievement of pending) {
      const rule = achievement.rule as unknown as AchievementRule;
      if (!this.ruleSatisfied(rule, metrics)) continue;

      try {
        await tx.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            snapshot: metrics as unknown as Prisma.InputJsonValue,
          },
        });
      } catch (e: unknown) {
        if (this.isUniqueViolation(e)) continue;
        throw e;
      }

      if (achievement.xpReward > 0) {
        await this.awardXp({
          tx,
          userId,
          type: 'ACHIEVEMENT_UNLOCKED',
          amount: achievement.xpReward,
          idempotencyKey: `ACHIEVEMENT_UNLOCKED:${achievement.id}`,
          sourceType: 'achievement',
          sourceId: achievement.id,
          metadata: { code: achievement.code },
        });
      }
    }
  }

  private async computeMetrics(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<{
    longestStreak: number;
    totalCheckins: number;
    totalXp: number;
    goalsCompleted: number;
  }> {
    const [profile, totalCheckins, totalsAgg, goalsCompleted] = await Promise.all([
      tx.userGamificationProfile.findUnique({
        where: { userId },
        select: { longestStreak: true },
      }),
      tx.habitCheckin.count({ where: { userId } }),
      tx.xpLedger.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      tx.goal.count({
        where: { userId, deletedAt: null, progress: { gte: 1 } },
      }),
    ]);
    return {
      longestStreak: profile?.longestStreak ?? 0,
      totalCheckins,
      totalXp: totalsAgg._sum.amount ?? 0,
      goalsCompleted,
    };
  }

  private ruleSatisfied(
    rule: AchievementRule,
    metrics: {
      longestStreak: number;
      totalCheckins: number;
      totalXp: number;
      goalsCompleted: number;
    },
  ): boolean {
    switch (rule.kind) {
      case 'habit_streak':
        return metrics.longestStreak >= rule.threshold;
      case 'habit_total_checkins':
        return metrics.totalCheckins >= rule.threshold;
      case 'total_xp':
        return metrics.totalXp >= rule.threshold;
      case 'goals_completed':
        return metrics.goalsCompleted >= rule.threshold;
      default:
        return false;
    }
  }

  /**
   * Idempotent upsert of the built-in catalog into `achievements`. Done
   * lazily on first read/evaluation so unit tests against a clean DB do
   * not need a separate seed step.
   */
  async ensureCatalog(tx?: Prisma.TransactionClient): Promise<void> {
    if (this.catalogReady) return;
    const client = tx ?? this.prisma;
    for (const seed of ACHIEVEMENTS_CATALOG) {
      await client.achievement.upsert({
        where: { code: seed.code },
        create: {
          code: seed.code,
          title: seed.title,
          description: seed.description,
          category: seed.category,
          icon: seed.icon,
          xpReward: seed.xpReward,
          rule: seed.rule as unknown as Prisma.InputJsonValue,
        },
        update: {
          title: seed.title,
          description: seed.description,
          category: seed.category,
          icon: seed.icon,
          xpReward: seed.xpReward,
          rule: seed.rule as unknown as Prisma.InputJsonValue,
        },
      });
    }
    this.catalogReady = true;
  }

  // ------------------------------------------------------------ anti-fraud

  private bucketKey(size: 'minute' | 'hour', now: Date): string {
    const iso = now.toISOString();
    return size === 'minute' ? iso.slice(0, 16) : iso.slice(0, 13);
  }

  private async isRateLimited(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<boolean> {
    const now = new Date();
    for (const limit of RATE_LIMITS) {
      const bucket = this.bucketKey(limit.bucketSize, now);
      const row = await tx.xpRateBucket.findUnique({
        where: {
          userId_action_bucket: { userId, action: limit.action, bucket },
        },
        select: { count: true },
      });
      if ((row?.count ?? 0) >= limit.max) {
        return true;
      }
    }
    return false;
  }

  private async bumpRateBuckets(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<void> {
    const now = new Date();
    for (const limit of RATE_LIMITS) {
      const bucket = this.bucketKey(limit.bucketSize, now);
      await tx.xpRateBucket.upsert({
        where: {
          userId_action_bucket: { userId, action: limit.action, bucket },
        },
        create: { userId, action: limit.action, bucket, count: 1 },
        update: { count: { increment: 1 } },
      });
    }
  }

  // -------------------------------------------------------------- helpers

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: unknown }).code === 'P2002'
    );
  }
}
