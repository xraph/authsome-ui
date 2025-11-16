/**
 * TwoFactorSetup - Headless 2FA setup component
 */

import React, { useState } from 'react';
import { use2FA } from '@authsome/ui-react';
import type { TwoFactorMethod, TwoFactorSetupResponse } from '@authsome/ui-core';

export interface TwoFactorSetupProps {
  method: TwoFactorMethod;
  onSuccess?: (response: TwoFactorSetupResponse) => void;
  onError?: (error: Error) => void;
  children: (props: TwoFactorSetupRenderProps) => React.ReactNode;
}

export interface TwoFactorSetupRenderProps {
  method: TwoFactorMethod;
  contact: string;
  isLoading: boolean;
  error: Error | null;
  setupResponse: TwoFactorSetupResponse | null;
  setContact: (contact: string) => void;
  handleSetup: () => Promise<void>;
  clearError: () => void;
}

/**
 * Headless 2FA setup component
 */
export function TwoFactorSetup({ method, onSuccess, onError, children }: TwoFactorSetupProps) {
  const { setup, isLoading, error, clearError } = use2FA();
  const [contact, setContact] = useState('');
  const [setupResponse, setSetupResponse] = useState<TwoFactorSetupResponse | null>(null);

  const handleSetup = async () => {
    try {
      const response = await setup(method, contact || undefined);
      setSetupResponse(response);
      onSuccess?.(response);
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <>
      {children({
        method,
        contact,
        isLoading,
        error,
        setupResponse,
        setContact,
        handleSetup,
        clearError,
      })}
    </>
  );
}

