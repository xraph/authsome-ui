/**
 * Server-side auth client configuration
 * Use this in Server Components, Server Actions, and API routes
 * 
 * @example
 * import { authServer } from '@/lib/auth-server';
 * 
 * // In a Server Component
 * export default async function ProfilePage() {
 *   const user = await authServer.getUser();
 *   if (!user) redirect('/auth/signin');
 *   return <div>Welcome {user.name}</div>;
 * }
 * 
 * // In a Server Action
 * 'use server';
 * export async function handleSignOut() {
 *   await authServer.signOut();
 *   redirect('/');
 * }
 */

import { createServerAuthClient } from '@authsome/ui-next/server';
import { AuthSomeAdapter } from '@authsome/adapter-authsome';

// Validate required environment variables
if (!process.env.AUTHSOME_API_KEY) {
  throw new Error('AUTHSOME_API_KEY environment variable is required');
}

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required (minimum 32 characters)');
}

if (process.env.SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET must be at least 32 characters long');
}

/**
 * Initialize the AuthSome adapter
 * Must be done before creating the server auth client
 */
const adapter = new AuthSomeAdapter();
adapter.initialize({
  apiUrl: process.env.AUTHSOME_API_URL || 'https://api.authsome.com',
  apiKey: process.env.AUTHSOME_API_KEY,
  basePath: '/api/identity',
  authMode: 'cookies',
  plugins: ['social', 'passkey', 'magiclink', 'twofa', 'phone', 'mfa'],
});

/**
 * Server auth client for Next.js Server Components and Server Actions
 * 
 * Available methods:
 * - Authentication: signIn, signUp, signOut
 * - Session: getSession, getUser, isAuthenticated, requireAuth
 * - Magic Link: sendMagicLink
 * - Phone: sendPhoneCode, verifyPhoneCode
 * - 2FA: verifyTwoFactor
 * - Password: requestPasswordReset, confirmPasswordReset, changePassword
 * - Passkey: authenticatePasskey
 * - OAuth: getOAuthProviders
 */
export const authServer = createServerAuthClient({
  adapter,
  session: {
    password: process.env.SESSION_SECRET,
    cookieName: 'authsome.session', // Must match middleware and client config
    maxAge: 2592000, // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
  basePath: '/auth',
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
});

