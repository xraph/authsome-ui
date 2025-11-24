/**
 * Server-side auth client
 * Provides a configured client for server-side operations
 */

'use server';

import { cookies } from 'next/headers';
import type {
  SignInRequest,
  SignUpRequest,
  MagicLinkRequest,
  PhoneAuthRequest,
  PhoneVerifyRequest,
  TwoFactorVerifyRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  PasswordChangeRequest,
  PasskeyAuthRequest,
  User,
  Session,
} from '@authsome/ui-core';
import type { NextAuthConfig, ActionResult } from '../types';
import {
  setServerSession,
  clearServerSession,
  getServerSession,
  refreshServerSession,
  getServerUser,
  isAuthenticated,
  requireAuth,
} from './session';

/**
 * Type for the cookie store returned by Next.js cookies()
 */
type CookieStore = Awaited<ReturnType<typeof cookies>>;

/**
 * Create a server-side auth client
 * This provides all server actions pre-configured with your adapter
 * 
 * @param config - Next auth configuration
 * @returns Server auth client with all methods
 * 
 * @example
 * ```ts
 * // lib/auth-server.ts
 * import { createServerAuthClient } from '@authsome/ui-next';
 * import { authsomeAdapter } from '@authsome/ui-adapter-authsome';
 * 
 * export const authServer = createServerAuthClient({
 *   adapter: authsomeAdapter({ apiKey: process.env.AUTHSOME_API_KEY! }),
 *   session: { password: process.env.SESSION_SECRET! },
 * });
 * 
 * // Then use in Server Components or Server Actions:
 * const session = await authServer.getSession();
 * const result = await authServer.signIn({ email, password });
 * ```
 */
