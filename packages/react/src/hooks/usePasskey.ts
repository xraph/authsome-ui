/**
 * usePasskey hook
 * 
 * Hook for WebAuthn/Passkey authentication
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import type {
  PasskeyCredential,
  PasskeyRegisterRequest,
  PasskeyAuthRequest,
  AuthError,
} from '@authsome/ui-core';

export interface UsePasskeyResult {
  passkeys: PasskeyCredential[];
  register: (name?: string) => Promise<PasskeyCredential>;
  authenticate: (credentialId?: string) => Promise<void>;
  remove: (credentialId: string) => Promise<void>;
  refresh: () => Promise<void>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

/**
 * Hook for Passkey authentication
 */
export function usePasskey(): UsePasskeyResult {
  const { client, isAuthenticated } = useAuth();
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // Load passkeys
  const refresh = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const keys = await client.listPasskeys();
        setPasskeys(keys);
      } catch (err) {
        // Silently fail
      }
    }
  }, [client, isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const register = useCallback(
    async (name?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const request: PasskeyRegisterRequest = {
          name,
        };

        const credential = await client.registerPasskey(request);
        await refresh();
        return credential;
      } catch (err) {
        const authError = client.getError();
        setError(authError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client, refresh]
  );

  const authenticate = useCallback(
    async (credentialId?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const request: PasskeyAuthRequest = {
          credentialId,
        };

        await client.authenticatePasskey(request);
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

  const remove = useCallback(
    async (credentialId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await client.deletePasskey(credentialId);
        await refresh();
      } catch (err) {
        const authError = client.getError();
        setError(authError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client, refresh]
  );

  const clearError = useCallback(() => {
    setError(null);
    client.clearError();
  }, [client]);

  return {
    passkeys,
    register,
    authenticate,
    remove,
    refresh,
    isLoading,
    error,
    clearError,
  };
}

