/**
 * Next.js Auth types and configuration interfaces
 */

import type {
  AuthProvider,
  User,
  Session,
  AuthError,
} from '@authsome/ui-core';
import type { UIComponents, RendererConfig } from '@authsome/ui-react';

/**
 * Authentication route types
 */
export type AuthRoute = 'signin' | 'signup' | 'callback' | 'signout' | 'error' | 'verify';

/**
 * Parsed route information from catch-all segments
 */
export interface ParsedAuthRoute {
  type: AuthRoute;
  provider?: string;
  segments: string[];
}

/**
 * Session configuration
 */
export interface SessionConfig {
  /**
   * Cookie name for session storage
   * @default 'authsome.session'
   */
  cookieName?: string;

  /**
   * Session max age in seconds
   * @default 2592000 (30 days)
   */
  maxAge?: number;

  /**
   * Use secure cookies (HTTPS only)
   * @default process.env.NODE_ENV === 'production'
   */
  secure?: boolean;

  /**
   * Cookie path
   * @default '/'
   */
  path?: string;

  /**
   * Cookie domain
   */
  domain?: string;

  /**
   * SameSite cookie attribute
   * @default 'lax'
   */
  sameSite?: 'strict' | 'lax' | 'none';

  /**
   * Session encryption password (32+ characters)
   * Falls back to process.env.SESSION_SECRET
   */
  password?: string;
}

/**
 * Page route configuration
 */
export interface PageConfig {
  /**
   * Sign in page path
   * @default '/auth/signin'
   */
  signIn?: string;

  /**
   * Sign up page path
   * @default '/auth/signup'
   */
  signUp?: string;

  /**
   * Error page path
   * @default '/auth/error'
   */
  error?: string;

  /**
   * Verification page path
   * @default '/auth/verify'
   */
  verify?: string;
}

/**
 * Callback functions for auth events
 */
export interface AuthCallbacks {
  /**
   * Called after successful sign in
   * Return a URL to redirect to
   */
  signIn?: (user: User, session: Session) => string | Promise<string>;

  /**
   * Called after sign out
   * Return a URL to redirect to
   */
  signOut?: () => string | Promise<string>;

  /**
   * Called when an error occurs
   * Return a URL to redirect to
   */
  error?: (error: AuthError) => string | Promise<string>;

  /**
   * Called before OAuth redirect
   * Can modify the OAuth URL
   */
  beforeOAuth?: (url: string, provider: string) => string | Promise<string>;

  /**
   * Called after OAuth callback
   * Return a URL to redirect to
   */
  afterOAuth?: (user: User, session: Session, provider: string) => string | Promise<string>;
}

/**
 * Main Next.js Auth configuration
 */
export interface NextAuthConfig {
  /**
   * Auth provider adapter
   */
  adapter: AuthProvider;

  /**
   * Base path for auth routes
   * @default '/auth'
   */
  basePath?: string;

  /**
   * Page route configuration
   */
  pages?: PageConfig;

  /**
   * Callback functions
   */
  callbacks?: AuthCallbacks;

  /**
   * Session configuration
   */
  session?: SessionConfig;

  /**
   * UI components for auth flows
   */
  uiComponents?: UIComponents;

  /**
   * Renderer configuration
   */
  rendererConfig?: RendererConfig;
}

/**
 * Middleware configuration
 */
export interface MiddlewareConfig {
  /**
   * Auth provider adapter
   */
  adapter: AuthProvider;

  /**
   * Base path for auth routes
   * @default '/auth'
   */
  basePath?: string;

  /**
   * Routes accessible without authentication
   * Supports wildcards: /api/public/*
   * @default []
   */
  publicRoutes?: string[];

  /**
   * Auth pages (redirect if already logged in)
   * @default ['/auth/signin', '/auth/signup']
   */
  authRoutes?: string[];

  /**
   * Redirect URL after successful authentication
   * @default '/'
   */
  afterAuthRedirect?: string;

  /**
   * Redirect URL after sign out
   * @default '/auth/signin'
   */
  afterSignOutRedirect?: string;

  /**
   * Session configuration (must match NextAuthConfig session)
   */
  session?: SessionConfig;

  /**
   * Page configuration (must match NextAuthConfig pages)
   */
  pages?: PageConfig;

  /**
   * Custom callback to determine if route requires auth
   * Return true if route requires authentication
   */
  requiresAuth?: (pathname: string) => boolean | Promise<boolean>;
}

/**
 * Server action result
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  redirect?: string;
}

/**
 * Auth flow client props
 */
export interface AuthFlowClientProps {
  route: ParsedAuthRoute;
  initialSession: Session | null;
  config: NextAuthConfig;
  searchParams?: Record<string, string | string[]>;
}

/**
 * Protected route props
 */
export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Session data stored in cookie
 */
export interface SessionData {
  user: User;
  session: Session;
  expiresAt: number;
}

/**
 * OAuth callback query params
 */
export interface OAuthCallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
  provider?: string;
}

/**
 * Redirect validation result
 */
export interface RedirectValidation {
  isValid: boolean;
  sanitizedUrl: string;
  error?: string;
}

/**
 * Auth sync options
 */
export interface AuthSyncOptions {
  /**
   * Poll interval in milliseconds
   * @default 60000 (1 minute)
   */
  pollInterval?: number;

  /**
   * Enable session polling
   * @default true
   */
  enablePolling?: boolean;

  /**
   * Callback when session changes
   */
  onSessionChange?: (session: Session | null) => void;

  /**
   * Callback when session expires
   */
  onSessionExpire?: () => void;
}