export function createServerAuthClient(config: NextAuthConfig) {
  const { adapter, session: sessionConfig, callbacks, pages } = config;

  return {
    // ============================================
    // Authentication Methods
    // ============================================

    /**
     * Sign in a user
     */
    async signIn(data: SignInRequest, cookieStore?: CookieStore): Promise<ActionResult> {
      try {
        const response = await adapter.signIn(data);
        await setServerSession(response.user, response.session, sessionConfig, cookieStore);

        const redirectUrl = callbacks?.signIn
          ? await callbacks.signIn(response.user, response.session)
          : '/';

        return {
          success: true,
          data: response,
          redirect: redirectUrl,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Sign in failed',
        };
      }
    },

    /**
     * Sign up a new user
     */
    async signUp(data: SignUpRequest, cookieStore?: CookieStore): Promise<ActionResult> {
      try {
        const response = await adapter.signUp(data);
        await setServerSession(response.user, response.session, sessionConfig, cookieStore);

        const redirectUrl = callbacks?.signIn
          ? await callbacks.signIn(response.user, response.session)
          : '/';

        return {
          success: true,
          data: response,
          redirect: redirectUrl,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Sign up failed',
        };
      }
    },

    /**
     * Sign out the current user
     */
    async signOut(cookieStore?: CookieStore): Promise<ActionResult> {
      try {
        await adapter.signOut();
        await clearServerSession(sessionConfig, cookieStore);

        const redirectUrl = callbacks?.signOut
          ? await callbacks.signOut()
          : pages?.signIn || '/auth/signin';

        return {
          success: true,
          redirect: redirectUrl,
        };
      } catch (error: any) {
        await clearServerSession(sessionConfig, cookieStore);

        return {
          success: false,
          error: error.message || 'Sign out failed',
        };
      }
    },

    // ============================================
    // Session Methods
    // ============================================

    /**
     * Get the current session
     */
    async getSession(cookieStore?: CookieStore): Promise<Session | null> {
      return getServerSession(adapter, sessionConfig, cookieStore);
    },

    /**
     * Get the current user
     */
    async getUser(cookieStore?: CookieStore): Promise<User | null> {
      return getServerUser(adapter, sessionConfig, cookieStore);
    },

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(cookieStore?: CookieStore): Promise<boolean> {
      return isAuthenticated(adapter, sessionConfig, cookieStore);
    },

    /**
     * Require authentication (throws if not authenticated)
     */
    async requireAuth(cookieStore?: CookieStore): Promise<{ user: User; session: Session }> {
      return requireAuth(adapter, sessionConfig, cookieStore);
    },

    /**
     * Refresh the current session
     */
    async refreshSession(cookieStore?: CookieStore): Promise<ActionResult> {
      try {
        const session = await refreshServerSession(adapter, sessionConfig, cookieStore);

        if (!session) {
          return {
            success: false,
            error: 'Session refresh failed',
          };
        }

        return {
          success: true,
          data: { session },
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Session refresh failed',
        };
      }
    },

    // ============================================
    // Magic Link
    // ============================================

    /**
     * Send a magic link
     */
    async sendMagicLink(data: MagicLinkRequest): Promise<ActionResult> {
      try {
        await adapter.sendMagicLink(data);

        return {
          success: true,
          data: { message: 'Magic link sent successfully' },
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to send magic link',
        };
      }
    },

    // ============================================
    // Phone Auth
    // ============================================

    /**
     * Send a phone verification code
     */
    async sendPhoneCode(data: PhoneAuthRequest): Promise<ActionResult> {
      try {
        await adapter.sendPhoneCode(data);

        return {
          success: true,
          data: { message: 'Verification code sent successfully' },
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to send verification code',
        };
      }
    },

    /**
     * Verify a phone code
     */
    async verifyPhoneCode(data: PhoneVerifyRequest, cookieStore?: CookieStore): Promise<ActionResult> {
      try {
        const response = await adapter.verifyPhoneCode(data);
        await setServerSession(response.user, response.session, sessionConfig, cookieStore);

        const redirectUrl = callbacks?.signIn
          ? await callbacks.signIn(response.user, response.session)
          : '/';

        return {
          success: true,
          data: response,
          redirect: redirectUrl,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Phone verification failed',
        };
      }
    },

    // ============================================
    // Two-Factor Authentication
    // ============================================

    /**
     * Verify a two-factor code
     */
    async verifyTwoFactor(data: TwoFactorVerifyRequest, cookieStore?: CookieStore): Promise<ActionResult> {
      try {
        const response = await adapter.verifyTwoFactor(data);
        await setServerSession(response.user, response.session, sessionConfig, cookieStore);

        const redirectUrl = callbacks?.signIn
          ? await callbacks.signIn(response.user, response.session)
          : '/';

        return {
          success: true,
          data: response,
          redirect: redirectUrl,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Two-factor verification failed',
        };
      }
    },

    // ============================================
    // Password Management
    // ============================================

    /**
     * Request a password reset
     */
    async requestPasswordReset(data: PasswordResetRequest): Promise<ActionResult> {
      try {
        await adapter.requestPasswordReset(data);

        return {
          success: true,
          data: { message: 'Password reset email sent' },
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to send password reset',
        };
      }
    },

    /**
     * Confirm a password reset
     */
    async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<ActionResult> {
      try {
        await adapter.confirmPasswordReset(data);

        return {
          success: true,
          data: { message: 'Password reset successful' },
          redirect: pages?.signIn || '/auth/signin',
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Password reset failed',
        };
      }
    },

    /**
     * Change password
     */
    async changePassword(data: PasswordChangeRequest): Promise<ActionResult> {
      try {
        await adapter.changePassword(data);

        return {
          success: true,
          data: { message: 'Password changed successfully' },
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Password change failed',
        };
      }
    },

    // ============================================
    // Passkey
    // ============================================

    /**
     * Authenticate with a passkey
     */
    async authenticatePasskey(data: PasskeyAuthRequest, cookieStore?: CookieStore): Promise<ActionResult> {
      try {
        const response = await adapter.authenticatePasskey(data);
        await setServerSession(response.user, response.session, sessionConfig, cookieStore);

        const redirectUrl = callbacks?.signIn
          ? await callbacks.signIn(response.user, response.session)
          : '/';

        return {
          success: true,
          data: response,
          redirect: redirectUrl,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Passkey authentication failed',
        };
      }
    },

    // ============================================
    // OAuth
    // ============================================

    /**
     * Get available OAuth providers
     */
    async getOAuthProviders(): Promise<ActionResult> {
      try {
        const providers = await adapter.getOAuthProviders();

        return {
          success: true,
          data: { providers },
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to get OAuth providers',
        };
      }
    },

    // ============================================
    // Access to raw adapter and config
    // ============================================

    /**
     * Access the underlying adapter
     */
    get adapter() {
      return adapter;
    },

    /**
     * Access the configuration
     */
    get config() {
      return config;
    },
  };
}

/**
 * Type for the server auth client
 */
export type ServerAuthClient = ReturnType<typeof createServerAuthClient>;

