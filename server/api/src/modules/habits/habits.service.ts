import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Habit, Prisma } from '@prisma/client';

import { GamificationService } from '../gamification/gamification.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  eachDay,
  shiftDate,
  startOfWeek,
  todayLocal,
  weekdayIndex,
} from './calendar.util';
import type { CreateHabitDto } from './dto/create-habit.dto';
import type { UpdateHabitDto } from './dto/update-habit.dto';
import {
  type HabitCheckinView,
  type HabitView,
  toCheckinView,
  toHabitView,
} from './habits.types';

const STREAK_LOOKBACK_DAYS = 365;

@Injectable()
export class HabitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamification: GamificationService,
  ) {}

  // -------------------------------------------------------------- read API

  async list(userId: string, archived: boolean | undefined): Promise<HabitView[]> {
    const where: Prisma.HabitWhereInput = { userId, deletedAt: null };
    if (archived === true) where.archivedAt = { not: null };
    else if (archived === false) where.archivedAt = null;

    const habits = await this.prisma.habit.findMany({
      where,
      orderBy: [{ archivedAt: 'asc' }, { createdAt: 'asc' }],
    });
    if (habits.length === 0) return [];

    const tz = await this.userTimezone(userId);
    return Promise.all(habits.map((h) => this.buildView(h, tz)));
  }

  async getById(userId: string, habitId: string): Promise<HabitView> {
    const habit = await this.loadActive(userId, habitId);
    const tz = await this.userTimezone(userId);
    return this.buildView(habit, tz);
  }

  async listCheckins(
    userId: string,
    habitId: string,
    range: { from?: string; to?: string },
  ): Promise<HabitCheckinView[]> {
    await this.loadActive(userId, habitId);
    const where: Prisma.HabitCheckinWhereInput = { habitId, userId };
    if (range.from || range.to) {
      where.date = {
        ...(range.from ? { gte: new Date(range.from) } : {}),
        ...(range.to ? { lte: new Date(range.to) } : {}),
      };
    }
    const checkins = await this.prisma.habitCheckin.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 200,
    });
    return checkins.map(toCheckinView);
  }

  // -------------------------------------------------------------- write API

  async create(userId: string, dto: CreateHabitDto): Promise<HabitView> {
    this.assertFrequencyConsistency(dto);

    const habit = await this.prisma.habit.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description ?? null,
        icon: dto.icon ?? null,
        color: dto.color ?? null,
        frequency: dto.frequency ?? 'DAILY',
        weekdays: dto.weekdays ?? [],
        targetPerWeek: dto.targetPerWeek ?? 1,
        xpPerCheckin: dto.xpPerCheckin ?? 10,
      },
    });
    const tz = await this.userTimezone(userId);
    return this.buildView(habit, tz);
  }

  async update(
    userId: string,
    habitId: string,
    dto: UpdateHabitDto,
  ): Promise<HabitView> {
    const habit = await this.loadActive(userId, habitId);
    if (habit.archivedAt) {
      throw new ConflictException('Cannot edit an archived habit');
    }

    const data: Prisma.HabitUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.frequency !== undefined) data.frequency = dto.frequency;
    if (dto.weekdays !== undefined) data.weekdays = dto.weekdays;
    if (dto.targetPerWeek !== undefined) data.targetPerWeek = dto.targetPerWeek;
    if (dto.xpPerCheckin !== undefined) data.xpPerCheckin = dto.xpPerCheckin;

    if (
      dto.frequency !== undefined ||
      dto.weekdays !== undefined ||
      dto.targetPerWeek !== undefined
    ) {
      this.assertFrequencyConsistency({
        frequency: dto.frequency ?? habit.frequency,
        weekdays: dto.weekdays ?? habit.weekdays,
        targetPerWeek: dto.targetPerWeek ?? habit.targetPerWeek,
      });
    }

    const updated = await this.prisma.habit.update({
      where: { id: habitId },
      data,
    });
    await this.prisma.habitAuditLog.create({
      data: {
        habitId,
        userId,
        action: 'EDIT_HABIT',
        metadata: dto as unknown as Prisma.InputJsonValue,
      },
    });
    const tz = await this.userTimezone(userId);
    return this.buildView(updated, tz);
  }

  async archive(userId: string, habitId: string): Promise<HabitView> {
    const habit = await this.loadActive(userId, habitId);
    if (habit.archivedAt) {
      const tz = await this.userTimezone(userId);
      return this.buildView(habit, tz);
    }
    const updated = await this.prisma.habit.update({
      where: { id: habitId },
      data: { archivedAt: new Date() },
    });
    await this.prisma.habitAuditLog.create({
      data: { habitId, userId, action: 'ARCHIVE' },
    });
    const tz = await this.userTimezone(userId);
    return this.buildView(updated, tz);
  }

  async unarchive(userId: string, habitId: string): Promise<HabitView> {
    const habit = await this.loadActive(userId, habitId);
    if (!habit.archivedAt) {
      const tz = await this.userTimezone(userId);
      return this.buildView(habit, tz);
    }
    const updated = await this.prisma.habit.update({
      where: { id: habitId },
      data: { archivedAt: null },
    });
    await this.prisma.habitAuditLog.create({
      data: { habitId, userId, action: 'UNARCHIVE' },
    });
    const tz = await this.userTimezone(userId);
    return this.buildView(updated, tz);
  }

  /** Soft-delete the habit; check-ins remain for historical aggregations. */
  async remove(userId: string, habitId: string): Promise<void> {
    const habit = await this.loadActive(userId, habitId);
    await this.prisma.habit.update({
      where: { id: habit.id },
      data: { deletedAt: new Date() },
    });
  }

  // ------------------------------------------------------------- check-in

  /**
   * Mark today's (or any) date as done for the habit. Idempotent: re-issuing
   * the same `(habitId, date)` returns the existing check-in without
   * awarding XP again.
   */
  async checkin(
    userId: string,
    habitId: string,
    input: { date?: string; note?: string; source?: string } = {},
  ): Promise<HabitView> {
    const habit = await this.loadActive(userId, habitId);
    if (habit.archivedAt) {
      throw new ConflictException('Cannot check-in on an archived habit');
    }

    const tz = await this.userTimezone(userId);
    const dateIso = input.date ?? todayLocal(tz);

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.habitCheckin.findUnique({
        where: { habitId_date: { habitId, date: new Date(dateIso) } },
      });
      if (existing) {
        // Idempotent path. Update the note if the caller provided one,
        // skip the XP award entirely.
        if (input.note !== undefined && input.note !== existing.note) {
          await tx.habitCheckin.update({
            where: { id: existing.id },
            data: { note: input.note },
          });
        }
        return;
      }

      const award = await this.gamification.awardXp({
        tx,
        userId,
        type: 'HABIT_CHECKIN',
        amount: habit.xpPerCheckin,
        idempotencyKey: `HABIT_CHECKIN:${habitId}:${dateIso}`,
        sourceType: 'habit',
        sourceId: habitId,
        metadata: { date: dateIso },
      });

      await tx.habitCheckin.create({
        data: {
          habitId,
          userId,
          date: new Date(dateIso),
          note: input.note ?? null,
          xpAwarded: award.applied ? award.awarded : 0,
          source: input.source ?? 'user',
        },
      });

      // Recompute streak and feed it to gamification so the longest-streak
      // achievement rule has fresh data.
      const streak = await this.computeStreak(tx, habit, tz);
      await this.gamification.updateLongestStreak(tx, userId, streak);
      await this.gamification.evaluateAchievements(tx, userId);
    });

    return this.getById(userId, habitId);
  }

  /**
   * Undo a check-in. The original XP is compensated with a negative ledger
   * entry, never silently deleted, so the audit trail is preserved.
   */
  async undoCheckin(
    userId: string,
    habitId: string,
    date?: string,
  ): Promise<HabitView> {
    const habit = await this.loadActive(userId, habitId);
    const tz = await this.userTimezone(userId);
    const dateIso = date ?? todayLocal(tz);

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.habitCheckin.findUnique({
        where: { habitId_date: { habitId, date: new Date(dateIso) } },
      });
      if (!existing) return;

      await tx.habitCheckin.delete({ where: { id: existing.id } });

      if (existing.xpAwarded > 0) {
        await this.gamification.awardXp({
          tx,
          userId,
          type: 'HABIT_CHECKIN_REVERTED',
          amount: -existing.xpAwarded,
          idempotencyKey: `HABIT_CHECKIN_REVERTED:${habitId}:${dateIso}`,
          sourceType: 'habit',
          sourceId: habitId,
          metadata: { date: dateIso },
        });
      }

      const streak = await this.computeStreak(tx, habit, tz);
      await this.gamification.updateLongestStreak(tx, userId, streak);
    });

    return this.getById(userId, habitId);
  }

  /**
   * Manual history adjustment. Same effect as a check-in but routed through
   * the audit log with the actor's reason — used for backfilling missed
   * days or correcting mistakes.
   */
  async adjustHistory(
    userId: string,
    habitId: string,
    input: { date: string; done: boolean; reason?: string },
  ): Promise<HabitView> {
    const habit = await this.loadActive(userId, habitId);
    const tz = await this.userTimezone(userId);

    if (input.done) {
      await this.prisma.$transaction(async (tx) => {
        const existing = await tx.habitCheckin.findUnique({
          where: { habitId_date: { habitId, date: new Date(input.date) } },
        });
        if (existing) return;

        const award = await this.gamification.awardXp({
          tx,
          userId,
          type: 'HABIT_CHECKIN',
          amount: habit.xpPerCheckin,
          idempotencyKey: `HABIT_CHECKIN:${habitId}:${input.date}`,
          sourceType: 'habit',
          sourceId: habitId,
          metadata: { date: input.date, manual: true },
        });

        await tx.habitCheckin.create({
          data: {
            habitId,
            userId,
            date: new Date(input.date),
            xpAwarded: award.applied ? award.awarded : 0,
            source: 'manual_adjustment',
          },
        });
        await tx.habitAuditLog.create({
          data: {
            habitId,
            userId,
            action: 'CREATE_CHECKIN',
            refDate: new Date(input.date),
            reason: input.reason ?? null,
          },
        });
        const streak = await this.computeStreak(tx, habit, tz);
        await this.gamification.updateLongestStreak(tx, userId, streak);
        await this.gamification.evaluateAchievements(tx, userId);
      });
    } else {
      await this.prisma.$transaction(async (tx) => {
        const existing = await tx.habitCheckin.findUnique({
          where: { habitId_date: { habitId, date: new Date(input.date) } },
        });
        if (!existing) return;
        await tx.habitCheckin.delete({ where: { id: existing.id } });
        if (existing.xpAwarded > 0) {
          await this.gamification.awardXp({
            tx,
            userId,
            type: 'HABIT_CHECKIN_REVERTED',
            amount: -existing.xpAwarded,
            idempotencyKey: `HABIT_CHECKIN_REVERTED:${habitId}:${input.date}`,
            sourceType: 'habit',
            sourceId: habitId,
            metadata: { date: input.date, manual: true },
          });
        }
        await tx.habitAuditLog.create({
          data: {
            habitId,
            userId,
            action: 'DELETE_CHECKIN',
            refDate: new Date(input.date),
            reason: input.reason ?? null,
          },
        });
        const streak = await this.computeStreak(tx, habit, tz);
        await this.gamification.updateLongestStreak(tx, userId, streak);
      });
    }

    return this.getById(userId, habitId);
  }

  // -------------------------------------------------------------- helpers

  private async loadActive(userId: string, habitId: string): Promise<Habit> {
    const habit = await this.prisma.habit.findFirst({
      where: { id: habitId, userId, deletedAt: null },
    });
    if (!habit) throw new NotFoundException('Habit not found');
    return habit;
  }

  private async userTimezone(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    return user?.timezone ?? 'UTC';
  }

  private assertFrequencyConsistency(input: {
    frequency?: string;
    weekdays?: number[];
    targetPerWeek?: number;
  }): void {
    if (input.frequency === 'CUSTOM') {
      if (!input.weekdays || input.weekdays.length === 0) {
        throw new BadRequestException(
          'CUSTOM habits require at least one weekday in `weekdays`.',
        );
      }
    }
    if (input.frequency === 'WEEKLY') {
      if (input.targetPerWeek !== undefined && input.targetPerWeek < 1) {
        throw new BadRequestException(
          'WEEKLY habits require `targetPerWeek` >= 1.',
        );
      }
    }
  }

  /**
   * Compose the wire view for a habit. Streak, weekly progress and "todayDone"
   * are derived from the check-in table because they must stay accurate after
   * manual adjustments without explicit denormalisation maintenance.
   */
  private async buildView(habit: Habit, tz: string): Promise<HabitView> {
    const today = todayLocal(tz);
    const weekStart = startOfWeek(today);

    const [todayCheckin, weekCheckins, streak] = await Promise.all([
      this.prisma.habitCheckin.findUnique({
        where: { habitId_date: { habitId: habit.id, date: new Date(today) } },
        select: { id: true },
      }),
      this.prisma.habitCheckin.count({
        where: {
          habitId: habit.id,
          date: { gte: new Date(weekStart), lte: new Date(today) },
        },
      }),
      this.computeStreakReadOnly(habit, tz),
    ]);

    return toHabitView(habit, {
      todayDone: todayCheckin !== null,
      streak,
      weekDone: weekCheckins,
      weekTarget: this.weeklyTarget(habit),
    });
  }

  private weeklyTarget(habit: Habit): number {
    if (habit.frequency === 'DAILY') return 7;
    if (habit.frequency === 'CUSTOM') return habit.weekdays.length || 1;
    return habit.targetPerWeek;
  }

  private async computeStreakReadOnly(habit: Habit, tz: string): Promise<number> {
    return this.computeStreak(this.prisma, habit, tz);
  }

  /**
   * Walk back from today and count consecutive *due* days that have a
   * check-in. A "due day" is decided by frequency:
   *   DAILY  → every day
   *   CUSTOM → only the weekdays the user opted in
   *   WEEKLY → counted in 7-day windows; we treat the week as satisfied iff
   *            the count of check-ins inside the window meets the target.
   */
  private async computeStreak(
    db: Prisma.TransactionClient,
    habit: Habit,
    tz: string,
  ): Promise<number> {
    const today = todayLocal(tz);
    const from = shiftDate(today, -STREAK_LOOKBACK_DAYS);

    const checkins = await db.habitCheckin.findMany({
      where: {
        habitId: habit.id,
        date: { gte: new Date(from), lte: new Date(today) },
      },
      select: { date: true },
    });
    const dones = new Set(
      checkins.map((c) => c.date.toISOString().slice(0, 10)),
    );

    if (habit.frequency === 'WEEKLY') {
      // Slide a 7-day window backwards starting from today.
      let streak = 0;
      const target = Math.max(1, habit.targetPerWeek);
      let windowEnd = today;
      while (true) {
        const windowStart = shiftDate(windowEnd, -6);
        const days = eachDay(windowStart, windowEnd);
        const count = days.filter((d) => dones.has(d)).length;
        if (count >= target) {
          streak += 1;
          windowEnd = shiftDate(windowStart, -1);
          if (windowEnd < from) break;
        } else if (windowEnd === today && count < target) {
          // Current window not yet completed — don't penalise it, but no
          // streak credit until it does.
          break;
        } else {
          break;
        }
      }
      return streak;
    }

    let streak = 0;
    let cursor = today;
    let firstDay = true;
    while (cursor >= from) {
      const isDue =
        habit.frequency === 'DAILY' ||
        habit.weekdays.includes(weekdayIndex(cursor));

      if (!isDue) {
        cursor = shiftDate(cursor, -1);
        continue;
      }
      if (dones.has(cursor)) {
        streak += 1;
      } else if (firstDay) {
        // Today is due but not yet done — that's fine, look at yesterday.
        // Don't break the streak just because the day is still ongoing.
      } else {
        break;
      }
      firstDay = false;
      cursor = shiftDate(cursor, -1);
    }
    return streak;
  }
}
