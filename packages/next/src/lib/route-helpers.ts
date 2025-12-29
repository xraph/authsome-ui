/**
 * Route handler helpers for Next.js App Router
 * These functions help create route handlers that users can use in their apps
 */

import { NextResponse, type NextRequest } from 'next/server';
import type { NextAuthConfig } from '../types';
import { parseAuthRoute } from './route-parser';
import { handleOAuthCallback } from '../server/callback-handler';
import { getServerSession, clearServerSession } from '../server/session';
import { extractOAuthProvider } from './route-parser';

/**
 * Create an OAuth callback route handler
 * Usage in app/auth/[...auth]/route.ts:
 * 
 * @example
 * ```ts
 * import { createOAuthCallbackHandler } from '@authsome/ui-next';
 * export const GET = createOAuthCallbackHandler(config);
 * ```
 */
export function createOAuthCallbackHandler(config: NextAuthConfig) {
  return async function GET(
    request: NextRequest,
    context: { params: Promise<{ auth?: string[] }> }
  ) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route-helpers.ts:28',message:'OAuth callback handler invoked',data:{url:request.url,method:request.method},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const params = await context.params;
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route-helpers.ts:33',message:'Context params resolved',data:{auth:params.auth},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const route = parseAuthRoute(params.auth);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route-helpers.ts:37',message:'Route parsed',data:{routeType:route.type,routeProvider:route.provider,segments:route.segments},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      // Only handle callback routes
      if (route.type !== 'callback') {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route-helpers.ts:42',message:'Not a callback route - returning error',data:{routeType:route.type},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return NextResponse.json(
          { error: 'Not a callback route' },
          { status: 400 }
        );
      }

      // Extract OAuth provider from route or query params
      const searchParams = request.nextUrl.searchParams;
      const provider = extractOAuthProvider(route, searchParams);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route-helpers.ts:53',message:'Provider extracted',data:{provider:provider,hasCode:searchParams.has('code'),hasState:searchParams.has('state')},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      if (!provider) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route-helpers.ts:57',message:'No provider found - returning error',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        return NextResponse.json(
          { error: 'No OAuth provider specified' },
          { status: 400 }
        );
      }

      // Extract cookies from request to pass to adapter
      const cookieStore: Record<string, string> = {};
      request.cookies.getAll().forEach(cookie => {
        cookieStore[cookie.name] = cookie.value;
      });
      console.log('[OAuth Route Handler] Extracted request cookies:', Object.keys(cookieStore));
      
      // Handle OAuth callback
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route-helpers.ts:67',message:'Calling handleOAuthCallback',data:{provider:provider},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      const result = await handleOAuthCallback(
        searchParams,
        provider,
        config.adapter,
        config,
        cookieStore
      );
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route-helpers.ts:76',message:'handleOAuthCallback result',data:{success:result.success,redirect:result.redirect,error:result.error,hasCookies:!!result.cookies},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
      // #endregion

      // Create redirect response
      const redirectUrl = new URL(result.redirect, request.url);
      const response = NextResponse.redirect(redirectUrl);

      // Set raw Set-Cookie headers directly from backend
      if (result.rawSetCookieHeaders && result.rawSetCookieHeaders.length > 0) {
        console.log('[OAuth Route Handler] Setting raw Set-Cookie headers:', result.rawSetCookieHeaders.length);
        
        for (const setCookieHeader of result.rawSetCookieHeaders) {
          console.log('[OAuth Route Handler] Appending Set-Cookie header');
          
          // CRITICAL: Use append, not set, to allow multiple Set-Cookie headers
          response.headers.append('Set-Cookie', setCookieHeader);
        }
        
        console.log('[OAuth Route Handler] All Set-Cookie headers appended');
        
        // Verify they were set
        const setCookieHeaders = response.headers.getSetCookie?.() || [];
        console.log('[OAuth Route Handler] Verification - Set-Cookie headers in response:', setCookieHeaders.length);
        setCookieHeaders.forEach((h, i) => {
          console.log(`[OAuth Route Handler] Header ${i + 1}:`, h.substring(0, 100) + '...');
        });
      } else {
        console.warn('[OAuth Route Handler] WARNING: No raw Set-Cookie headers to set!');
        console.warn('[OAuth Route Handler] Result:', JSON.stringify(result, null, 2));
      }

      return response;
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route-helpers.ts:89',message:'Exception caught in callback handler',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.error('OAuth callback error:', error);

      // Redirect to error page
      const errorUrl = config.pages?.error || '/auth/error';
      const url = new URL(errorUrl, request.url);
      url.searchParams.set('error', error.message || 'OAuth callback failed');
      
      return NextResponse.redirect(url);
    }
  };
}

