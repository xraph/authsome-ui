/**
 * Shared auth configuration for client-side components
 * Use this in NextAuthProvider and client components
 */

'use client';

import { AuthSomeAdapter } from '@authsome/adapter-authsome';
import type { NextAuthConfig } from '@authsome/ui-next';

// Import UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

if (!process.env.NEXT_PUBLIC_AUTHSOME_API_KEY && !process.env.AUTHSOME_API_KEY) {
  console.warn('Warning: AUTHSOME_API_KEY not configured. Auth will not work correctly.');
}

if (!process.env.SESSION_SECRET) {
  console.warn('Warning: SESSION_SECRET not configured. Session management will not work.');
}

/**
 * Client-side auth configuration
 * Used in NextAuthProvider and auth components
 */
export const authConfig: NextAuthConfig = {
  adapter: new AuthSomeAdapter(),
  adapterConfig: {
    apiUrl: process.env.NEXT_PUBLIC_AUTHSOME_API_URL || process.env.AUTHSOME_API_URL || 'https://api.authsome.com',
    apiKey: process.env.NEXT_PUBLIC_AUTHSOME_API_KEY || process.env.AUTHSOME_API_KEY,
  },
  uiComponents: {
    Input,
    Button,
    Field: {
      Field: ({ children, error }: any) => (
        <div className="space-y-2">{children}</div>
      ),
      FieldLabel: Label,
      FieldDescription: ({ children }: any) => (
        <p className="text-sm text-muted-foreground">{children}</p>
      ),
      FieldError: ({ children }: any) => (
        <p className="text-sm font-medium text-destructive">{children}</p>
      ),
    },
  },
  session: {
    password: process.env.SESSION_SECRET!,
    cookieName: 'authsome.session',
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
  callbacks: {
    afterSignIn: async (user) => {
      console.log('User signed in:', user.email);
      return '/dashboard';
    },
    afterSignUp: async (user) => {
      console.log('User signed up:', user.email);
      return '/dashboard';
    },
    afterSignOut: async () => {
      console.log('User signed out');
      return '/';
    },
    afterOAuth: async (user, session, provider) => {
      console.log(`OAuth sign in with ${provider}:`, user.email);
      return '/dashboard';
    },
  },
};

