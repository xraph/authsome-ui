/**
 * Client-server auth state synchronization hook
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { Session } from '@authsome/ui-core';
import type { AuthSyncOptions } from '../types';
import { DEFAULT_POLL_INTERVAL } from '../lib/constants';

// Dynamic import to avoid bundling server code
const getSessionAction = async () => {
  // Call the server action dynamically
  const { getSessionAction: action } = await import('../server/actions');
  return action();
};

/**
 * Hook to sync auth state between server and client
 * Polls server for session updates and updates React Context
 * 
 * @param options - Auth sync options
 * 
 * @example
 * ```tsx
 * 'use client';
 * 
 * function MyComponent() {
 *   useAuthSync({
 *     pollInterval: 60000, // Poll every minute
 *     onSessionChange: (session) => {
 *       console.log('Session changed:', session);
 *     },
 *   });
 * 
 *   return <div>...</div>;
 * }
 * ```
 */
export function useAuthSync(options: AuthSyncOptions = {}) {
  const {
    pollInterval = DEFAULT_POLL_INTERVAL,
    enablePolling = true,
    onSessionChange,
    onSessionExpire,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSessionRef = useRef<Session | null>(null);

  /**
   * Check session on server
   */
  const checkSession = useCallback(async () => {
    try {
      const result = await getSessionAction();

      if (result.success && result.data) {
        const { session } = result.data as any;

        // Check if session changed
        if (
          !lastSessionRef.current ||
          lastSessionRef.current.token !== session?.token
        ) {
          lastSessionRef.current = session;

          // Call onChange callback
          if (onSessionChange) {
            onSessionChange(session);
          }

          // Update auth context if needed
          // Note: The @authsome/ui-react context should handle this internally
        }
      } else {
        // Session not found or expired
        if (lastSessionRef.current) {
          lastSessionRef.current = null;

          if (onSessionExpire) {
            onSessionExpire();
          }

          // Could trigger re-authentication here
        }
      }
    } catch (error) {
      console.error('Session sync error:', error);
    }
  }, [onSessionChange, onSessionExpire]);

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (!enablePolling) {
      return;
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Check immediately
    checkSession();

    // Set up interval
    intervalRef.current = setInterval(() => {
      checkSession();
    }, pollInterval);
  }, [enablePolling, pollInterval, checkSession]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    startPolling();

    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  /**
   * Handle visibility change (pause when tab hidden)
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startPolling, stopPolling]);

  return {
    checkSession,
    startPolling,
    stopPolling,
  };
}

/**
 * Hook to manually trigger session refresh
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { refreshSession, isRefreshing } = useSessionRefresh();
 * 
 *   return (
 *     <button onClick={refreshSession} disabled={isRefreshing}>
 *       Refresh Session
 *     </button>
 *   );
 * }
 * ```
 */
export function useSessionRefresh() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const refreshSession = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await getSessionAction();
      return result.success;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return {
    refreshSession,
    isRefreshing,
  };
}

// React import for useState
import * as React from 'react';

