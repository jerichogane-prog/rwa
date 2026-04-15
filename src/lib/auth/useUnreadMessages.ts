'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

const POLL_MS = 60_000;

/**
 * Fetches the authenticated user's unread message count on mount and every
 * minute thereafter. Safe to call from multiple components — each instance
 * holds its own state but shares the underlying API.
 */
export function useUnreadMessages(): { count: number; refresh(): Promise<void> } {
  const { user, authedFetch } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setCount(0);
      return;
    }
    try {
      const res = await authedFetch<{ unread: number }>('/my/messages/unread-count');
      setCount(typeof res.unread === 'number' ? res.unread : 0);
    } catch {
      // Silent — the badge just won't tick this cycle.
    }
  }, [user, authedFetch]);

  useEffect(() => {
    void refresh();
    if (!user) return;
    const timer = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [refresh, user]);

  // React to tab focus — pick up new messages as soon as the user returns.
  useEffect(() => {
    if (!user) return;
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh, user]);

  return { count, refresh };
}
