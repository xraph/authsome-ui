/**
 * Server actions for authentication
 * Can be called from Client Components
 */

'use server';

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
  AuthProvider,
} from '@authsome/ui-core';
import type { ActionResult, SessionConfig, NextAuthConfig } from '../types';
import {
  setServerSession,
  clearServerSession,
  getServerSession,
  refreshServerSession,
  getServerUser,
} from './session';

// Global config storage (set by createAuthActions)
let globalAdapter: AuthProvider | null = null;
let globalConfig: NextAuthConfig | null = null;

/**
 * Initialize server actions with config
 * Must be called before using actions
 */
export function initializeServerActions(config: NextAuthConfig) {
  globalAdapter = config.adapter;
  globalConfig = config;
}

/**
 * Get adapter instance
 */
function getAdapter(): AuthProvider {
  if (!globalAdapter) {
    throw new Error('Server actions not initialized. Call initializeServerActions first.');
  }
  return globalAdapter;
}

/**
 * Get session config
 */
function getSessionConfig(): SessionConfig | undefined {
  return globalConfig?.session;
}

/**
 * Sign in action
 */
export async function signInAction(data: SignInRequest): Promise<ActionResult> {
  try {
    const adapter = getAdapter();
    const response = await adapter.signIn(data);

    // Store session
    await setServerSession(response.user, response.session, getSessionConfig());

    // Get redirect URL from callback
    const redirectUrl = globalConfig?.callbacks?.signIn
      ? await globalConfig.callbacks.signIn(response.user, response.session)
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
}

/**
 * Sign up action
 */
export async function signUpAction(data: SignUpRequest): Promise<ActionResult> {
  try {
    const adapter = getAdapter();
    const response = await adapter.signUp(data);

    // Store session
    await setServerSession(response.user, response.session, getSessionConfig());

    // Get redirect URL from callback
    const redirectUrl = globalConfig?.callbacks?.signIn
      ? await globalConfig.callbacks.signIn(response.user, response.session)
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
}

/**
 * Sign out action
 */
export async function signOutAction(): Promise<ActionResult> {
  try {
    const adapter = getAdapter();
    await adapter.signOut();

    // Clear session
    await clearServerSession(getSessionConfig());

    // Get redirect URL from callback
    const redirectUrl = globalConfig?.callbacks?.signOut
      ? await globalConfig.callbacks.signOut()
      : globalConfig?.pages?.signIn || '/auth/signin';

    return {
      success: true,
      redirect: redirectUrl,
    };
  } catch (error: any) {
    // Clear session anyway
    await clearServerSession(getSessionConfig());

    return {
      success: false,
      error: error.message || 'Sign out failed',
    };
  }
}

/**
 * Get session action
 */
export async function getSessionAction(): Promise<ActionResult> {
  try {
    const adapter = getAdapter();
    const session = await getServerSession(adapter, getSessionConfig());

    if (!session) {
      return {
        success: false,
        data: null,
      };
    }

    const user = await getServerUser(adapter, getSessionConfig());

    return {
      success: true,
      data: { session, user },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get session',
    };
  }
}

/**
 * Refresh session action
 */
export async function refreshSessionAction(): Promise<ActionResult> {
  try {
    const adapter = getAdapter();
    const session = await refreshServerSession(adapter, getSessionConfig());

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
}

/**
 * Send magic link action
 */
export async function sendMagicLinkAction(data: MagicLinkRequest): Promise<ActionResult> {
  try {
    const adapter = getAdapter();
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
}

/**
 * Send phone code action
 */
export async function sendPhoneCodeAction(data: PhoneAuthRequest): Promise<ActionResult> {
  try {
    const adapter = getAdapter();
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
}

/**
 * Verify phone code action
 */
export async function verifyPhoneCodeAction(data: PhoneVerifyRequest): Promise<ActionResult> {
  try {
    const adapter = getAdapter();
    const response = await adapter.verifyPhoneCode(data);

    // Store session
    await setServerSession(response.user, response.session, getSessionConfig());

    const redirectUrl = globalConfig?.callbacks?.signIn
      ? await globalConfig.callbacks.signIn(response.user, response.session)
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
}

/**
 * Verify two-factor code action
 */
export async function verifyTwoFactorAction(data: TwoFactorVerifyRequest): Promise<ActionResult> {
  try {
    const adapter = getAdapter();
    const response = await adapter.verifyTwoFactor(data);

    // Store session
    await setServerSession(response.user, response.session, getSessionConfig());

    const redirectUrl = globalConfig?.callbacks?.signIn
      ? await globalConfig.callbacks.signIn(response.user, response.session)
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
}

/**
 * Request password reset action
 */
export async function requestPasswordResetAction(data: PasswordResetRequest): Promise<ActionResult> {
  try {
    const adapter = getAdapter();
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
}

/**
 * Confirm password reset action
 */
export async function confirmPasswordResetAction(data: PasswordResetConfirmRequest): Promise<ActionResult> {
  try {
    const adapter = getAdapter();
    await adapter.confirmPasswordReset(data);

    return {
      success: true,
      data: { message: 'Password reset successful' },
      redirect: globalConfig?.pages?.signIn || '/auth/signin',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Password reset failed',
    };
  }
}

/**
 * Change password action
 */
export async function changePasswordAction(data: PasswordChangeRequest): Promise<ActionResult> {
  try {
    const adapter = getAdapter();
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
}

/**
 * Authenticate with passkey action
 */
export async function authenticatePasskeyAction(data: PasskeyAuthRequest): Promise<ActionResult> {
  try {
    const adapter = getAdapter();
    const response = await adapter.authenticatePasskey(data);

    // Store session
    await setServerSession(response.user, response.session, getSessionConfig());

    const redirectUrl = globalConfig?.callbacks?.signIn
      ? await globalConfig.callbacks.signIn(response.user, response.session)
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
}

/**
 * Get OAuth providers action
 */
export async function getOAuthProvidersAction(): Promise<ActionResult> {
  try {
    const adapter = getAdapter();
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
}

