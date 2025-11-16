/**
 * TwoFactorForm - Headless 2FA form component
 */

import React, { useState } from 'react';
import { use2FA } from '@authsome/ui-react';
import type { TwoFactorMethod } from '@authsome/ui-core';
import { validate2FACode } from '@authsome/ui-core';

export interface TwoFactorFormProps {
  method?: TwoFactorMethod;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  children: (props: TwoFactorFormRenderProps) => React.ReactNode;
}

export interface TwoFactorFormRenderProps {
  code: string;
  remember: boolean;
  isLoading: boolean;
  error: Error | null;
  validationErrors: Record<string, string>;
  setCode: (code: string) => void;
  setRemember: (remember: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
}

/**
 * Headless 2FA verification form component
 */
export function TwoFactorForm({ method, onSuccess, onError, children }: TwoFactorFormProps) {
  const { verify, isLoading, error, clearError } = use2FA();
  const [code, setCode] = useState('');
  const [remember, setRemember] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate
    const codeError = validate2FACode(code);
    if (codeError) {
      setValidationErrors({ code: codeError.message });
      return;
    }

    try {
      await verify(code, method, remember);
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <>
      {children({
        code,
        remember,
        isLoading,
        error,
        validationErrors,
        setCode,
        setRemember,
        handleSubmit,
        clearError,
      })}
    </>
  );
}

