/**
 * useSignUp hook
 * 
 * Hook for signing up new users
 */

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { SignUpRequest, AuthError } from '@authsome/ui-core';

export interface UseSignUpResult {
  signUp: (request: SignUpRequest) => Promise<void>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

/**
 * Hook for signing up
 */
export function useSignUp(): UseSignUpResult {
  const { client } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const signUp = useCallback(
    async (request: SignUpRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        await client.signUp(request);
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
    signUp,
    isLoading,
    error,
    clearError,
  };
}

