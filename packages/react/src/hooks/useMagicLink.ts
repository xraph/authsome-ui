/**
 * useMagicLink hook
 * 
 * Hook for magic link (passwordless) authentication
 */

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import type {
  MagicLinkRequest,
  MagicLinkVerifyRequest,
  AuthError,
} from '@authsome/ui-core';

export interface UseMagicLinkResult {
  sendMagicLink: (email: string, redirectUri?: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  isLoading: boolean;
  isSent: boolean;
  error: AuthError | null;
  clearError: () => void;
}

/**
 * Hook for magic link authentication
 */
export function useMagicLink(): UseMagicLinkResult {
  const { client } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const sendMagicLink = useCallback(
    async (email: string, redirectUri?: string) => {
      setIsLoading(true);
      setError(null);
      setIsSent(false);

      try {
        const request: MagicLinkRequest = {
          email,
          redirectUri,
        };

        await client.sendMagicLink(request);
        setIsSent(true);
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

  const verifyMagicLink = useCallback(
    async (token: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const request: MagicLinkVerifyRequest = {
          token,
        };

        await client.verifyMagicLink(request);
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
    sendMagicLink,
    verifyMagicLink,
    isLoading,
    isSent,
    error,
    clearError,
  };
}

