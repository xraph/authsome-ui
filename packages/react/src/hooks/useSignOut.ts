/**
 * useSignOut hook
 * 
 * Hook for signing out users
 */

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { AuthError } from '@authsome/ui-core';

export interface UseSignOutResult {
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: AuthError | null;
}

/**
 * Hook for signing out
 */
export function useSignOut(): UseSignOutResult {
  const { client } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await client.signOut();
    } catch (err) {
      const authError = client.getError();
      setError(authError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  return {
    signOut,
    isLoading,
    error,
  };
}

