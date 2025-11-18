/**
 * @authsome/ui-next
 * Next.js integration for AuthSome UI
 */

// Components
export { NextAuthProvider } from './components/NextAuthProvider';
export { AuthFlowClient } from './components/AuthFlowClient';
export { ProtectedRoute } from './components/ProtectedRoute';

// Hooks
export { useAuthSync, useSessionRefresh } from './hooks/useAuthSync';
export { useProtectedRoute, useRequirePermissions } from './hooks/useProtectedRoute';

// Constants (safe for client)
export {
  DEFAULT_BASE_PATH,
  DEFAULT_PAGES,
  DEFAULT_SESSION_CONFIG,
  DEFAULT_AFTER_AUTH_REDIRECT,
  DEFAULT_AFTER_SIGNOUT_REDIRECT,
  DEFAULT_AUTH_ROUTES,
  DEFAULT_PUBLIC_ROUTES,
  DEFAULT_POLL_INTERVAL,
  ERROR_MESSAGES,
} from './lib/constants';

// Types
export type {
  NextAuthConfig,
  NextAuthProviderProps,
  MiddlewareConfig,
  SessionConfig,
  PageConfig,
  AuthCallbacks,
  AuthRoute,
  ParsedAuthRoute,
  ActionResult,
  AuthFlowClientProps,
  ProtectedRouteProps,
  SessionData,
  OAuthCallbackParams,
  RedirectValidation,
  AuthSyncOptions,
} from './types';

// Re-export core types for convenience
export type {
  AuthProvider,
  User,
  Session,
  AuthError,
  AuthState,
  OAuthProvider,
} from '@authsome/ui-core';