/**
 * Server-side auth page props helper
 * Handles redirect logic for authenticated users and session management
 * 
 * Note: Config is still required for server-side session operations,
 * but is not returned in the props since AuthFlowClient gets it from context.
 * 
 * @example
 * ```tsx
 * import { getAuthPageProps } from '@authsome/ui-next/server';
 * import { redirect } from 'next/navigation';
 * 
 * // Config for server-side operations (session management)
 * const config = {
 *   adapter: authsomeAdapter({ apiKey: process.env.AUTHSOME_API_KEY! }),
 *   session: { password: process.env.SESSION_SECRET! },
 * };
 * 
 * export default async function AuthPage({ params, searchParams }) {
 *   const props = await getAuthPageProps({ params, searchParams, config });
 *   
 *   if (props.redirect) {
 *     redirect(props.redirect);
 *   }
 *   
 *   return <AuthFlowClient {...props} />;
 * }
 * ```
 */
export async function getAuthPageProps(options: {
  params: Promise<{ auth?: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  config: NextAuthConfig;
}) {
  const { params, searchParams, config } = options;
  
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route-helpers.ts:119',message:'getAuthPageProps called',data:{auth:resolvedParams.auth,searchParamsKeys:resolvedSearchParams?Object.keys(resolvedSearchParams):[]},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Parse route
  const route = parseAuthRoute(resolvedParams.auth);
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/32948365-25a5-4865-becb-43b9c32d9143',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route-helpers.ts:125',message:'Route parsed in getAuthPageProps',data:{routeType:route.type,segments:route.segments},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  // Get session
  const session = await getServerSession(config.adapter, config.session);

  // Handle signout
  if (route.type === 'signout') {
    await clearServerSession(config.session);
    const redirectUrl = config.callbacks?.signOut
      ? await config.callbacks.signOut()
      : config.pages?.signIn || '/auth/signin';
    
    return {
      route,
      initialSession: null,
      searchParams: resolvedSearchParams as Record<string, string | string[]>,
      redirect: redirectUrl,
    };
  }

  // Redirect logged-in users away from auth pages
  if (session && (route.type === 'signin' || route.type === 'signup')) {
    // Get user from adapter
    const user = await config.adapter.getCurrentUser();
    const redirectUrl = config.callbacks?.signIn && user
      ? await config.callbacks.signIn(user, session)
      : '/';
    
    return {
      route,
      initialSession: session,
      searchParams: resolvedSearchParams as Record<string, string | string[]>,
      redirect: redirectUrl,
    };
  }

  return {
    route,
    initialSession: session,
    searchParams: resolvedSearchParams as Record<string, string | string[]>,
    redirect: null,
  };
}

/**
 * Generate metadata for auth pages
 * 
 * @example
 * ```tsx
 * export const generateMetadata = createAuthMetadata();
 * ```
 */
export function createAuthMetadata() {
  return async function generateMetadata(props: {
    params: Promise<{ auth?: string[] }>;
  }) {
    const params = await props.params;
    const route = parseAuthRoute(params.auth);

    const titles: Record<string, string> = {
      signin: 'Sign In',
      signup: 'Sign Up',
      callback: 'Authentication',
      signout: 'Sign Out',
      error: 'Authentication Error',
      verify: 'Verify Email',
      'forgot-password': 'Forgot Password',
      'reset-password': 'Reset Password',
      'verify-email': 'Verify Email',
    };

    return {
      title: titles[route.type] || 'Authentication',
    };
  };
}

