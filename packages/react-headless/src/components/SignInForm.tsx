/**
 * SignInForm - Headless sign in form component
 */

import React, { useState } from 'react';
import { useSignIn } from '@authsome/ui-react';
import type { SignInRequest } from '@authsome/ui-core';
import { validateEmail } from '@authsome/ui-core';

export interface SignInFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  children: (props: SignInFormRenderProps) => React.ReactNode;
}

export interface SignInFormRenderProps {
  email: string;
  password: string;
  isLoading: boolean;
  error: Error | null;
  validationErrors: Record<string, string>;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
}

/**
 * Headless sign in form component using render props pattern
 */
export function SignInForm({ onSuccess, onError, children }: SignInFormProps) {
  const { signIn, isLoading, error, clearError } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate
    const errors: Record<string, string> = {};
    
    const emailError = validateEmail(email);
    if (emailError) {
      errors.email = emailError.message;
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const request: SignInRequest = {
        email,
        password,
      };

      await signIn(request);
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <>
      {children({
        email,
        password,
        isLoading,
        error,
        validationErrors,
        setEmail,
        setPassword,
        handleSubmit,
        clearError,
      })}
    </>
  );
}

