/**
 * OAuth authentication renderer
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { RendererConfig } from '../renderer-config';
import type { FlowState, OAuthProvider } from '@authsome/ui-core';
import { defaultLocale, interpolate } from '@authsome/ui-core';

/**
 * OAuth provider display configuration
 */
export interface OAuthProviderConfig {
  name: string;
  icon: string;
  color: string;
}

/**
 * Complete OAuth provider configurations
 * Includes all major OAuth providers with their display settings
 */
export const OAUTH_PROVIDER_CONFIG: Record<string, OAuthProviderConfig> = {
  // Major providers
  google: {
    name: 'Google',
    icon: '🌐',
    color: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
  },
  github: {
    name: 'GitHub',
    icon: '🐙',
    color: 'bg-gray-900 text-white hover:bg-gray-800',
  },
  facebook: {
    name: 'Facebook',
    icon: '👤',
    color: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  microsoft: {
    name: 'Microsoft',
    icon: '🪟',
    color: 'bg-blue-500 text-white hover:bg-blue-600',
  },
  apple: {
    name: 'Apple',
    icon: '🍎',
    color: 'bg-black text-white hover:bg-gray-900',
  },
  
  // Social media
  twitter: {
    name: 'Twitter',
    icon: '🐦',
    color: 'bg-sky-500 text-white hover:bg-sky-600',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-blue-700 text-white hover:bg-blue-800',
  },
  discord: {
    name: 'Discord',
    icon: '💬',
    color: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  slack: {
    name: 'Slack',
    icon: '💬',
    color: 'bg-purple-600 text-white hover:bg-purple-700',
  },
  reddit: {
    name: 'Reddit',
    icon: '🤖',
    color: 'bg-orange-600 text-white hover:bg-orange-700',
  },
  
  // Developer platforms
  gitlab: {
    name: 'GitLab',
    icon: '🦊',
    color: 'bg-orange-500 text-white hover:bg-orange-600',
  },
  bitbucket: {
    name: 'Bitbucket',
    icon: '🪣',
    color: 'bg-blue-700 text-white hover:bg-blue-800',
  },
  
  // Productivity & collaboration
  notion: {
    name: 'Notion',
    icon: '📝',
    color: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
  },
  figma: {
    name: 'Figma',
    icon: '🎨',
    color: 'bg-purple-500 text-white hover:bg-purple-600',
  },
  dropbox: {
    name: 'Dropbox',
    icon: '📦',
    color: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  
  // Entertainment & media
  spotify: {
    name: 'Spotify',
    icon: '🎵',
    color: 'bg-green-600 text-white hover:bg-green-700',
  },
  twitch: {
    name: 'Twitch',
    icon: '📺',
    color: 'bg-purple-600 text-white hover:bg-purple-700',
  },
  youtube: {
    name: 'YouTube',
    icon: '▶️',
    color: 'bg-red-600 text-white hover:bg-red-700',
  },
  
  // Payments & commerce
  stripe: {
    name: 'Stripe',
    icon: '💳',
    color: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  shopify: {
    name: 'Shopify',
    icon: '🛍️',
    color: 'bg-green-700 text-white hover:bg-green-800',
  },
  
  // Communication
  zoom: {
    name: 'Zoom',
    icon: '📹',
    color: 'bg-blue-500 text-white hover:bg-blue-600',
  },
  
  // Other common providers
  okta: {
    name: 'Okta',
    icon: '🔐',
    color: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  auth0: {
    name: 'Auth0',
    icon: '🔒',
    color: 'bg-orange-500 text-white hover:bg-orange-600',
  },
  salesforce: {
    name: 'Salesforce',
    icon: '☁️',
    color: 'bg-blue-500 text-white hover:bg-blue-600',
  },
  atlassian: {
    name: 'Atlassian',
    icon: '🌀',
    color: 'bg-blue-600 text-white hover:bg-blue-700',
  },
} as const;

export interface OAuthRendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
  providers?: OAuthProvider[]; // Optional override
}

export function OAuthRenderer({
  state,
  onNext,
  onBack,
  isLoading,
  uiComponents,
  rendererConfig,
  providers: providersProp,
}: OAuthRendererProps) {
  const { oauthSignIn, getOAuthProviders } = useAuth();
  const { Button, Divider, Alert: AlertComponents, providerIcons } = uiComponents;
  
  // Destructure Alert composite components
  const { Alert, AlertDescription } = AlertComponents || {};

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<OAuthProvider[]>(providersProp || []);

  // Fetch supported OAuth providers from adapter
  useEffect(() => {
    const fetchProviders = async () => {
      // If providers are explicitly passed via props, use those
      if (providersProp && providersProp.length > 0) {
        setProviders(providersProp);
        return;
      }

      // If configured in rendererConfig, use those
      if (rendererConfig?.authMethods?.oauth && typeof rendererConfig.authMethods.oauth === 'object') {
        setProviders(rendererConfig.authMethods.oauth.providers || []);
        return;
      }

      // Otherwise, fetch from adapter
      if (getOAuthProviders) {
        try {
          const supportedProviders = await getOAuthProviders();
          setProviders(supportedProviders);
        } catch (err) {
          console.error('[OAuthRenderer] Failed to fetch OAuth providers:', err);
          setError('Failed to load OAuth providers');
        }
      }
    };

    fetchProviders();
  }, [providersProp, rendererConfig, getOAuthProviders]);

  // Use rendererConfig.locale if available (already merged with defaults in provider), 
  // otherwise fall back to defaultLocale
  const locale = rendererConfig?.locale || defaultLocale;

  const handleOAuth = async (provider: OAuthProvider) => {
    if (!oauthSignIn) {
      setError(locale.errors?.generic || defaultLocale.errors.generic);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const url = await oauthSignIn({
        provider,
        redirectUri: window.location.origin + '/auth/callback',
      });
      
      // Redirect to OAuth provider
      if (url) {
        window.location.href = url;
      } else {
        await onNext({ oauthProvider: provider });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to sign in with ${provider}`;
      setError(message);
      setLoading(false);
    }
  };

  // Get provider name - check locale first, then OAUTH_PROVIDER_CONFIG, then capitalize provider string
  const getProviderName = (provider: string): string => {
    // Try locale first (with fallback to defaultLocale)
    const localeName = locale.oauth?.[provider as keyof typeof locale.oauth] || 
                       defaultLocale.oauth[provider as keyof typeof defaultLocale.oauth];
    if (localeName && typeof localeName === 'string') {
      return localeName;
    }
    
    // Fall back to config name
    const config = OAUTH_PROVIDER_CONFIG[provider];
    if (config?.name) {
      return config.name;
    }
    
    // Final fallback: capitalize provider string
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">{locale.oauth?.chooseProvider || 'Choose Your Provider'}</h2>
        <p className="text-sm text-gray-600 mt-1">
          {locale.oauth?.signInPreferred || 'Sign in with your preferred account'}
        </p>
      </div>

      {error && Alert && AlertDescription && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {providers.length === 0 && !loading && Alert && AlertDescription && (
        <Alert variant="warning">
          <AlertDescription>{locale.errors?.generic || 'No providers configured'}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {providers.map((provider) => {
          const config = OAUTH_PROVIDER_CONFIG[provider];
          const ProviderIcon = providerIcons?.[provider];
          const displayName = getProviderName(provider);
          
          return (
            <Button
              key={provider}
              type="button"
              onClick={() => handleOAuth(provider)}
              variant="outline"
              disabled={loading || isLoading}
              loading={loading && state.oauthProvider === provider}
              className={`w-full space-x-4 ${config?.color || ''}`}
            >
              {ProviderIcon && <ProviderIcon className="size-5" />}
              <span>{interpolate(rendererConfig?.labels?.continueWith || locale.auth?.continueWith || 'Continue with {provider}', { provider: displayName })}</span>
            </Button>
          );
        })}
      </div>

      {onBack && (
        <>
          {Divider && <Divider label={locale.common?.or || 'or'} />}
          <Button
            type="button"
            onClick={onBack}
            variant="ghost"
            disabled={loading || isLoading}
            className="w-full"
          >
            {locale.common?.back || 'Back'}
          </Button>
        </>
      )}
    </div>
  );
}

export function OAuthCallbackRenderer({
  state,
  uiComponents,
  rendererConfig,
}: {
  state: FlowState;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
}) {
  const { icons } = uiComponents;
  const LoadingIcon = icons?.loading;
  const locale = rendererConfig?.locale || defaultLocale;

  return (
    <div className="space-y-6 text-center py-12">
      {LoadingIcon ? (
        <LoadingIcon className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
      ) : (
        <div className="mx-auto h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      )}
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{locale.common?.loading || 'Loading...'}</h2>
        <p className="text-gray-600 mt-2">
          {interpolate(locale.auth?.continueWith || 'Continue with {provider}', { provider: state.oauthProvider || '' })}
        </p>
      </div>
    </div>
  );
}

