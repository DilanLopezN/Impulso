import type { Goal, Milestone } from '@prisma/client';

export type GoalType = 'HABIT' | 'DEADLINE' | 'NUMERIC' | 'PROJECT';
export type GoalFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export interface MilestoneView {
  id: string;
  title: string;
  date: string | null;
  done: boolean;
  xp: number;
  order: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalView {
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
}

export function toMilestoneView(milestone: Milestone): MilestoneView {
  return {
    id: milestone.id,
    title: milestone.title,
    date: milestone.date ? milestone.date.toISOString() : null,
    done: milestone.done,
    xp: milestone.xp,
    order: milestone.order,
    completedAt: milestone.completedAt
      ? milestone.completedAt.toISOString()
      : null,
    createdAt: milestone.createdAt.toISOString(),
    updatedAt: milestone.updatedAt.toISOString(),
  };
}

export function toGoalView(
  goal: Goal & { milestones: Milestone[] },
): GoalView {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    type: goal.type,
    icon: goal.icon,
    color: goal.color,
    deadline: goal.deadline ? goal.deadline.toISOString() : null,
    targetValue: goal.targetValue,
    targetUnit: goal.targetUnit,
    frequency: goal.frequency,
    progress: goal.progress,
    archivedAt: goal.archivedAt ? goal.archivedAt.toISOString() : null,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
    milestones: [...goal.milestones]
      .sort((a, b) => a.order - b.order)
      .map(toMilestoneView),
  };
}
