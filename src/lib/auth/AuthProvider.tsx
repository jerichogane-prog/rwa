'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { AuthTokens, AuthUser, LoginCredentials, RegisterPayload } from './types';

const STORAGE_KEY = 'rwa-auth';
const API_BASE = `${process.env.NEXT_PUBLIC_WP_REST}/rwa/v1`;

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login(credentials: LoginCredentials): Promise<void>;
  register(payload: RegisterPayload): Promise<void>;
  logout(): Promise<void>;
  authedFetch<T>(path: string, init?: RequestInit): Promise<T>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface StoredAuth {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

function readStorage(): StoredAuth | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

function writeStorage(auth: StoredAuth | null) {
  if (typeof window === 'undefined') return;
  if (auth) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function toStored(tokens: AuthTokens): StoredAuth {
  return {
    user: tokens.user,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + tokens.expires_in * 1000 - 30_000,
  };
}

async function parseOrThrow(res: Response): Promise<unknown> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (body as { message?: string }).message ||
      (body as { code?: string }).code ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredAuth | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshPromise = useRef<Promise<StoredAuth | null> | null>(null);

  useEffect(() => {
    const stored = readStorage();
    setState(stored);
    setLoading(false);
  }, []);

  const persist = useCallback((next: StoredAuth | null) => {
    setState(next);
    writeStorage(next);
  }, []);

  const refresh = useCallback(async (): Promise<StoredAuth | null> => {
    if (refreshPromise.current) return refreshPromise.current;
    const current = readStorage();
    if (!current) return null;
    refreshPromise.current = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: current.refresh_token }),
        });
        if (!res.ok) {
          persist(null);
          return null;
        }
        const tokens = (await res.json()) as AuthTokens;
        const stored = toStored(tokens);
        persist(stored);
        return stored;
      } catch {
        persist(null);
        return null;
      } finally {
        refreshPromise.current = null;
      }
    })();
    return refreshPromise.current;
  }, [persist]);

  const login = useCallback(
    async ({ username, password }: LoginCredentials) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const tokens = (await parseOrThrow(res)) as AuthTokens;
      persist(toStored(tokens));
    },
    [persist],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const tokens = (await parseOrThrow(res)) as AuthTokens;
      persist(toStored(tokens));
    },
    [persist],
  );

  const logout = useCallback(async () => {
    const current = readStorage();
    persist(null);
    if (!current) return;
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${current.access_token}` },
      });
    } catch {
      // best-effort; local state is already cleared
    }
  }, [persist]);

  const authedFetch = useCallback(
    async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
      let current = readStorage();
      if (current && current.expires_at < Date.now()) {
        current = await refresh();
      }
      if (!current) throw new Error('Not authenticated');

      const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
      const baseHeaders: Record<string, string> = isFormData
        ? {}
        : { 'Content-Type': 'application/json' };

      const doRequest = async (token: string) =>
        fetch(`${API_BASE}${path}`, {
          ...init,
          headers: {
            ...baseHeaders,
            ...(init.headers || {}),
            Authorization: `Bearer ${token}`,
          },
        });

      let res = await doRequest(current.access_token);
      if (res.status === 401) {
        const refreshed = await refresh();
        if (!refreshed) throw new Error('Session expired');
        res = await doRequest(refreshed.access_token);
      }
      return (await parseOrThrow(res)) as T;
    },
    [refresh],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state?.user ?? null,
      loading,
      login,
      register,
      logout,
      authedFetch,
    }),
    [state, loading, login, register, logout, authedFetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
