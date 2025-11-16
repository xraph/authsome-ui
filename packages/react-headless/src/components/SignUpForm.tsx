/**
 * SignUpForm - Headless sign up form component
 */

import React, { useState } from 'react';
import { useSignUp } from '@authsome/ui-react';
import type { SignUpRequest } from '@authsome/ui-core';
import { validateEmail, validatePassword } from '@authsome/ui-core';

export interface SignUpFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  children: (props: SignUpFormRenderProps) => React.ReactNode;
}

export interface SignUpFormRenderProps {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  isLoading: boolean;
  error: Error | null;
  validationErrors: Record<string, string>;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  setName: (name: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
}

/**
 * Headless sign up form component using render props pattern
 */
export function SignUpForm({ onSuccess, onError, children }: SignUpFormProps) {
  const { signUp, isLoading, error, clearError } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
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

    const passwordError = validatePassword(password);
    if (passwordError) {
      errors.password = passwordError.message;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const request: SignUpRequest = {
        email,
        password,
        name: name || undefined,
      };

      await signUp(request);
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
        confirmPassword,
        name,
        isLoading,
        error,
        validationErrors,
        setEmail,
        setPassword,
        setConfirmPassword,
        setName,
        handleSubmit,
        clearError,
      })}
    </>
  );
}

