/**
 * Catch-all Auth Route Handler
 * 
 * Handles all auth routes:
 * - /auth/signin
 * - /auth/signup  
 * - /auth/forgot-password
 * - /auth/reset-password
 * - /auth/verify-email
 * - /auth/callback (OAuth callbacks)
 * - /auth/callback/[provider]
 * 
 * The AuthFlowClient component automatically renders the appropriate
 * UI based on the route segments.
 */

import { AuthFlowClient } from '@authsome/ui-next';
import { getAuthPageProps, createAuthMetadata } from '@authsome/ui-next/server';
import { redirect } from 'next/navigation';
import { authConfig } from '@/lib/auth-config';
import { authServer } from '@/lib/auth-server';

// Server-side config for session management
// Use the initialized adapter from auth-server
const serverConfig = {
  ...authConfig,
  adapter: authServer.adapter, // Use initialized adapter from auth-server
  // Session config must match what's in auth-server.ts
  session: {
    password: process.env.SESSION_SECRET!,
    cookieName: 'authsome_session',
    maxAge: 2592000, // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  },
};

interface AuthPageProps {
  params: Promise<{ auth: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Auth page - handles all authentication flows
 */
export default async function AuthPage(props: AuthPageProps) {
  // Get page props from Next.js route helpers
  const pageProps = await getAuthPageProps({ 
    ...props, 
    config: serverConfig 
  });

  // Handle server-side redirects (e.g., already logged in)
  if (pageProps.redirect) {
    redirect(pageProps.redirect);
  }

  // Render the appropriate auth flow UI
  return <AuthFlowClient {...pageProps} />;
}

/**
 * Generate dynamic metadata based on the auth route
 * - /auth/signin -> "Sign In"
 * - /auth/signup -> "Sign Up"
 * - etc.
 */
export const generateMetadata = createAuthMetadata();

