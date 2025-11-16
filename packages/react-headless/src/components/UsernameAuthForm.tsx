/**
 * UsernameAuthForm - Headless username authentication form
 */

import React, { useState } from 'react';
import { useUsernameAuth } from '@authsome/ui-react';
import { validateUsername, validatePassword } from '@authsome/ui-core';

export interface UsernameAuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  children: (props: UsernameAuthFormRenderProps) => React.ReactNode;
}

export interface UsernameAuthFormRenderProps {
  username: string;
  password: string;
  email: string;
  isLoading: boolean;
  error: Error | null;
  validationErrors: Record<string, string>;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setEmail: (email: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
}

/**
 * Headless username authentication form component
 */
export function UsernameAuthForm({ mode, onSuccess, onError, children }: UsernameAuthFormProps) {
  const { signIn, signUp, isLoading, error, clearError } = useUsernameAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate
    const errors: Record<string, string> = {};
    
    const usernameError = validateUsername(username);
    if (usernameError) {
      errors.username = usernameError.message;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      errors.password = passwordError.message;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      if (mode === 'signin') {
        await signIn(username, password);
      } else {
        await signUp(username, password, email || undefined);
      }
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <>
      {children({
        username,
        password,
        email,
        isLoading,
        error,
        validationErrors,
        setUsername,
        setPassword,
        setEmail,
        handleSubmit,
        clearError,
      })}
    </>
  );
}

