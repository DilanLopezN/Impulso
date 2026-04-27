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
import { todayLocal, toIsoDate } from '@/data/calendar';
import {
  gamificationService,
  type AchievementView,
  type ProfileSummary,
  type XpLedgerEntry,
} from '@/services/gamification.service';

type GamificationContextValue = {
  summary: ProfileSummary | null;
  achievements: AchievementView[];
  ledger: XpLedgerEntry[];
  /** XP credited today (positive minus reverts) for quick "today's XP" stats. */
  xpToday: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const GamificationContext = createContext<GamificationContextValue | undefined>(
  undefined,
);

const humanize = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return 'Erro desconhecido';
};

const computeXpToday = (ledger: XpLedgerEntry[]): number => {
  // `occurredAt` is a UTC ISO timestamp. Convert to the user's local calendar
  // day before comparing — otherwise users east/west of UTC see the wrong
  // "today's XP" near midnight.
  const today = todayLocal();
  let total = 0;
  for (const e of ledger) {
    if (toIsoDate(new Date(e.occurredAt)) === today) total += e.amount;
  }
  return total;
};

export const GamificationProvider = ({ children }: { children: ReactNode }) => {
  const { tokens, status } = useAuth();
  const accessToken = tokens?.accessToken ?? null;

  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [achievements, setAchievements] = useState<AchievementView[]>([]);
  const [ledger, setLedger] = useState<XpLedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setSummary(null);
      setAchievements([]);
      setLedger([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [s, a, l] = await Promise.all([
        gamificationService.summary(accessToken),
        gamificationService.achievements(accessToken),
        gamificationService.ledger(accessToken, { limit: 50 }),
      ]);
      setSummary(s);
      setAchievements(a);
      setLedger(l.items);
    } catch (err) {
      setError(humanize(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === 'authenticated' && accessToken) {
      void refresh();
    } else {
      setSummary(null);
      setAchievements([]);
      setLedger([]);
    }
  }, [status, accessToken, refresh]);

  const xpToday = useMemo(() => computeXpToday(ledger), [ledger]);

  const value = useMemo<GamificationContextValue>(
    () => ({
      summary,
      achievements,
      ledger,
      xpToday,
      loading,
      error,
      refresh,
    }),
    [summary, achievements, ledger, xpToday, loading, error, refresh],
  );

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = (): GamificationContextValue => {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return ctx;
};
