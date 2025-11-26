/**
 * Auth middleware factory
 * Creates Next.js middleware for route protection
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { MiddlewareConfig, SessionData } from '../types';
import {
  isPublicRoute,
  isAuthRoute,
  isConfiguredAuthRoute,
  shouldProcessRequest,
  normalizePath,
} from './matchers';
import { getSessionFromAdapter, getSessionFromRequest } from './edge-session';
import { DEFAULT_BASE_PATH, DEFAULT_AUTH_ROUTES, ERROR_MESSAGES } from '../lib/constants';
import { serializeCookie, CookieData } from '@authsome/ui-core';

/**
 * Apply cookies to a NextResponse
 * @param response - Next.js response
 * @param cookies - Cookies to set
 */
export function applyCookiesToResponse(response: NextResponse, cookies: CookieData[]): void {
  for (const cookie of cookies) {
    const serialized = serializeCookie(cookie);
    response.headers.append('Set-Cookie', serialized);
  }
}

/**
 * Create auth middleware
 * 
 * @param config - Middleware configuration
 * @returns Next.js middleware function
 * 
 * @example
 * ```ts
 * // middleware.ts
 * import { createAuthMiddleware } from '@authsome/ui-next';
 * import { authsomeAdapter } from '@authsome/ui-adapter-authsome';
 * 
 * const adapter = authsomeAdapter({ apiKey: process.env.AUTHSOME_API_KEY });
 * 
 * export default createAuthMiddleware({
 *   adapter,
 *   publicRoutes: ['/', '/about'],
 *   afterAuthRedirect: '/dashboard',
 * });
 * 
 * export const config = {
 *   matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
 * };
 * ```
 */
export function createAuthMiddleware(config: MiddlewareConfig) {
  if (!config.adapter) {
    throw new Error(ERROR_MESSAGES.NO_ADAPTER);
  }

  const basePath = config.basePath || DEFAULT_BASE_PATH;
  const publicRoutes = config.publicRoutes || [];
  const authRoutes = config.authRoutes || DEFAULT_AUTH_ROUTES;
  const afterAuthRedirect = config.afterAuthRedirect || '/';

  return async function middleware(request: NextRequest) {
    const pathname = normalizePath(request.nextUrl.pathname);

    // Skip Next.js special paths and static assets
    if (!shouldProcessRequest(pathname)) {
      return NextResponse.next();
    }

    // Check if route is public
    if (isPublicRoute(pathname, publicRoutes)) {
      return NextResponse.next();
    }

    // Custom auth check if provided
    if (config.requiresAuth) {
      const requiresAuth = await config.requiresAuth(pathname);
      if (!requiresAuth || isAuthRoute(pathname, basePath)) {
        return NextResponse.next();
      }
    }

    // Get session from cookie (Edge Runtime compatible)
    let session: { sessionData: SessionData | null; cookies: CookieData[] } | null = null;
    try {
      session = await getSessionFromAdapter(config.adapter, request, config.session);
    } catch (error) {
      console.error('Middleware session error:', error);
      session = null;
    }

    // Skip auth routes (let the route handler deal with them)
    if (isAuthRoute(pathname, basePath) && !session?.sessionData) {
      return NextResponse.next();
    }

    // Require authentication for protected routes
    if (!session?.sessionData) {
      // User not authenticated, redirect to sign in
      const signInUrl = config.pages?.signIn || `${basePath}/signin`;
      const redirectUrl = new URL(signInUrl, request.url);
      
      // Add callback URL to redirect back after sign in
      redirectUrl.searchParams.set('callbackUrl', pathname);
      
      const response = NextResponse.redirect(redirectUrl);
      
      // Apply any cookies from adapter even on redirect
      if (session?.cookies && session.cookies.length > 0) {
        applyCookiesToResponse(response, session.cookies);
      }
      
      return response;
    }

    // User is authenticated
    // Check if trying to access auth pages while logged in
    if (isConfiguredAuthRoute(pathname, authRoutes)) {
      // Redirect away from auth pages
      const redirectUrl = new URL(afterAuthRedirect, request.url);
      const response = NextResponse.redirect(redirectUrl);
      
      // Apply any cookies from adapter even on redirect
      if (session?.cookies && session.cookies.length > 0) {
        applyCookiesToResponse(response, session.cookies);
      }
      
      return response;
    }

    // Allow request to proceed and apply any cookies from the adapter
    // This is critical for session refresh - without this, refreshed tokens are lost
    const response = NextResponse.next();
    
    // Apply cookies from adapter to response (e.g., refreshed session tokens)
    if (session?.cookies && session.cookies.length > 0) {
      applyCookiesToResponse(response, session.cookies);
    }
    
    return response;
  };
}

/**
 * Create middleware with custom logic
 * Advanced version that provides session data to callback
 * 
 * @param config - Middleware configuration
 * @param handler - Custom handler function
 * @returns Next.js middleware function
 */
export function createAuthMiddlewareWithHandler(
  config: MiddlewareConfig,
  handler: (
    request: NextRequest,
    session: SessionData | null
  ) => Promise<NextResponse> | NextResponse
) {
  if (!config.adapter) {
    throw new Error(ERROR_MESSAGES.NO_ADAPTER);
  }

  const basePath = config.basePath || DEFAULT_BASE_PATH;

  return async function middleware(request: NextRequest) {
    const pathname = normalizePath(request.nextUrl.pathname);

    // Skip Next.js special paths and static assets
    if (!shouldProcessRequest(pathname)) {
      return NextResponse.next();
    }

    // Skip auth routes
    if (isAuthRoute(pathname, basePath)) {
      return NextResponse.next();
    }

    // Get session (Edge Runtime compatible)
    let sessionData;
    try {
      sessionData = await getSessionFromRequest(request, config.session);
    } catch (error) {
      console.error('Middleware session error:', error);
      sessionData = null;
    }

    // Call custom handler
    return handler(request, sessionData);
  };
}

/**
 * Export middleware utilities for custom implementations
 */
export {
  isPublicRoute,
  isAuthRoute,
  isConfiguredAuthRoute,
  shouldProcessRequest,
  normalizePath,
} from './matchers';

export {
  getSessionFromAdapter,
} from './edge-session';

