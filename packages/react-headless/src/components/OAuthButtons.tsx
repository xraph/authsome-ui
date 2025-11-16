/**
 * OAuthButtons - Headless OAuth provider buttons
 */

import React from 'react';
import { useOAuth } from '@authsome/ui-react';
import type { OAuthProvider } from '@authsome/ui-core';

export interface OAuthButtonsProps {
  redirectUri?: string;
  onError?: (error: Error) => void;
  children: (props: OAuthButtonsRenderProps) => React.ReactNode;
}

export interface OAuthButtonsRenderProps {
  providers: OAuthProvider[];
  isLoading: boolean;
  error: Error | null;
  signIn: (provider: OAuthProvider) => Promise<void>;
  clearError: () => void;
}

/**
 * Headless OAuth buttons component
 */
export function OAuthButtons({ redirectUri, onError, children }: OAuthButtonsProps) {
  const { providers, signIn, isLoading, error, clearError } = useOAuth();

  const handleSignIn = async (provider: OAuthProvider) => {
    try {
      await signIn(provider, redirectUri);
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <>
      {children({
        providers,
        isLoading,
        error,
        signIn: handleSignIn,
        clearError,
      })}
    </>
  );
}

