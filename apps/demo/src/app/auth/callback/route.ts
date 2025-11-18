/**
 * OAuth Callback Route Handler
 * 
 * Handles OAuth callbacks from providers like Google, GitHub, etc.
 * Supports both URL patterns:
 * - /auth/callback/google?code=...
 * - /auth/callback?provider=google&code=...
 * 
 * This route handler processes the OAuth flow, exchanges the code
 * for tokens, creates a session, and redirects to the appropriate page.
 */

import { createOAuthCallbackHandler } from '@authsome/ui-next/server';
import { AuthSomeAdapter } from '@authsome/adapter-authsome';

// OAuth callback configuration
const config = {
  adapter: new AuthSomeAdapter(),
  adapterConfig: {
    apiUrl: process.env.AUTHSOME_API_URL || 'https://api.authsome.com',
    apiKey: process.env.AUTHSOME_API_KEY!,
  },
  session: {
    password: process.env.SESSION_SECRET!,
    cookieName: 'authsome.session',
    maxAge: 2592000, // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  },
  basePath: '/auth',
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    afterOAuth: async (user, session, provider) => {
      console.log(`OAuth successful with ${provider}:`, user.email);
      // Return the redirect URL after successful OAuth
      return '/dashboard';
    },
  },
};

/**
 * GET handler for OAuth callbacks
 * Automatically handles:
 * - Code exchange
 * - Session creation
 * - Error handling
 * - Redirects
 */
export const GET = createOAuthCallbackHandler(config);

