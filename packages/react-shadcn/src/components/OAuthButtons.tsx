/**
 * Styled OAuthButtons using shadcn/ui
 */

import React from 'react';
import { OAuthButtons as HeadlessOAuthButtons } from '@authsome/ui-react-headless';
import { OAuthProvider } from '@authsome/ui-core';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from '../lib/utils';

export interface OAuthButtonsProps {
  redirectUri?: string;
  onError?: (error: Error) => void;
  className?: string;
  variant?: 'default' | 'outline';
  showSeparator?: boolean;
  separatorText?: string;
}

const providerIcons: Record<OAuthProvider, string> = {
  [OAuthProvider.GOOGLE]: '🔍',
  [OAuthProvider.GITHUB]: '⚡',
  [OAuthProvider.FACEBOOK]: '📘',
  [OAuthProvider.TWITTER]: '🐦',
  [OAuthProvider.MICROSOFT]: '🪟',
  [OAuthProvider.APPLE]: '🍎',
  [OAuthProvider.LINKEDIN]: '💼',
  [OAuthProvider.DISCORD]: '💬',
};

const providerLabels: Record<OAuthProvider, string> = {
  [OAuthProvider.GOOGLE]: 'Google',
  [OAuthProvider.GITHUB]: 'GitHub',
  [OAuthProvider.FACEBOOK]: 'Facebook',
  [OAuthProvider.TWITTER]: 'Twitter',
  [OAuthProvider.MICROSOFT]: 'Microsoft',
  [OAuthProvider.APPLE]: 'Apple',
  [OAuthProvider.LINKEDIN]: 'LinkedIn',
  [OAuthProvider.DISCORD]: 'Discord',
};

export function OAuthButtons({
  redirectUri,
  onError,
  className,
  variant = 'outline',
  showSeparator = true,
  separatorText = 'Or continue with',
}: OAuthButtonsProps) {
  return (
    <HeadlessOAuthButtons redirectUri={redirectUri} onError={onError}>
      {({ providers, signIn, isLoading }) => (
        <div className={cn('space-y-4', className)}>
          {showSeparator && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">{separatorText}</span>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            {providers.map((provider) => (
              <Button
                key={provider}
                type="button"
                variant={variant}
                onClick={() => signIn(provider)}
                disabled={isLoading}
                className="w-full"
              >
                <span className="mr-2">{providerIcons[provider]}</span>
                Continue with {providerLabels[provider]}
              </Button>
            ))}
          </div>
        </div>
      )}
    </HeadlessOAuthButtons>
  );
}

