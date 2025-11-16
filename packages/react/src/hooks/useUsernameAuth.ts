/**
 * useUsernameAuth hook
 * 
 * Hook for username-based authentication
 */

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { SignInRequest, SignUpRequest, AuthError } from '@authsome/ui-core';

export interface UseUsernameAuthResult {
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, email?: string) => Promise<void>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

/**
 * Hook for username authentication
 */
export function useUsernameAuth(): UseUsernameAuthResult {
  const { client } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const signIn = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const request: SignInRequest = {
          username,
          password,
        };

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

  const signUp = useCallback(
    async (username: string, password: string, email?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const request: SignUpRequest = {
          username,
          password,
          email,
        };

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
    signIn,
    signUp,
    isLoading,
    error,
    clearError,
  };
}

