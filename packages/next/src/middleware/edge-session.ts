/**
 * Edge Runtime compatible session utilities
 * Uses NextRequest.cookies instead of next/headers
 */

import type { NextRequest } from 'next/server';
import { unsealData } from 'iron-session';
import type { SessionConfig, SessionData } from '../types';
import { DEFAULT_SESSION_CONFIG, MIN_PASSWORD_LENGTH, ERROR_MESSAGES } from '../lib/constants';
import { AuthProvider, RequestContext, CookieData } from '@authsome/ui-core';

/**
 * Get session encryption password
 */
function getSessionPassword(config?: SessionConfig): string {
  const password = config?.password || process.env.SESSION_SECRET;

  if (!password) {
    throw new Error(ERROR_MESSAGES.NO_SESSION_PASSWORD);
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(ERROR_MESSAGES.NO_SESSION_PASSWORD);
  }

  return password;
}

/**
 * Get iron-session configuration
 */
function getIronSessionConfig(config?: SessionConfig) {
  const password = getSessionPassword(config);

  return {
    password,
    cookieName: config?.cookieName || DEFAULT_SESSION_CONFIG.cookieName,
    ttl: config?.maxAge || DEFAULT_SESSION_CONFIG.maxAge,
  };
}

/**
 * Check if session is expired
 */
function isSessionExpired(sessionData: SessionData | null): boolean {
  if (!sessionData || !sessionData.expiresAt) {
    return true;
  }

  return Date.now() >= sessionData.expiresAt;
}

/**
 * Get session data from NextRequest cookies (Edge Runtime compatible)
 * 
 * @param request - Next.js request object
 * @param config - Session configuration
 * @returns Session data or null
 */
export async function getSessionFromRequest(
  request: NextRequest,
  config?: SessionConfig
): Promise<SessionData | null> {
  try {
    const ironConfig = getIronSessionConfig(config);
    const cookieName = ironConfig.cookieName;

    // Get cookie value from NextRequest.cookies
    const cookieValue = request.cookies.get(cookieName)?.value;

    if (!cookieValue) {
      return null;
    }

    // Decrypt the session using iron-session's unsealData
    const sessionData = await unsealData<SessionData>(cookieValue, {
      password: ironConfig.password,
      ttl: ironConfig.ttl,
    });

    // Validate session has required fields
    if (!sessionData || !sessionData.user || !sessionData.session) {
      return null;
    }

    // Check if expired
    if (isSessionExpired(sessionData)) {
      return null;
    }

    return sessionData;
  } catch (error) {
    // Session parsing/decryption error
    console.error('[Edge Session] Failed to read session:', error);
    return null;
  }
}

/**
 * Get session data from adapter with context support
 * 
 * @param adapter - Auth provider adapter
 * @param request - Next.js request object
 * @param config - Session configuration
 * @returns Session data and cookies to set, or null
 */
export async function getSessionFromAdapter(
  adapter: AuthProvider,
  request: NextRequest,
  _config?: SessionConfig,
): Promise<{ sessionData: SessionData | null; cookies: CookieData[] }> {
  try {
    // Build request context from NextRequest
    const context: RequestContext = {
      url: request.url,
      method: request.method,
      headers: {},
      cookies: {},
    };

    // Extract headers
    request.headers.forEach((value, key) => {
      context.headers![key] = value;
    });

    // Extract cookies
    request.cookies.getAll().forEach(cookie => {
      context.cookies![cookie.name] = cookie.value;
    });

    // Set context on adapter if supported
    if (adapter.setContext) {
      adapter.setContext(context);
    }

    // Get session data
    const sessionData = await adapter.getCurrentSessionData();

    // Get cookies that should be set
    const cookies = adapter.getCookies?.() || [];

    // Clear context
    if (adapter.clearContext) {
      adapter.clearContext();
    }

    return {
      sessionData: sessionData || null,
      cookies,
    };
  } catch (error) {
    console.error('[Edge Session] Failed to read session from adapter:', error);
    
    // Clear context on error too
    if (adapter.clearContext) {
      adapter.clearContext();
    }

    return {
      sessionData: null,
      cookies: [],
    };
  }
}

/**
 * Check if user is authenticated from request
 * Convenience wrapper around getSessionFromRequest
 * 
 * @param request - Next.js request object
 * @param config - Session configuration
 * @returns True if user has valid session
 */
export async function isAuthenticated(
  request: NextRequest,
  config?: SessionConfig
): Promise<boolean> {
  const session = await getSessionFromRequest(request, config);
  return session !== null;
}

