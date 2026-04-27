import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/auth/AuthContext';
import { lastNDays, todayLocal } from '@/data/calendar';
import {
  habitsService,
  type AdjustCheckinPayload,
  type CreateHabitPayload,
  type HabitCheckinView,
  type HabitView,
  type UpdateHabitPayload,
} from '@/services/habits.service';

// Keep a 30-day rolling window in memory. Big enough for the heatmap +
// week-grid; small enough that the per-habit fan-out stays cheap.
const HEATMAP_WINDOW_DAYS = 30;

type CheckinIndex = Record<string, Set<string>>;

type HabitsContextValue = {
  habits: HabitView[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  /** ISO date → set of habitIds checked in that day. */
  checkinsByHabit: CheckinIndex;
  refresh: () => Promise<void>;
  createHabit: (payload: CreateHabitPayload) => Promise<HabitView>;
  updateHabit: (id: string, payload: UpdateHabitPayload) => Promise<HabitView>;
  archiveHabit: (id: string) => Promise<HabitView>;
  unarchiveHabit: (id: string) => Promise<HabitView>;
  removeHabit: (id: string) => Promise<void>;
  toggleCheckin: (id: string, dateIso?: string) => Promise<void>;
  adjustHistory: (id: string, payload: AdjustCheckinPayload) => Promise<HabitView>;
};

const HabitsContext = createContext<HabitsContextValue | undefined>(undefined);

const requireToken = (token: string | null | undefined): string => {
  if (!token) throw new Error('Operação requer usuário autenticado.');
  return token;
};

const humanize = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return 'Erro desconhecido';
};

const buildIndex = (
  habits: HabitView[],
  checkins: HabitCheckinView[][],
): CheckinIndex => {
  const idx: CheckinIndex = {};
  habits.forEach((habit, i) => {
    const set = new Set<string>();
    for (const c of checkins[i] ?? []) set.add(c.date);
    idx[habit.id] = set;
  });
  return idx;
};

