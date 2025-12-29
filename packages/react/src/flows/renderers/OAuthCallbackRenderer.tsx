/**
 * OAuth Callback Page Renderer
 * 
 * Platform-agnostic renderer for OAuth callback page processing.
 * Handles OAuth code exchange, session verification, and redirects.
 * 
 * Uses UI components from provider for consistent styling.
 * 
 * Note: This is different from OAuthCallbackRenderer in OAuthRenderer.tsx,
 * which is used for showing loading states during OAuth redirect.
 */

import { useEffect, useState } from 'react';
import type { UIComponents } from '../ui-components';
import type { RendererConfig } from '../renderer-config';
import { defaultLocale, type AuthProvider, type OAuthProvider } from '@authsome/ui-core';

export interface OAuthCallbackPageRendererProps {
  /** OAuth provider (e.g., 'github', 'google') */
  provider: string;
  
  /** OAuth authorization code from URL */
  code: string | null;
  
  /** OAuth state parameter from URL */
  state?: string | null;
  
  /** Auth adapter for handling OAuth callback */
  adapter: AuthProvider;
  
  /** UI components from provider */
  uiComponents: UIComponents;
  
  /** Optional renderer configuration for labels and locale */
  rendererConfig?: RendererConfig;
  
  /** Callback when OAuth succeeds (receives session data) */
  onSuccess: (data: { user: unknown; session: unknown }) => void;
  
  /** Callback when OAuth fails (receives error message) */
  onError: (error: string) => void;
}

export function OAuthCallbackPageRenderer({
  provider,
  code,
  state,
  adapter,
  uiComponents,
  rendererConfig,
  onSuccess,
  onError,
}: OAuthCallbackPageRendererProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>();
  const [processingStep, setProcessingStep] = useState<string>('Initializing...');

  const { Alert: AlertComponents } = uiComponents;
  const { Alert, AlertDescription } = AlertComponents || {};
  
  const config = rendererConfig || {};
  const labels = config.labels || {};
  const locale = config.locale || defaultLocale;

  useEffect(() => {
    const handleCallback = async () => {
      // Validate required parameters
      if (!code) {
        const errorMsg = locale.validation?.codeRequired || 'Missing authorization code';
        setError(errorMsg);
        setStatus('error');
        onError(errorMsg);
        return;
      }

      if (!adapter) {
        const errorMsg = 'Adapter is not configured';
        setError(errorMsg);
        setStatus('error');
        onError(errorMsg);
        return;
      }

      try {
        setProcessingStep(`Processing ${provider} callback...`);

        // Use the adapter's oauthCallback method instead of manual fetch
        const response = await adapter.oauthCallback({
          provider: provider as OAuthProvider,
          code,
          state: state || undefined,
        });
        
        // Verify session using adapter
        setProcessingStep('Verifying session...');
        
        const sessionData = await adapter.getCurrentSessionData();

        if (sessionData && sessionData.user && sessionData.session) {
          setStatus('success');
          setProcessingStep('Sign in successful!');
          
          // Notify parent of success
          onSuccess(sessionData);
        } else {
          // If getCurrentSessionData doesn't work, use the response from oauthCallback
          if (response.user && response.session) {
            setStatus('success');
            setProcessingStep('Sign in successful!');
            onSuccess({ user: response.user, session: response.session });
          } else {
            throw new Error('Session verification failed');
          }
        }
      } catch (err) {
        console.error('[OAuth Callback] Error:', err);
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'OAuth callback failed';
        
        setError(errorMessage);
        setStatus('error');
        onError(errorMessage);
      }
    };

    handleCallback();
  }, [provider, code, state, adapter, locale, onSuccess, onError]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {labels.oauthProcessing || processingStep}
            </p>
            <p className="text-sm text-gray-500">
              {labels.oauthWait || 'Please wait while we complete your sign in'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state (brief flash before redirect)
  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {labels.oauthSuccess || processingStep}
            </p>
            <p className="text-sm text-gray-500">
              {labels.oauthRedirecting || 'Redirecting...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md w-full px-4">
        {Alert && AlertDescription ? (
          <Alert variant="error" className="mb-6">
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">
                  {labels.oauthError || 'OAuth Error'}
                </p>
                <p className="text-sm">{error}</p>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              {labels.oauthError || 'OAuth Error'}
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <div className="text-center">
          <a
            href="/auth/signin"
            className="inline-block rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            {labels.tryAgain || 'Try again'}
          </a>
        </div>
      </div>
    </div>
  );
}

