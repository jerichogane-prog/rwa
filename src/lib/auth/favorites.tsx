'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthProvider';

const STORAGE_KEY = 'rwa-favorites-cache';

interface FavoritesAPI {
  ids: Set<number>;
  isFavorite(id: number): boolean;
  toggle(id: number): Promise<boolean>;
  loading: boolean;
  error: string | null;
}

function readCache(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function writeCache(ids: number[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

const FavoritesContext = createContext<FavoritesAPI | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, authedFetch } = useAuth();
  const [ids, setIds] = useState<Set<number>>(() => new Set(readCache()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single fetch per user change — shared by every consumer.
  useEffect(() => {
    if (!user) {
      setIds(new Set());
      writeCache([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    authedFetch<{ id: number }[]>('/my/favorites')
      .then((items) => {
        if (cancelled) return;
        const next = new Set(items.map((it) => it.id));
        setIds(next);
        writeCache(Array.from(next));
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, authedFetch]);

  const toggle = useCallback(
    async (id: number): Promise<boolean> => {
      if (!user) {
        setError('Log in to save favorites.');
        return false;
      }
      const wasFav = ids.has(id);
      const next = new Set(ids);
      if (wasFav) next.delete(id);
      else next.add(id);
      setIds(next);
      writeCache(Array.from(next));
      try {
        await authedFetch(`/my/favorites/${id}`, { method: wasFav ? 'DELETE' : 'POST' });
        return !wasFav;
      } catch (err) {
        const reverted = new Set(ids);
        setIds(reverted);
        writeCache(Array.from(reverted));
        setError(err instanceof Error ? err.message : 'Could not update favorite.');
        return wasFav;
      }
    },
    [ids, user, authedFetch],
  );

  const value = useMemo<FavoritesAPI>(
    () => ({
      ids,
      isFavorite: (id: number) => ids.has(id),
      toggle,
      loading,
      error,
    }),
    [ids, toggle, loading, error],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesAPI {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within <FavoritesProvider>.');
  }
  return ctx;
}
