/**
 * MagicLinkForm - Headless magic link form component
 */

import React, { useState } from 'react';
import { useMagicLink } from '@authsome/ui-react';
import { validateEmail } from '@authsome/ui-core';

export interface MagicLinkFormProps {
  redirectUri?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  children: (props: MagicLinkFormRenderProps) => React.ReactNode;
}

export interface MagicLinkFormRenderProps {
  email: string;
  isLoading: boolean;
  isSent: boolean;
  error: Error | null;
  validationErrors: Record<string, string>;
  setEmail: (email: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
}

/**
 * Headless magic link form component
 */
export function MagicLinkForm({
  redirectUri,
  onSuccess,
  onError,
  children,
}: MagicLinkFormProps) {
  const { sendMagicLink, isLoading, isSent, error, clearError } = useMagicLink();
  const [email, setEmail] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate
    const emailError = validateEmail(email);
    if (emailError) {
      setValidationErrors({ email: emailError.message });
      return;
    }

    try {
      await sendMagicLink(email, redirectUri);
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <>
      {children({
        email,
        isLoading,
        isSent,
        error,
        validationErrors,
        setEmail,
        handleSubmit,
        clearError,
      })}
    </>
  );
}

