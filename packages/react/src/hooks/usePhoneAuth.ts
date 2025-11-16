/**
 * usePhoneAuth hook
 * 
 * Hook for phone number authentication
 */

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { PhoneAuthRequest, PhoneVerifyRequest, AuthError } from '@authsome/ui-core';

export interface UsePhoneAuthResult {
  sendCode: (phone: string) => Promise<void>;
  verifyCode: (phone: string, code: string) => Promise<void>;
  isLoading: boolean;
  isCodeSent: boolean;
  error: AuthError | null;
  clearError: () => void;
}

/**
 * Hook for phone authentication
 */
export function usePhoneAuth(): UsePhoneAuthResult {
  const { client } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const sendCode = useCallback(
    async (phone: string) => {
      setIsLoading(true);
      setError(null);
      setIsCodeSent(false);

      try {
        const request: PhoneAuthRequest = {
          phone,
        };

        await client.sendPhoneCode(request);
        setIsCodeSent(true);
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

  const verifyCode = useCallback(
    async (phone: string, code: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const request: PhoneVerifyRequest = {
          phone,
          code,
        };

        await client.verifyPhoneCode(request);
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
    sendCode,
    verifyCode,
    isLoading,
    isCodeSent,
    error,
    clearError,
  };
}

