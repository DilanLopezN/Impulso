import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { accountService, type UserDataExport } from '@/services/account.service';
import {
  authService,
  type AuthResult,
  type AuthTokens,
  type LoginPayload,
  type PublicUser,
  type SignupPayload,
} from '@/services/auth.service';
import { passwordService } from '@/services/password.service';
import { sessionsService, type SessionView } from '@/services/sessions.service';

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
  // Password recovery
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  // Session management
  listSessions: () => Promise<SessionView[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeOtherSessions: () => Promise<number>;
  // LGPD
  exportMyData: () => Promise<UserDataExport>;
  deleteMyAccount: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const requireAccess = (tokens: AuthTokens | null): string => {
  if (!tokens?.accessToken) {
    throw new Error('Operação requer usuário autenticado.');
  }
  return tokens.accessToken;
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

  const clearLocal = useCallback(() => {
    setUser(null);
    setTokens(null);
    setIsFirstSession(false);
  }, []);

  const logout = useCallback(async () => {
    const refresh = tokens?.refreshToken;
    clearLocal();
    if (refresh) {
      try {
        await authService.logout(refresh);
      } catch {
        // best-effort: ignore errors from server-side logout
      }
    }
  }, [tokens, clearLocal]);

  const completeWelcome = useCallback(() => {
    setIsFirstSession(false);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await passwordService.forgot(email);
  }, []);

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      await passwordService.reset(token, newPassword);
    },
    [],
  );

  const listSessions = useCallback(
    () => sessionsService.list(requireAccess(tokens)),
    [tokens],
  );

  const revokeSession = useCallback(
    (sessionId: string) =>
      sessionsService.revokeOne(requireAccess(tokens), sessionId),
    [tokens],
  );

  const revokeOtherSessions = useCallback(async () => {
    const result = await sessionsService.revokeOthers(requireAccess(tokens));
    return result.revoked;
  }, [tokens]);

  const exportMyData = useCallback(
    () => accountService.exportData(requireAccess(tokens)),
    [tokens],
  );

  const deleteMyAccount = useCallback(
    async (password: string) => {
      const access = requireAccess(tokens);
      await accountService.deleteAccount(access, password);
      // Server already revoked everything; clear local state too.
      clearLocal();
    },
    [tokens, clearLocal],
  );

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
      requestPasswordReset,
      resetPassword,
      listSessions,
      revokeSession,
      revokeOtherSessions,
      exportMyData,
      deleteMyAccount,
    }),
    [
      user,
      tokens,
      isFirstSession,
      login,
      signup,
      logout,
      completeWelcome,
      requestPasswordReset,
      resetPassword,
      listSessions,
      revokeSession,
      revokeOtherSessions,
      exportMyData,
      deleteMyAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
