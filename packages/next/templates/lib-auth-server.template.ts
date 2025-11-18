/**
 * Server-side auth client
 * Copy this file to: lib/auth-server.ts
 * 
 * This creates a server-side client that can be used in:
 * - Server Components
 * - Server Actions
 * - API Routes
 * - Middleware
 */

import { createServerAuthClient } from '@authsome/ui-next/server';
import { authsomeAdapter } from '@authsome/ui-adapter-authsome';

// Create and export the server auth client
export const authServer = createServerAuthClient({
  adapter: authsomeAdapter({
    apiKey: process.env.AUTHSOME_API_KEY!,
  }),
  session: {
    password: process.env.SESSION_SECRET!,
  },
  callbacks: {
    signIn: async (user, session) => {
      // Redirect after sign in
      return '/dashboard';
    },
    signOut: async () => {
      // Redirect after sign out
      return '/';
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
});

/**
 * Usage examples:
 * 
 * // In Server Components:
 * const session = await authServer.getSession();
 * const user = await authServer.getUser();
 * 
 * // In Server Actions:
 * 'use server';
 * export async function handleSignIn(formData: FormData) {
 *   const result = await authServer.signIn({
 *     email: formData.get('email'),
 *     password: formData.get('password'),
 *   });
 *   if (result.redirect) redirect(result.redirect);
 * }
 * 
 * // Protected route:
 * const { user, session } = await authServer.requireAuth();
 * 
 * // Check authentication:
 * if (await authServer.isAuthenticated()) {
 *   // User is logged in
 * }
 */

