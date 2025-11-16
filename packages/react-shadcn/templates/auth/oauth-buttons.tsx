'use client';

import { useOAuth } from '@authsome/ui-react';
import { Button } from '@/components/ui/button';
import type { OAuthProvider } from '@authsome/ui-core';

interface OAuthButtonsProps {
  providers?: OAuthProvider[];
  redirectUri?: string;
  onError?: (error: Error) => void;
  className?: string;
}

const defaultProviders: OAuthProvider[] = ['google', 'github', 'microsoft'];

const providerLabels: Record<OAuthProvider, string> = {
  google: 'Google',
  github: 'GitHub',
  microsoft: 'Microsoft',
  facebook: 'Facebook',
  apple: 'Apple',
  twitter: 'Twitter',
  discord: 'Discord',
  slack: 'Slack',
};

export function OAuthButtons({
  providers = defaultProviders,
  redirectUri,
  onError,
  className,
}: OAuthButtonsProps) {
  const { initiateOAuth, loading } = useOAuth();

  const handleOAuthClick = async (provider: OAuthProvider) => {
    try {
      await initiateOAuth(provider, { redirectUri });
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {providers.map((provider) => (
        <Button
          key={provider}
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthClick(provider)}
          disabled={loading}
          type="button"
        >
          <span className="flex items-center justify-center gap-2">
            {/* Add provider icon here if desired */}
            Continue with {providerLabels[provider]}
          </span>
        </Button>
      ))}
    </div>
  );
}

