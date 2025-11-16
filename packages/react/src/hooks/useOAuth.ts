/**
 * useOAuth hook
 * 
 * Hook for OAuth authentication
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import type {
  OAuthProvider,
  OAuthSignInRequest,
  OAuthCallbackRequest,
  AuthError,
} from '@authsome/ui-core';

export interface UseOAuthResult {
  providers: OAuthProvider[];
  signIn: (provider: OAuthProvider, redirectUri?: string) => Promise<void>;
  handleCallback: (code: string, state?: string, provider?: OAuthProvider) => Promise<void>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

/**
 * Hook for OAuth authentication
 */
export function useOAuth(): UseOAuthResult {
  const { client } = useAuth();
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // Load available OAuth providers
  useEffect(() => {
    client.getOAuthProviders().then(setProviders);
  }, [client]);

  const signIn = useCallback(
    async (provider: OAuthProvider, redirectUri?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const request: OAuthSignInRequest = {
          provider,
          redirectUri,
        };

        const url = await client.getOAuthUrl(request);
        // Redirect to OAuth provider
        window.location.href = url;
      } catch (err) {
        const authError = client.getError();
        setError(authError);
        setIsLoading(false);
        throw err;
      }
    },
    [client]
  );

  const handleCallback = useCallback(
    async (code: string, state?: string, provider?: OAuthProvider) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!provider) {
          throw new Error('Provider is required for OAuth callback');
        }

        const request: OAuthCallbackRequest = {
          provider,
          code,
          state,
        };

        await client.handleOAuthCallback(request);
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
    providers,
    signIn,
    handleCallback,
    isLoading,
    error,
    clearError,
  };
}

