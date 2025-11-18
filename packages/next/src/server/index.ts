/**
 * Server-only exports
 * Import from '@authsome/ui-next/server' in server components, server actions, and API routes
 * 
 * ⚠️ DO NOT import these in client components!
 */

// Runtime check to prevent client-side imports
if (typeof window !== 'undefined') {
  throw new Error(
    '@authsome/ui-next/server can only be imported in Server Components, Server Actions, or API Routes. ' +
    'Use @authsome/ui-next for client-side imports instead.'
  );
}

// Server client (recommended)
export { createServerAuthClient, type ServerAuthClient } from './client';

// Session management
export {
  getServerSession,
  setServerSession,
  clearServerSession,
  getServerUser,
  refreshServerSession,
  isAuthenticated,
  requireAuth,
} from './session';

// Server actions
export {
  initializeServerActions,
  signInAction,
  signUpAction,
  signOutAction,
  getSessionAction,
  refreshSessionAction,
  sendMagicLinkAction,
  sendPhoneCodeAction,
  verifyPhoneCodeAction,
  verifyTwoFactorAction,
  requestPasswordResetAction,
  confirmPasswordResetAction,
  changePasswordAction,
  authenticatePasskeyAction,
  getOAuthProvidersAction,
} from './actions';

// OAuth handling
export {
  handleOAuthCallback,
  buildOAuthState,
  initiateOAuth,
} from './callback-handler';

// Cookie utilities
export {
  getSessionCookie,
  setSessionCookie,
  deleteSessionCookie,
  getSessionData,
  refreshSessionCookie,
  isSessionExpired,
} from './cookies';

// Route helpers
export {
  createOAuthCallbackHandler,
  getAuthPageProps,
  createAuthMetadata,
} from '../lib/route-helpers';

// Route utilities
export {
  parseAuthRoute,
  extractOAuthProvider,
  buildAuthUrl,
  isAuthPath,
  extractCallbackUrl,
} from '../lib/route-parser';

// Redirect utilities
export {
  validateRedirectUrl,
  getRedirectUrl,
  buildRedirectUrl,
  extractValidCallbackUrl,
} from '../lib/redirect-manager';

// Middleware
export {
  createAuthMiddleware,
  createAuthMiddlewareWithHandler,
  isPublicRoute,
  isAuthRoute,
  isConfiguredAuthRoute,
  shouldProcessRequest,
  normalizePath,
} from '../middleware';

// Types
export type { SessionData, ActionResult } from '../types';

