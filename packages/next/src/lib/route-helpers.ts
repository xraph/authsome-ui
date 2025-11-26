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
    try {
      const params = await context.params;
      const route = parseAuthRoute(params.auth);

      // Only handle callback routes
      if (route.type !== 'callback') {
        return NextResponse.json(
          { error: 'Not a callback route' },
          { status: 400 }
        );
      }

      // Extract OAuth provider from route or query params
      const searchParams = request.nextUrl.searchParams;
      const provider = extractOAuthProvider(route, searchParams);

      if (!provider) {
        return NextResponse.json(
          { error: 'No OAuth provider specified' },
          { status: 400 }
        );
      }

      // Handle OAuth callback
      const result = await handleOAuthCallback(
        searchParams,
        provider,
        config.adapter,
        config
      );

      if (result.success) {
        // Redirect to success URL
        return NextResponse.redirect(new URL(result.redirect, request.url));
      } else {
        // Redirect to error page with error message
        return NextResponse.redirect(new URL(result.redirect, request.url));
      }
    } catch (error: any) {
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
  
  // Parse route
  const route = parseAuthRoute(resolvedParams.auth);

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