export const HabitsProvider = ({ children }: { children: ReactNode }) => {
  const { tokens, status } = useAuth();
  const accessToken = tokens?.accessToken ?? null;

  const [habits, setHabits] = useState<HabitView[]>([]);
  const [checkinsByHabit, setCheckinsByHabit] = useState<CheckinIndex>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Latest snapshot for optimistic-update rollbacks. Refs avoid stale-closure
  // bugs in the toggle handler — it always reverts to the freshest state.
  const habitsRef = useRef<HabitView[]>([]);
  const checkinsRef = useRef<CheckinIndex>({});
  habitsRef.current = habits;
  checkinsRef.current = checkinsByHabit;

  const fetchAll = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!accessToken) {
        setHabits([]);
        setCheckinsByHabit({});
        return;
      }
      if (mode === 'initial') setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const list = await habitsService.list(accessToken, { archived: false });
        const window = lastNDays(HEATMAP_WINDOW_DAYS);
        const from = window[0];
        const to = window[window.length - 1];
        const checkins = await Promise.all(
          list.map((h) =>
            habitsService.listCheckins(accessToken, h.id, { from, to }).catch(() => []),
          ),
        );
        setHabits(list);
        setCheckinsByHabit(buildIndex(list, checkins));
      } catch (err) {
        setError(humanize(err));
      } finally {
        if (mode === 'initial') setLoading(false);
        else setRefreshing(false);
      }
    },
    [accessToken],
  );

  const refresh = useCallback(() => fetchAll('refresh'), [fetchAll]);

  useEffect(() => {
    if (status === 'authenticated' && accessToken) {
      void fetchAll('initial');
    } else {
      setHabits([]);
      setCheckinsByHabit({});
    }
  }, [status, accessToken, fetchAll]);

  const replaceHabit = useCallback((updated: HabitView) => {
    setHabits((prev) => {
      const idx = prev.findIndex((h) => h.id === updated.id);
      if (idx === -1) return [updated, ...prev];
      const next = prev.slice();
      next[idx] = updated;
      return next;
    });
  }, []);

  const createHabit = useCallback(
    async (payload: CreateHabitPayload) => {
      const created = await habitsService.create(requireToken(accessToken), payload);
      setHabits((prev) => [...prev, created]);
      setCheckinsByHabit((prev) => ({ ...prev, [created.id]: new Set<string>() }));
      return created;
    },
    [accessToken],
  );

  const updateHabit = useCallback(
    async (id: string, payload: UpdateHabitPayload) => {
      const updated = await habitsService.update(requireToken(accessToken), id, payload);
      replaceHabit(updated);
      return updated;
    },
    [accessToken, replaceHabit],
  );

  const archiveHabit = useCallback(
    async (id: string) => {
      const updated = await habitsService.archive(requireToken(accessToken), id);
      replaceHabit(updated);
      return updated;
    },
    [accessToken, replaceHabit],
  );

  const unarchiveHabit = useCallback(
    async (id: string) => {
      const updated = await habitsService.unarchive(requireToken(accessToken), id);
      replaceHabit(updated);
      return updated;
    },
    [accessToken, replaceHabit],
  );

  const removeHabit = useCallback(
    async (id: string) => {
      await habitsService.remove(requireToken(accessToken), id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setCheckinsByHabit((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [accessToken],
  );

  /**
   * Optimistic toggle: flips local state immediately so the UI feels instant,
   * then reconciles against the server response. On failure the snapshot
   * captured before mutation is restored.
   */
  const toggleCheckin = useCallback(
    async (id: string, dateIso?: string) => {
      const token = requireToken(accessToken);
      const date = dateIso ?? todayLocal();

      const habitsSnapshot = habitsRef.current;
      const checkinsSnapshot = checkinsRef.current;

      const habit = habitsSnapshot.find((h) => h.id === id);
      if (!habit) return;

      const currentSet = checkinsSnapshot[id] ?? new Set<string>();
      const wasDone = currentSet.has(date);
      const isToday = date === todayLocal();

      // Local prediction: streak/weekDone is recomputed authoritatively when
      // the server response lands. We just nudge the visible counters so the
      // numbers don't lag behind the tap.
      const optimisticHabit: HabitView = {
        ...habit,
        todayDone: isToday ? !wasDone : habit.todayDone,
        weekDone: wasDone
          ? Math.max(0, habit.weekDone - 1)
          : habit.weekDone + 1,
        streak:
          isToday && !wasDone
            ? habit.streak + 1
            : isToday && wasDone
            ? Math.max(0, habit.streak - 1)
            : habit.streak,
      };

      const newSet = new Set(currentSet);
      if (wasDone) newSet.delete(date);
      else newSet.add(date);

      setHabits((prev) =>
        prev.map((h) => (h.id === id ? optimisticHabit : h)),
      );
      setCheckinsByHabit((prev) => ({ ...prev, [id]: newSet }));

      try {
        const updated = wasDone
          ? await habitsService.undoCheckin(token, id, date)
          : await habitsService.checkin(token, id, { date });
        replaceHabit(updated);
      } catch (err) {
        // Roll back to the pre-mutation snapshot — anything more granular
        // would be deceptive while the server state is unknown.
        setHabits(habitsSnapshot);
        setCheckinsByHabit(checkinsSnapshot);
        setError(humanize(err));
        throw err;
      }
    },
    [accessToken, replaceHabit],
  );

  const adjustHistory = useCallback(
    async (id: string, payload: AdjustCheckinPayload) => {
      const updated = await habitsService.adjust(requireToken(accessToken), id, payload);
      replaceHabit(updated);
      // Keep the local check-in index in sync with the manual adjustment.
      setCheckinsByHabit((prev) => {
        const next = { ...prev };
        const set = new Set(next[id] ?? []);
        if (payload.done) set.add(payload.date);
        else set.delete(payload.date);
        next[id] = set;
        return next;
      });
      return updated;
    },
    [accessToken, replaceHabit],
  );

  const value = useMemo<HabitsContextValue>(
    () => ({
      habits,
      loading,
      refreshing,
      error,
      checkinsByHabit,
      refresh,
      createHabit,
      updateHabit,
      archiveHabit,
      unarchiveHabit,
      removeHabit,
      toggleCheckin,
      adjustHistory,
    }),
    [
      habits,
      loading,
      refreshing,
      error,
      checkinsByHabit,
      refresh,
      createHabit,
      updateHabit,
      archiveHabit,
      unarchiveHabit,
      removeHabit,
      toggleCheckin,
      adjustHistory,
    ],
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
};

export const useHabits = (): HabitsContextValue => {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within a HabitsProvider');
  return ctx;
};
