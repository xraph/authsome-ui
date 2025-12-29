/**
 * OAuth Callback Client Component for Next.js
 * 
 * Next.js-specific wrapper around the platform-agnostic OAuthCallbackPageRenderer.
 * Handles Next.js routing and URL parameter extraction.
 * 
 * Uses AuthProvider context to get:
 * - UI components (for consistent styling)
 * - Renderer configuration (labels, locale)
 * - Adapter (for OAuth callback processing via client methods)
 * 
 * The adapter's oauthCallback() and getCurrentSessionData() methods are used
 * instead of manually constructing URLs and making fetch requests.
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { OAuthCallbackPageRenderer, useAuth } from '@authsome/ui-react';

export interface OAuthCallbackClientProps {
  /** OAuth provider (e.g., 'github', 'google') */
  provider: string;
  
  /** 
   * Optional success redirect URL (fallback if no query param)
   * Priority: callbackUrl query param > redirectTo query param > this prop > '/dashboard'
   */
  successRedirect?: string;
  
  /** 
   * Optional error redirect URL (fallback if no query param)
   * Defaults to '/auth/error'
   */
  errorRedirect?: string;
}

/**
 * OAuth Callback Client Component
 * 
 * Use this component in your OAuth callback page.
 * UI components and configuration are automatically retrieved from AuthProvider context.
 * 
 * Redirect Behavior:
 * - Checks query params for `callbackUrl` or `redirectTo` (set by middleware)
 * - Falls back to `successRedirect` prop if no query param
 * - Finally defaults to '/dashboard'
 * 
 * This matches the pattern used in UnifiedAuthRenderer and Next.js middleware.
 * 
 * @example
 * ```tsx
 * // app/auth/callback/[provider]/page.tsx
 * import { OAuthCallbackClient } from '@authsome/ui-next';
 * 
 * export default async function CallbackPage({ params }: { params: Promise<{ provider: string }> }) {
 *   const { provider } = await params;
 *   return <OAuthCallbackClient provider={provider} />;
 * }
 * ```
 * 
 * @example With custom redirect
 * ```tsx
 * // Redirect to onboarding if no callbackUrl in query
 * <OAuthCallbackClient provider={provider} successRedirect="/onboarding" />
 * ```
 */
export function OAuthCallbackClient({
  provider,
  successRedirect,
  errorRedirect,
}: OAuthCallbackClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  
  // Get UI components, config, and adapter from auth context
  const uiComponents = auth.uiComponents;
  const rendererConfig = auth.rendererConfig;
  const adapter = auth.adapter;
  
  // Extract OAuth parameters from URL
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  // Get redirect URLs from query params (same as UnifiedAuthRenderer and middleware)
  // Priority: callbackUrl query param > redirectTo query param > successRedirect prop > default
  const callbackUrl = searchParams.get('callbackUrl') || searchParams.get('redirectTo');
  const effectiveSuccessRedirect = callbackUrl || successRedirect || '/dashboard';
  const effectiveErrorRedirect = errorRedirect || '/auth/error';
  
  // Validate UI components are available
  if (!uiComponents) {
    console.error('[OAuth Callback] UI components not found in auth context');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Configuration Error</h2>
            <p className="text-red-600">
              UI components not found. Make sure your app is wrapped with NextAuthProvider and uiComponents are configured.
            </p>
          </div>
          <div className="text-center">
            <a
              href="/auth/signin"
              className="inline-block rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
            >
              Back to sign in
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // Validate adapter is available
  if (!adapter) {
    console.error('[OAuth Callback] Adapter not found in auth context');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Configuration Error</h2>
            <p className="text-red-600">
              Adapter not found. Make sure your NextAuthProvider has an adapter configured.
            </p>
          </div>
          <div className="text-center">
            <a
              href="/auth/signin"
              className="inline-block rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
            >
              Back to sign in
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Handle pre-existing error from OAuth provider
  if (error) {
    const errorDescription = searchParams.get('error_description') || error;
    console.error('[OAuth Callback] OAuth provider error:', errorDescription);
    
    // Redirect to error page with error details
    const errorUrl = new URL(effectiveErrorRedirect, window.location.origin);
    errorUrl.searchParams.set('error', errorDescription);
    router.push(errorUrl.toString());
    
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    );
  }

  // Handle success - redirect to destination
  const handleSuccess = (data: { user: unknown; session: unknown }) => {
    if (data.user && typeof data.user === 'object' && 'email' in data.user) {
      console.log('[OAuth Callback] User:', data.user.email);
    }
    
    // Log redirect source for debugging
    if (callbackUrl) {
      console.log('[OAuth Callback] Using callbackUrl from query params:', effectiveSuccessRedirect);
    } else if (successRedirect) {
      console.log('[OAuth Callback] Using successRedirect prop:', effectiveSuccessRedirect);
    } else {
      console.log('[OAuth Callback] Using default redirect:', effectiveSuccessRedirect);
    }
    
    console.log('[OAuth Callback] Success! Redirecting to:', effectiveSuccessRedirect);
    
    // Small delay to show success state
    setTimeout(() => {
      router.push(effectiveSuccessRedirect);
    }, 500);
  };

  // Handle error - redirect to error page
  const handleError = (errorMessage: string) => {
    console.error('[OAuth Callback] Error:', errorMessage);
    
    const errorUrl = new URL(effectiveErrorRedirect, window.location.origin);
    errorUrl.searchParams.set('error', errorMessage);
    
    // Delay redirect slightly to show error
    setTimeout(() => {
      router.push(errorUrl.toString());
    }, 2000);
  };

  // Render the platform-agnostic callback page renderer
  return (
    <OAuthCallbackPageRenderer
      provider={provider}
      code={code}
      state={state}
      adapter={adapter}
      uiComponents={uiComponents}
      rendererConfig={rendererConfig}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}

