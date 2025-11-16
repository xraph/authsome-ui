/**
 * PhoneAuthForm - Headless phone authentication form
 */

import React, { useState } from 'react';
import { usePhoneAuth } from '@authsome/ui-react';
import { validatePhone } from '@authsome/ui-core';

export interface PhoneAuthFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  children: (props: PhoneAuthFormRenderProps) => React.ReactNode;
}

export interface PhoneAuthFormRenderProps {
  phone: string;
  code: string;
  isLoading: boolean;
  isCodeSent: boolean;
  error: Error | null;
  validationErrors: Record<string, string>;
  setPhone: (phone: string) => void;
  setCode: (code: string) => void;
  handleSendCode: (e: React.FormEvent) => Promise<void>;
  handleVerifyCode: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
}

/**
 * Headless phone authentication form component
 */
export function PhoneAuthForm({ onSuccess, onError, children }: PhoneAuthFormProps) {
  const { sendCode, verifyCode, isLoading, isCodeSent, error, clearError } = usePhoneAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setValidationErrors({ phone: phoneError.message });
      return;
    }

    try {
      await sendCode(phone);
    } catch (err) {
      onError?.(err as Error);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!code) {
      setValidationErrors({ code: 'Verification code is required' });
      return;
    }

    try {
      await verifyCode(phone, code);
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <>
      {children({
        phone,
        code,
        isLoading,
        isCodeSent,
        error,
        validationErrors,
        setPhone,
        setCode,
        handleSendCode,
        handleVerifyCode,
        clearError,
      })}
    </>
  );
}

