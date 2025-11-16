/**
 * use2FA hook
 * 
 * Hook for two-factor authentication
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { TwoFactorMethod } from '@authsome/ui-core';
import type {
  TwoFactorSetupRequest,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  AuthError,
} from '@authsome/ui-core';

export interface Use2FAResult {
  enabledMethods: TwoFactorMethod[];
  setup: (method: TwoFactorMethod, contact?: string) => Promise<TwoFactorSetupResponse>;
  verify: (code: string, method?: TwoFactorMethod, remember?: boolean) => Promise<void>;
  disable: () => Promise<void>;
  refresh: () => Promise<void>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

/**
 * Hook for 2FA
 */
export function use2FA(): Use2FAResult {
  const { client, isAuthenticated } = useAuth();
  const [enabledMethods, setEnabledMethods] = useState<TwoFactorMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // Load 2FA status
  const refresh = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const methods = await client.getTwoFactorStatus();
        setEnabledMethods(methods);
      } catch (err) {
        // Silently fail - user might not have 2FA set up
      }
    }
  }, [client, isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setup = useCallback(
    async (method: TwoFactorMethod, contact?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const request: TwoFactorSetupRequest = {
          method,
          phone: method === TwoFactorMethod.SMS ? contact : undefined,
          email: method === TwoFactorMethod.EMAIL ? contact : undefined,
        };

        const response = await client.setupTwoFactor(request);
        await refresh();
        return response;
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

  const verify = useCallback(
    async (code: string, method?: TwoFactorMethod, remember?: boolean) => {
      setIsLoading(true);
      setError(null);

      try {
        const request: TwoFactorVerifyRequest = {
          code,
          method,
          remember,
        };

        await client.verifyTwoFactor(request);
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

  const disable = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await client.disableTwoFactor();
      await refresh();
    } catch (err) {
      const authError = client.getError();
      setError(authError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client, refresh]);

  const clearError = useCallback(() => {
    setError(null);
    client.clearError();
  }, [client]);

  return {
    enabledMethods,
    setup,
    verify,
    disable,
    refresh,
    isLoading,
    error,
    clearError,
  };
}

