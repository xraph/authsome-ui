/**
 * OAuth callback handler
 * Processes OAuth callbacks from providers
 */

import type { AuthProvider, OAuthProvider } from '@authsome/ui-core';
import type { OAuthCallbackParams, NextAuthConfig, OAuthCallbackResult } from '../types';
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
 * @param cookieStore - Optional cookie store for setting adapter context
 * @returns Object with success status, redirect URL, optional cookies, and error if any
 */
export async function handleOAuthCallback(
  searchParams: URLSearchParams,
  provider: string | undefined,
  adapter: AuthProvider,
  config: NextAuthConfig,
  cookieStore?: Record<string, string>
): Promise<OAuthCallbackResult> {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'callback-handler.ts:34',message:'handleOAuthCallback invoked',data:{provider:provider,hasSearchParams:searchParams.toString().length>0},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  try {
    // Extract parameters from URL
    const params = extractOAuthParams(searchParams);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'callback-handler.ts:40',message:'OAuth params extracted',data:{hasCode:!!params.code,hasState:!!params.state,hasError:!!params.error,provider:params.provider},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

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
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'callback-handler.ts:77',message:'Missing authorization code',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      throw new Error(ERROR_MESSAGES.CALLBACK_ERROR + ': Missing authorization code');
    }

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'callback-handler.ts:84',message:'Calling adapter.oauthCallback',data:{provider:oauthProvider,codeLength:params.code?.length,hasState:!!params.state},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    // Make direct HTTP request to backend to capture Set-Cookie headers
    // The AuthSome client uses fetch which hides Set-Cookie headers
    let rawSetCookieHeaders: string[] = [];
    let response: any;
    
    // Check if adapter has a getClient method to get the base URL
    const client = (adapter as any).getClient?.();
    if (client && client.baseURL) {
      const backendUrl = `${client.baseURL}${client.basePath || ''}/callback/${oauthProvider}`;
      const fullUrl = `${backendUrl}?code=${encodeURIComponent(params.code!)}${params.state ? `&state=${encodeURIComponent(params.state)}` : ''}`;
      
      console.log('[OAuth Callback] Making direct request to:', fullUrl);
      
      // Build headers including existing cookies
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (cookieStore && Object.keys(cookieStore).length > 0) {
        const cookieString = Object.entries(cookieStore)
          .map(([key, value]) => `${key}=${value}`)
          .join('; ');
        headers['Cookie'] = cookieString;
      }
      
      // Add API key if available
      if (client.apiKey) {
        headers[client.apiKeyHeader || 'X-API-Key'] = client.apiKey;
      }
      
      const backendResponse = await fetch(fullUrl, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      
      console.log('[OAuth Callback] Backend response status:', backendResponse.status);
      
      // Try to extract Set-Cookie headers
      if ('getSetCookie' in backendResponse.headers && typeof backendResponse.headers.getSetCookie === 'function') {
        rawSetCookieHeaders = backendResponse.headers.getSetCookie();
        console.log('[OAuth Callback] Got Set-Cookie headers via getSetCookie():', rawSetCookieHeaders.length);
      }
      
      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: backendResponse.statusText }));
        throw new Error(error.error || error.message || 'OAuth callback failed');
      }
      
      response = await backendResponse.json();
      console.log('[OAuth Callback] Got response from backend');
    } else {
      // Fallback to adapter method
      console.log('[OAuth Callback] Using adapter method (Set-Cookie headers may not be captured)');
      
      if (adapter.setContext && cookieStore) {
        adapter.setContext({
          url: '',
          method: 'GET',
          headers: {},
          cookies: cookieStore,
        });
      }
      
      response = await adapter.oauthCallback({
      provider: oauthProvider as OAuthProvider,
      code: params.code,
      state: params.state,
    });
      
      // Try to get cookies from adapter
      if ('getRawSetCookieHeaders' in adapter && typeof adapter.getRawSetCookieHeaders === 'function') {
        rawSetCookieHeaders = adapter.getRawSetCookieHeaders() || [];
      }
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'callback-handler.ts:93',message:'OAuth callback response received',data:{hasUser:!!response.user,hasSession:!!response.session,userId:response.user?.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Store session in cookie
    await setServerSession(response.user, response.session, config.session);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'callback-handler.ts:100',message:'Session stored',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Log captured Set-Cookie headers
    console.log('[OAuth Callback] Raw Set-Cookie headers captured:', rawSetCookieHeaders.length);
    if (rawSetCookieHeaders.length > 0) {
      rawSetCookieHeaders.forEach((header, index) => {
        console.log(`[OAuth Callback] Set-Cookie ${index + 1}:`, header);
      });
    } else {
      console.warn('[OAuth Callback] WARNING: No Set-Cookie headers captured!');
    }
    
    // Clear adapter context if it was set
    if (adapter.clearContext) {
      console.log('[OAuth Callback] Clearing adapter context');
      adapter.clearContext();
    }

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
      rawSetCookieHeaders: rawSetCookieHeaders.length > 0 ? rawSetCookieHeaders : undefined,
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

