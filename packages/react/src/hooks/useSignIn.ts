/**
 * useSignIn hook
 * 
 * Hook for signing in users
 */

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { SignInRequest, AuthError } from '@authsome/ui-core';

export interface UseSignInResult {
  signIn: (request: SignInRequest) => Promise<void>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

/**
 * Hook for signing in
 */
export function useSignIn(): UseSignInResult {
  const { client } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const signIn = useCallback(
    async (request: SignInRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        await client.signIn(request);
      } catch (err) {
        const authError = client.getError();
        setError(authError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const clearError = useCallback(() => {
    setError(null);
    client.clearError();
  }, [client]);

  return {
    signIn,
    isLoading,
    error,
    clearError,
  };
}

