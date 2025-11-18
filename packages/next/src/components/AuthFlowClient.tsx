/**
 * Auth flow client component
 * Wraps @authsome/ui-react for Next.js
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@authsome/ui-react';
import type { AuthFlowClientProps } from '../types';
import { useAuthSync } from '../hooks/useAuthSync';
import {
  signInAction,
  signUpAction,
  sendMagicLinkAction,
} from '../server/actions';
import { initiateOAuth } from '../server/callback-handler';

/**
 * Auth Flow Client Component
 * Renders authentication flows with Next.js integration
 * 
 * @example
 * ```tsx
 * import { AuthFlowClient } from '@authsome/ui-next';
 * 
 * export default function AuthPage({ params, searchParams }) {
 *   const route = parseAuthRoute(params.auth);
 *   const session = await getServerSession(adapter);
 *   
 *   return (
 *     <AuthFlowClient
 *       route={route}
 *       initialSession={session}
 *       config={authConfig}
 *       searchParams={searchParams}
 *     />
 *   );
 * }
 * ```
 */
export function AuthFlowClient({
  route: _route,
  initialSession: _initialSession,
  config,
  searchParams,
}: AuthFlowClientProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  // Enable auth sync
  useAuthSync({
    pollInterval: 60000,
    enablePolling: true,
  });

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = React.useCallback((redirectUrl?: string) => {
    if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      router.push('/');
    }
  }, [router]);

  /**
   * Handle authentication error
   */
  const handleAuthError = React.useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  /**
   * Sign in handler
   */
  const handleSignIn = React.useCallback(async (data: any) => {
    setError(null);

    const result = await signInAction(data);

    if (result.success) {
      handleAuthSuccess(result.redirect);
    } else {
      handleAuthError(result.error || 'Sign in failed');
    }
  }, [handleAuthSuccess, handleAuthError]);

  /**
   * Sign up handler
   */
  const handleSignUp = React.useCallback(async (data: any) => {
    setError(null);

    const result = await signUpAction(data);

    if (result.success) {
      handleAuthSuccess(result.redirect);
    } else {
      handleAuthError(result.error || 'Sign up failed');
    }
  }, [handleAuthSuccess, handleAuthError]);

  /**
   * OAuth handler
   */
  const handleOAuth = React.useCallback(async (provider: string) => {
    setError(null);

    try {
      const callbackUrl = searchParams?.callbackUrl as string | undefined;
      const oauthUrl = await initiateOAuth(
        provider,
        config.adapter,
        config,
        callbackUrl
      );

      // Redirect to OAuth provider
      window.location.href = oauthUrl;
    } catch (err: any) {
      handleAuthError(err.message || 'OAuth failed');
    }
  }, [config, searchParams, handleAuthError]);

  /**
   * Magic link handler
   */
  const handleMagicLink = React.useCallback(async (email: string) => {
    setError(null);

    const result = await sendMagicLinkAction({ email });

    if (!result.success) {
      handleAuthError(result.error || 'Failed to send magic link');
    }

    return result.success;
  }, [handleAuthError]);

  // Create custom client that wraps server actions
  const customClient = React.useMemo(() => {
    return {
      ...config.adapter,
      signIn: async (data: any) => {
        await handleSignIn(data);
        return {} as any; // Return dummy response as redirect happens
      },
      signUp: async (data: any) => {
        await handleSignUp(data);
        return {} as any;
      },
      oauthSignIn: async (data: any) => {
        await handleOAuth(data.provider);
        return ''; // Return dummy URL
      },
      sendMagicLink: async (data: any) => {
        await handleMagicLink(data.email);
      },
    };
  }, [config.adapter, handleSignIn, handleSignUp, handleOAuth, handleMagicLink]);

  // Render based on route type
  return (
    <AuthProvider
      client={customClient as any}
      uiComponents={config.uiComponents}
      rendererConfig={config.rendererConfig}
    >
      <div className="auth-flow-container">
        {error && (
          <div className="auth-error" style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        {/* The AuthProvider will render the appropriate flow */}
        {/* based on the rendererConfig and current auth state */}
      </div>
    </AuthProvider>
  );
}

