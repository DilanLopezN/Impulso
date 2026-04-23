import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ACCENT_PALETTES, type AccentId } from './colors';
import { buildTheme, type ThemeMode, type ThemeTokens } from './tokens';

type ThemeContextValue = {
  theme: ThemeTokens;
  mode: ThemeMode;
  accentId: AccentId;
  setMode: (mode: ThemeMode) => void;
  setAccent: (id: AccentId) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
  initialMode?: ThemeMode;
  initialAccent?: AccentId;
};

export const ThemeProvider = ({
  children,
  initialMode = 'dark',
  initialAccent = 180,
}: ThemeProviderProps) => {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [accentId, setAccent] = useState<AccentId>(initialAccent);

  const value = useMemo<ThemeContextValue>(() => {
    const accent = ACCENT_PALETTES[accentId] ?? ACCENT_PALETTES[180];
    return {
      theme: buildTheme(mode, accent),
      mode,
      accentId,
      setMode,
      setAccent,
    };
  }, [mode, accentId]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};
