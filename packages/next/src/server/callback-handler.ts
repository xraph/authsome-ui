/**
 * OAuth callback handler
 * Processes OAuth callbacks from providers
 */

import type { AuthProvider, OAuthProvider } from '@authsome/ui-core';
import type { OAuthCallbackParams, NextAuthConfig } from '../types';
import { setServerSession } from './session';
import { getRedirectUrl } from '../lib/redirect-manager';
import { ERROR_MESSAGES } from '../lib/constants';

/**
 * Handle OAuth callback
 * Supports both URL patterns:
 * - /auth/callback/google?code=...
 * - /auth/callback?provider=google&code=...
 * 
 * @param searchParams - URL search parameters
 * @param provider - Provider from path segment (optional)
 * @param adapter - Auth provider adapter
 * @param config - Next auth configuration
 * @returns Object with success status, redirect URL, and error if any
 */
export async function handleOAuthCallback(
  searchParams: URLSearchParams,
  provider: string | undefined,
  adapter: AuthProvider,
  config: NextAuthConfig
): Promise<{
  success: boolean;
  redirect: string;
  error?: string;
}> {
  try {
    // Extract parameters from URL
    const params = extractOAuthParams(searchParams);

    // Check for OAuth error response
    if (params.error) {
      const errorMessage = params.error_description || params.error;
      
      // Call error callback if configured
      if (config.callbacks?.error) {
        const errorRedirect = await config.callbacks.error({
          name: 'OAuthError',
          message: errorMessage,
          type: 'UNKNOWN_ERROR' as any,
        } as any);
        
        return {
          success: false,
          redirect: errorRedirect,
          error: errorMessage,
        };
      }

      // Default error redirect
      const errorUrl = config.pages?.error || '/auth/error';
      return {
        success: false,
        redirect: `${errorUrl}?error=${encodeURIComponent(errorMessage)}`,
        error: errorMessage,
      };
    }

    // Get provider (from path or query param)
    const oauthProvider = provider || params.provider;
    
    if (!oauthProvider) {
      throw new Error(ERROR_MESSAGES.NO_PROVIDER);
    }

    // Verify we have a code
    if (!params.code) {
      throw new Error(ERROR_MESSAGES.CALLBACK_ERROR + ': Missing authorization code');
    }

    // Call adapter to exchange code for session
    const response = await adapter.oauthCallback({
      provider: oauthProvider as OAuthProvider,
      code: params.code,
      state: params.state,
    });

    // Store session in cookie
    await setServerSession(response.user, response.session, config.session);

    // Determine redirect URL
    let redirectUrl: string;

    // Priority 1: afterOAuth callback
    if (config.callbacks?.afterOAuth) {
      redirectUrl = await config.callbacks.afterOAuth(
        response.user,
        response.session,
        oauthProvider
      );
    }
    // Priority 2: signIn callback
    else if (config.callbacks?.signIn) {
      redirectUrl = await config.callbacks.signIn(response.user, response.session);
    }
    // Priority 3: callbackUrl from state or default
    else {
      const callbackUrl = extractCallbackUrlFromState(params.state);
      redirectUrl = getRedirectUrl(callbackUrl, undefined, '/');
    }

    return {
      success: true,
      redirect: redirectUrl,
    };
  } catch (error: any) {
    console.error('OAuth callback error:', error);

    // Call error callback if configured
    if (config.callbacks?.error) {
      try {
        const errorRedirect = await config.callbacks.error({
          name: 'OAuthCallbackError',
          message: error.message,
          type: 'UNKNOWN_ERROR' as any,
        } as any);
        
        return {
          success: false,
          redirect: errorRedirect,
          error: error.message,
        };
      } catch {
        // Fallback if callback fails
      }
    }

    // Default error handling
    const errorUrl = config.pages?.error || '/auth/error';
    return {
      success: false,
      redirect: `${errorUrl}?error=${encodeURIComponent(error.message)}`,
      error: error.message,
    };
  }
}

/**
 * Extract OAuth parameters from URL search params
 */
function extractOAuthParams(searchParams: URLSearchParams): OAuthCallbackParams {
  return {
    code: searchParams.get('code') || undefined,
    state: searchParams.get('state') || undefined,
    error: searchParams.get('error') || undefined,
    error_description: searchParams.get('error_description') || undefined,
    provider: searchParams.get('provider') || undefined,
  };
}

/**
 * Extract callback URL from OAuth state parameter
 * OAuth state can encode the original callback URL
 * 
 * @param state - OAuth state parameter
 * @returns Callback URL or undefined
 */
function extractCallbackUrlFromState(state: string | undefined): string | undefined {
  if (!state) {
    return undefined;
  }

  try {
    // Try to decode state as JSON
    const decoded = JSON.parse(atob(state));
    return decoded.callbackUrl;
  } catch {
    // If not JSON, might be a direct URL
    try {
      return atob(state);
    } catch {
      // Not base64 encoded
      return undefined;
    }
  }
}

/**
 * Build OAuth state parameter with callback URL
 * 
 * @param callbackUrl - URL to redirect to after OAuth
 * @returns Base64 encoded state
 */
export function buildOAuthState(callbackUrl?: string): string {
  if (!callbackUrl) {
    return '';
  }

  const state = {
    callbackUrl,
    timestamp: Date.now(),
  };

  return btoa(JSON.stringify(state));
}

/**
 * Initiate OAuth sign-in
 * Generates OAuth URL with proper redirect and state
 * 
 * @param provider - OAuth provider
 * @param adapter - Auth provider adapter
 * @param config - Next auth configuration
 * @param callbackUrl - URL to redirect to after OAuth
 * @returns OAuth authorization URL
 */
export async function initiateOAuth(
  provider: string,
  adapter: AuthProvider,
  config: NextAuthConfig,
  callbackUrl?: string
): Promise<string> {
  const basePath = config.basePath || '/auth';
  const redirectUri = `${basePath}/callback/${provider}`;
  
  // Build state with callback URL
  const state = buildOAuthState(callbackUrl);

  // Call adapter to get OAuth URL
  const oauthUrl = await adapter.oauthSignIn({
    provider: provider as OAuthProvider,
    redirectUri,
    state: state || undefined,
  });

  // Call beforeOAuth callback if configured
  if (config.callbacks?.beforeOAuth) {
    return await config.callbacks.beforeOAuth(oauthUrl, provider);
  }

  return oauthUrl;
}

