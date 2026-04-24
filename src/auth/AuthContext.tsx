import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  authService,
  type AuthResult,
  type AuthTokens,
  type LoginPayload,
  type PublicUser,
  type SignupPayload,
} from '@/services/auth.service';

export type AuthStatus = 'unauthenticated' | 'authenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: PublicUser | null;
  tokens: AuthTokens | null;
  isFirstSession: boolean;
  login: (payload: LoginPayload) => Promise<AuthResult>;
  signup: (payload: SignupPayload) => Promise<AuthResult>;
  logout: () => Promise<void>;
  completeWelcome: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isFirstSession, setIsFirstSession] = useState(false);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authService.login(payload);
    setUser(result.user);
    setTokens(result.tokens);
    setIsFirstSession(false);
    return result;
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    const result = await authService.signup(payload);
    setUser(result.user);
    setTokens(result.tokens);
    setIsFirstSession(true);
    return result;
  }, []);

  const logout = useCallback(async () => {
    const refresh = tokens?.refreshToken;
    setUser(null);
    setTokens(null);
    setIsFirstSession(false);
    if (refresh) {
      try {
        await authService.logout(refresh);
      } catch {
        // best-effort: ignore errors from server-side logout
      }
    }
  }, [tokens]);

  const completeWelcome = useCallback(() => {
    setIsFirstSession(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: user && tokens ? 'authenticated' : 'unauthenticated',
      user,
      tokens,
      isFirstSession,
      login,
      signup,
      logout,
      completeWelcome,
    }),
    [user, tokens, isFirstSession, login, signup, logout, completeWelcome],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
