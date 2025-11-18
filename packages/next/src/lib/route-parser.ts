/**
 * Route parser for catch-all auth segments
 */

import type { AuthRoute, ParsedAuthRoute } from '../types';

/**
 * Valid auth route types
 */
const VALID_ROUTES: AuthRoute[] = ['signin', 'signup', 'callback', 'signout', 'error', 'verify'];

/**
 * Parse auth route segments from catch-all route
 * 
 * Handles patterns like:
 * - /auth/signin -> { type: 'signin', segments: ['signin'] }
 * - /auth/signup -> { type: 'signup', segments: ['signup'] }
 * - /auth/callback -> { type: 'callback', segments: ['callback'] }
 * - /auth/callback/google -> { type: 'callback', provider: 'google', segments: ['callback', 'google'] }
 * 
 * @param segments - Array of path segments from params.auth
 * @returns Parsed route object
 */
export function parseAuthRoute(segments: string[] | undefined): ParsedAuthRoute {
  // Default to signin if no segments
  if (!segments || segments.length === 0) {
    return {
      type: 'signin',
      segments: ['signin'],
    };
  }

  const [firstSegment, secondSegment] = segments;
  const type = firstSegment as AuthRoute;

  // Validate first segment is a valid route
  if (!VALID_ROUTES.includes(type)) {
    return {
      type: 'error',
      segments,
    };
  }

  // Handle callback with provider: /auth/callback/google
  if (type === 'callback' && secondSegment) {
    return {
      type: 'callback',
      provider: secondSegment,
      segments,
    };
  }

  return {
    type,
    segments,
  };
}

/**
 * Extract OAuth provider from URL
 * Supports both path segments and query params
 * 
 * Priority:
 * 1. Path segment: /auth/callback/google
 * 2. Query param: /auth/callback?provider=google
 * 
 * @param route - Parsed route object
 * @param searchParams - URLSearchParams or query object
 * @returns Provider name or undefined
 */
export function extractOAuthProvider(
  route: ParsedAuthRoute,
  searchParams?: URLSearchParams | Record<string, string | string[] | undefined>
): string | undefined {
  // First check path segment
  if (route.provider) {
    return route.provider;
  }

  // Then check query params
  if (!searchParams) {
    return undefined;
  }

  if (searchParams instanceof URLSearchParams) {
    return searchParams.get('provider') || undefined;
  }

  const provider = searchParams.provider;
  return typeof provider === 'string' ? provider : undefined;
}

/**
 * Build auth URL from route type and provider
 * 
 * @param basePath - Base path for auth routes
 * @param type - Auth route type
 * @param provider - Optional OAuth provider
 * @returns Full auth URL path
 */
export function buildAuthUrl(basePath: string, type: AuthRoute, provider?: string): string {
  const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  
  if (type === 'callback' && provider) {
    return `${cleanBasePath}/callback/${provider}`;
  }

  return `${cleanBasePath}/${type}`;
}

/**
 * Check if a pathname is an auth route
 * 
 * @param pathname - URL pathname
 * @param basePath - Base path for auth routes
 * @returns True if pathname is an auth route
 */
export function isAuthPath(pathname: string, basePath: string): boolean {
  const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  return pathname.startsWith(cleanBasePath);
}

/**
 * Extract callback URL from query params
 * 
 * @param searchParams - URLSearchParams or query object
 * @returns Callback URL or undefined
 */
export function extractCallbackUrl(
  searchParams?: URLSearchParams | Record<string, string | string[] | undefined>
): string | undefined {
  if (!searchParams) {
    return undefined;
  }

  if (searchParams instanceof URLSearchParams) {
    return searchParams.get('callbackUrl') || searchParams.get('redirectTo') || undefined;
  }

  const callbackUrl = searchParams.callbackUrl || searchParams.redirectTo;
  return typeof callbackUrl === 'string' ? callbackUrl : undefined;
}

