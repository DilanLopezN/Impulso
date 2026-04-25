import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import type { CreateGoalDto } from './dto/create-goal.dto';
import type { CreateMilestoneDto } from './dto/create-milestone.dto';
import type { ListGoalsQuery } from './dto/list-goals.query';
import type { UpdateGoalDto } from './dto/update-goal.dto';
import type { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { type GoalView, toGoalView } from './goals.types';

const GOAL_INCLUDE = {
  milestones: { orderBy: { order: 'asc' as const } },
};

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListGoalsQuery): Promise<GoalView[]> {
    const where: Prisma.GoalWhereInput = { userId };

    if (!query.includeDeleted) {
      where.deletedAt = null;
    }
    if (query.archived === true) {
      where.archivedAt = { not: null };
    } else if (query.archived === false) {
      where.archivedAt = null;
    }

    const goals = await this.prisma.goal.findMany({
      where,
      include: GOAL_INCLUDE,
      orderBy: [{ archivedAt: 'asc' }, { createdAt: 'desc' }],
    });
    return goals.map(toGoalView);
  }

  async getById(userId: string, goalId: string): Promise<GoalView> {
    return toGoalView(await this.loadActive(userId, goalId));
  }

  async create(userId: string, dto: CreateGoalDto): Promise<GoalView> {
    this.assertTypeRequirements(dto);

    const milestones = (dto.milestones ?? []).map((m, index) => ({
      title: m.title,
      date: m.date ? new Date(m.date) : null,
      xp: m.xp ?? 0,
      order: index,
      done: false,
    }));

    const progress = this.computeProgressFromMilestones(milestones);

    const goal = await this.prisma.goal.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description ?? null,
        category: dto.category ?? null,
        type: dto.type,
        icon: dto.icon ?? null,
        color: dto.color ?? null,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        targetValue: dto.targetValue ?? null,
        targetUnit: dto.targetUnit ?? null,
        frequency: dto.frequency ?? null,
        progress,
        milestones: { create: milestones },
      },
      include: GOAL_INCLUDE,
    });
    return toGoalView(goal);
  }

  async update(
    userId: string,
    goalId: string,
    dto: UpdateGoalDto,
  ): Promise<GoalView> {
    const goal = await this.loadActive(userId, goalId);
    if (goal.archivedAt) {
      throw new ConflictException('Cannot edit an archived goal');
    }

    const data: Prisma.GoalUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.deadline !== undefined) {
      data.deadline = dto.deadline === null ? null : new Date(dto.deadline);
    }
    if (dto.targetValue !== undefined) data.targetValue = dto.targetValue;
    if (dto.targetUnit !== undefined) data.targetUnit = dto.targetUnit;
    if (dto.frequency !== undefined) data.frequency = dto.frequency;

    const updated = await this.prisma.goal.update({
      where: { id: goalId },
      data,
      include: GOAL_INCLUDE,
    });
    return toGoalView(updated);
  }

  async archive(userId: string, goalId: string): Promise<GoalView> {
    const goal = await this.loadActive(userId, goalId);
    if (goal.archivedAt) return toGoalView(goal);
    const updated = await this.prisma.goal.update({
      where: { id: goalId },
      data: { archivedAt: new Date() },
      include: GOAL_INCLUDE,
    });
    return toGoalView(updated);
  }

  async unarchive(userId: string, goalId: string): Promise<GoalView> {
    const goal = await this.loadActive(userId, goalId);
    if (!goal.archivedAt) return toGoalView(goal);
    const updated = await this.prisma.goal.update({
      where: { id: goalId },
      data: { archivedAt: null },
      include: GOAL_INCLUDE,
    });
    return toGoalView(updated);
  }

  /**
   * Soft-delete a goal so historical references (XP ledger, achievements,
   * audit log) keep resolving while it disappears from default lists.
   */
  async remove(userId: string, goalId: string): Promise<void> {
    const goal = await this.loadActive(userId, goalId);
    await this.prisma.goal.update({
      where: { id: goal.id },
      data: { deletedAt: new Date(), archivedAt: goal.archivedAt ?? new Date() },
    });
  }

  async addMilestone(
    userId: string,
    goalId: string,
    dto: CreateMilestoneDto,
  ): Promise<GoalView> {
    const goal = await this.loadActive(userId, goalId);
    if (goal.archivedAt) {
      throw new ConflictException('Cannot add milestones to an archived goal');
    }

    const order = dto.order ?? goal.milestones.length;
    const done = dto.done ?? false;

    await this.prisma.milestone.create({
      data: {
        goalId,
        title: dto.title,
        date: dto.date ? new Date(dto.date) : null,
        xp: dto.xp ?? 0,
        order,
        done,
        completedAt: done ? new Date() : null,
      },
    });

    return toGoalView(await this.recalcProgressAndReload(goalId));
  }

  async updateMilestone(
    userId: string,
    goalId: string,
    milestoneId: string,
    dto: UpdateMilestoneDto,
  ): Promise<GoalView> {
    const goal = await this.loadActive(userId, goalId);
    if (goal.archivedAt) {
      throw new ConflictException(
        'Cannot edit milestones of an archived goal',
      );
    }

    const milestone = goal.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    const data: Prisma.MilestoneUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.date !== undefined) {
      data.date = dto.date === null ? null : new Date(dto.date);
    }
    if (dto.xp !== undefined) data.xp = dto.xp;
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.done !== undefined) {
      data.done = dto.done;
      data.completedAt = dto.done ? new Date() : null;
    }

    await this.prisma.milestone.update({ where: { id: milestoneId }, data });

    return toGoalView(await this.recalcProgressAndReload(goalId));
  }

  async removeMilestone(
    userId: string,
    goalId: string,
    milestoneId: string,
  ): Promise<GoalView> {
    const goal = await this.loadActive(userId, goalId);
    if (goal.archivedAt) {
      throw new ConflictException(
        'Cannot remove milestones from an archived goal',
      );
    }

    const milestone = goal.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    await this.prisma.milestone.delete({ where: { id: milestoneId } });
    return toGoalView(await this.recalcProgressAndReload(goalId));
  }

  // ---------------------------------------------------------------- helpers

  private async loadActive(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId, deletedAt: null },
      include: GOAL_INCLUDE,
    });
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }
    return goal;
  }

  private async recalcProgressAndReload(goalId: string) {
    const milestones = await this.prisma.milestone.findMany({
      where: { goalId },
      select: { done: true },
    });
    const progress = this.computeProgressFromMilestones(milestones);
    return this.prisma.goal.update({
      where: { id: goalId },
      data: { progress },
      include: GOAL_INCLUDE,
    });
  }

  private computeProgressFromMilestones(
    milestones: ReadonlyArray<{ done?: boolean }>,
  ): number {
    if (milestones.length === 0) return 0;
    const done = milestones.filter((m) => m.done === true).length;
    return Number((done / milestones.length).toFixed(4));
  }

  /**
   * Type-specific minimum requirements. Kept as runtime checks (not in DTO)
   * because a single DTO would otherwise need conditional validation.
   */
  private assertTypeRequirements(dto: CreateGoalDto): void {
    if (dto.type === 'DEADLINE' && !dto.deadline) {
      throw new BadRequestException(
        'DEADLINE goals require `deadline`.',
      );
    }
    if (dto.type === 'NUMERIC' && (dto.targetValue === undefined || dto.targetValue === null)) {
      throw new BadRequestException(
        'NUMERIC goals require `targetValue`.',
      );
    }
    if (dto.type === 'HABIT' && !dto.frequency) {
      throw new BadRequestException(
        'HABIT goals require `frequency`.',
      );
    }
  }
}
