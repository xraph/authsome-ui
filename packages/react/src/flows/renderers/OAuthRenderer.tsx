/**
 * OAuth authentication renderer
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { FlowState, OAuthProvider } from '@authsome/ui-core';

export interface OAuthRendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
  providers?: OAuthProvider[];
}

export function OAuthRenderer({
  state,
  onNext,
  onBack,
  isLoading,
  uiComponents,
  providers = ['google', 'github', 'facebook', 'microsoft'] as OAuthProvider[],
}: OAuthRendererProps) {
  const { oauthSignIn } = useAuth();
  const { Button, Divider, Alert } = uiComponents;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOAuth = async (provider: OAuthProvider) => {
    setError(null);
    setLoading(true);

    try {
      const result = await oauthSignIn({
        provider,
        redirectUri: window.location.origin + '/auth/callback',
      });
      
      // Redirect to OAuth provider
      if (result.url) {
        window.location.href = result.url;
      } else {
        await onNext({ oauthProvider: provider });
      }
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  const providerConfig: Record<string, { name: string; icon: string; color: string }> = {
    google: { name: 'Google', icon: '🌐', color: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' },
    github: { name: 'GitHub', icon: '🐙', color: 'bg-gray-900 text-white hover:bg-gray-800' },
    facebook: { name: 'Facebook', icon: '👤', color: 'bg-blue-600 text-white hover:bg-blue-700' },
    microsoft: { name: 'Microsoft', icon: '🪟', color: 'bg-blue-500 text-white hover:bg-blue-600' },
    apple: { name: 'Apple', icon: '🍎', color: 'bg-black text-white hover:bg-gray-900' },
    twitter: { name: 'Twitter', icon: '🐦', color: 'bg-sky-500 text-white hover:bg-sky-600' },
    linkedin: { name: 'LinkedIn', icon: '💼', color: 'bg-blue-700 text-white hover:bg-blue-800' },
    discord: { name: 'Discord', icon: '💬', color: 'bg-indigo-600 text-white hover:bg-indigo-700' },
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Choose Your Provider</h2>
        <p className="text-sm text-gray-600 mt-1">
          Sign in with your preferred account
        </p>
      </div>

      {error && Alert && (
        <Alert variant="error">{error}</Alert>
      )}

      <div className="space-y-3">
        {providers.map((provider) => {
          const config = providerConfig[provider];
          return (
            <Button
              key={provider}
              onClick={() => handleOAuth(provider)}
              variant="outline"
              disabled={loading || isLoading}
              loading={loading && state.oauthProvider === provider}
              className={`w-full ${config?.color || ''}`}
            >
              <span className="mr-2">{config?.icon || '🔐'}</span>
              Continue with {config?.name || provider}
            </Button>
          );
        })}
      </div>

      {onBack && (
        <>
          {Divider && <Divider label="or" />}
          <Button
            onClick={onBack}
            variant="ghost"
            disabled={loading || isLoading}
            className="w-full"
          >
            Back to other options
          </Button>
        </>
      )}
    </div>
  );
}

export function OAuthCallbackRenderer({
  state,
  uiComponents,
}: {
  state: FlowState;
  uiComponents: UIComponents;
}) {
  const { icons } = uiComponents;
  const LoadingIcon = icons?.loading;

  return (
    <div className="space-y-6 text-center py-12">
      {LoadingIcon ? (
        <LoadingIcon className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
      ) : (
        <div className="mx-auto h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      )}
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Connecting...</h2>
        <p className="text-gray-600 mt-2">
          Please wait while we complete the authentication with {state.oauthProvider}
        </p>
      </div>
    </div>
  );
}

