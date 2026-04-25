import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/auth/AuthContext';
import {
  goalsService,
  type CreateGoalPayload,
  type CreateMilestonePayload,
  type GoalView,
  type ListGoalsParams,
  type UpdateGoalPayload,
  type UpdateMilestonePayload,
} from '@/services/goals.service';

type GoalsContextValue = {
  goals: GoalView[];
  loading: boolean;
  error: string | null;
  refresh: (params?: ListGoalsParams) => Promise<void>;
  createGoal: (payload: CreateGoalPayload) => Promise<GoalView>;
  updateGoal: (id: string, payload: UpdateGoalPayload) => Promise<GoalView>;
  archiveGoal: (id: string) => Promise<GoalView>;
  unarchiveGoal: (id: string) => Promise<GoalView>;
  deleteGoal: (id: string) => Promise<void>;
  addMilestone: (
    goalId: string,
    payload: CreateMilestonePayload,
  ) => Promise<GoalView>;
  toggleMilestone: (
    goalId: string,
    milestoneId: string,
    done: boolean,
  ) => Promise<GoalView>;
  updateMilestone: (
    goalId: string,
    milestoneId: string,
    payload: UpdateMilestonePayload,
  ) => Promise<GoalView>;
  removeMilestone: (
    goalId: string,
    milestoneId: string,
  ) => Promise<GoalView>;
};

const GoalsContext = createContext<GoalsContextValue | undefined>(undefined);

const requireToken = (token: string | null | undefined): string => {
  if (!token) throw new Error('Operação requer usuário autenticado.');
  return token;
};

const humanize = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return 'Erro desconhecido';
};

export const GoalsProvider = ({ children }: { children: ReactNode }) => {
  const { tokens, status } = useAuth();
  const accessToken = tokens?.accessToken ?? null;

  const [goals, setGoals] = useState<GoalView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (params?: ListGoalsParams) => {
      if (!accessToken) {
        setGoals([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const list = await goalsService.list(accessToken, params);
        setGoals(list);
      } catch (err) {
        setError(humanize(err));
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  // Auto-load when authentication state flips. Intentionally swallows the
  // promise — refresh() handles its own error/loading state.
  useEffect(() => {
    if (status === 'authenticated' && accessToken) {
      void refresh();
    } else {
      setGoals([]);
    }
  }, [status, accessToken, refresh]);

  const replaceGoal = useCallback((updated: GoalView) => {
    setGoals((prev) => {
      const idx = prev.findIndex((g) => g.id === updated.id);
      if (idx === -1) return [updated, ...prev];
      const next = prev.slice();
      next[idx] = updated;
      return next;
    });
  }, []);

  const createGoal = useCallback(
    async (payload: CreateGoalPayload) => {
      const created = await goalsService.create(requireToken(accessToken), payload);
      setGoals((prev) => [created, ...prev]);
      return created;
    },
    [accessToken],
  );

  const updateGoal = useCallback(
    async (id: string, payload: UpdateGoalPayload) => {
      const updated = await goalsService.update(requireToken(accessToken), id, payload);
      replaceGoal(updated);
      return updated;
    },
    [accessToken, replaceGoal],
  );

  const archiveGoal = useCallback(
    async (id: string) => {
      const updated = await goalsService.archive(requireToken(accessToken), id);
      replaceGoal(updated);
      return updated;
    },
    [accessToken, replaceGoal],
  );

  const unarchiveGoal = useCallback(
    async (id: string) => {
      const updated = await goalsService.unarchive(requireToken(accessToken), id);
      replaceGoal(updated);
      return updated;
    },
    [accessToken, replaceGoal],
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      await goalsService.remove(requireToken(accessToken), id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    },
    [accessToken],
  );

  const addMilestone = useCallback(
    async (goalId: string, payload: CreateMilestonePayload) => {
      const updated = await goalsService.addMilestone(
        requireToken(accessToken),
        goalId,
        payload,
      );
      replaceGoal(updated);
      return updated;
    },
    [accessToken, replaceGoal],
  );

  const updateMilestone = useCallback(
    async (
      goalId: string,
      milestoneId: string,
      payload: UpdateMilestonePayload,
    ) => {
      const updated = await goalsService.updateMilestone(
        requireToken(accessToken),
        goalId,
        milestoneId,
        payload,
      );
      replaceGoal(updated);
      return updated;
    },
    [accessToken, replaceGoal],
  );

  const toggleMilestone = useCallback(
    (goalId: string, milestoneId: string, done: boolean) =>
      updateMilestone(goalId, milestoneId, { done }),
    [updateMilestone],
  );

  const removeMilestone = useCallback(
    async (goalId: string, milestoneId: string) => {
      const updated = await goalsService.removeMilestone(
        requireToken(accessToken),
        goalId,
        milestoneId,
      );
      replaceGoal(updated);
      return updated;
    },
    [accessToken, replaceGoal],
  );

  const value = useMemo<GoalsContextValue>(
    () => ({
      goals,
      loading,
      error,
      refresh,
      createGoal,
      updateGoal,
      archiveGoal,
      unarchiveGoal,
      deleteGoal,
      addMilestone,
      toggleMilestone,
      updateMilestone,
      removeMilestone,
    }),
    [
      goals,
      loading,
      error,
      refresh,
      createGoal,
      updateGoal,
      archiveGoal,
      unarchiveGoal,
      deleteGoal,
      addMilestone,
      toggleMilestone,
      updateMilestone,
      removeMilestone,
    ],
  );

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
};

export const useGoals = (): GoalsContextValue => {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error('useGoals must be used within a GoalsProvider');
  return ctx;
};
