/**
 * PasskeyPrompt - Headless passkey registration/authentication
 */

import React, { useState } from 'react';
import { usePasskey } from '@authsome/ui-react';
import type { PasskeyCredential } from '@authsome/ui-core';

export interface PasskeyPromptProps {
  mode: 'register' | 'authenticate';
  onSuccess?: (credential?: PasskeyCredential) => void;
  onError?: (error: Error) => void;
  children: (props: PasskeyPromptRenderProps) => React.ReactNode;
}

export interface PasskeyPromptRenderProps {
  mode: 'register' | 'authenticate';
  name: string;
  isLoading: boolean;
  error: Error | null;
  passkeys: PasskeyCredential[];
  setName: (name: string) => void;
  handleAction: () => Promise<void>;
  clearError: () => void;
}

/**
 * Headless passkey prompt component
 */
export function PasskeyPrompt({ mode, onSuccess, onError, children }: PasskeyPromptProps) {
  const { passkeys, register, authenticate, isLoading, error, clearError } = usePasskey();
  const [name, setName] = useState('');

  const handleAction = async () => {
    try {
      if (mode === 'register') {
        const credential = await register(name || undefined);
        onSuccess?.(credential);
      } else {
        await authenticate();
        onSuccess?.();
      }
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <>
      {children({
        mode,
        name,
        isLoading,
        error,
        passkeys,
        setName,
        handleAction,
        clearError,
      })}
    </>
  );
}

