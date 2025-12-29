/**
 * Next.js Auth types and configuration interfaces
 */

import type {
  AuthProvider,
  User,
  Session,
  FlowConfig,
  FlowState,
  AuthLocale,
  DeepPartial,
  Organization,
  CookieData,
} from '@authsome/ui-core';
import { AuthError } from '@authsome/ui-core';
import type { UIComponents, RendererConfig } from '@authsome/ui-react';

/**
 * Authentication route types
 */
export type AuthRoute = 'signin' | 'signup' | 'callback' | 'signout' | 'error' | 'verify' | 'forgot-password' | 'reset-password' | 'verify-email';

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
   * Session storage strategy
   * - 'adapter': Adapter manages all cookies (e.g., AuthSome)
   * - 'cookie': Use local iron-session encrypted cookies
   * @default 'adapter'
   */
  strategy?: 'adapter' | 'cookie';

  /**
   * Cookie name for session storage
   * @default 'authsome.session'
   */
  cookieName?: string;

  /**
   * Cookie name for adapter session storage
   * @default 'authsome_session'
   * 
   * This is the cookie name used by the adapter to store the session data.
   * It is different from the cookie name used by the middleware to store the session data.
   * The adapter cookie name is used to store the session data in the database.
   * The middleware cookie name is used to store the session data in the cookie.
   * 
   * The adapter cookie name is used to store the session data in the database.
   * The middleware cookie name is used to store the session data in the cookie.
   */
  adapterCookieName?: string;

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

  /**
   * Forgot password page path
   * @default '/auth/forgot-password'
   */
  forgotPassword?: string;

  /**
   * Reset password page path
   * @default '/auth/reset-password'
   */
  resetPassword?: string;

  /**
   * Email verification page path
   * @default '/auth/verify-email'
   */
  verifyEmail?: string;
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

  /**
   * Flow configuration (defaults to predefinedFlows)
   */
  flows?: FlowConfig;

  /**
   * Initial flow state
   */
  initialFlowState?: Partial<FlowState>;

  /**
   * Locale configuration for internationalization
   */
  locale?: DeepPartial<AuthLocale>;

  /**
   * Callback when flow state changes
   */
  onFlowStateChange?: (state: FlowState) => void;

  /**
   * Callback when organization changes
   */
  onOrganizationChange?: (org: Organization | null) => void;
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
 * 
 * Note: config is now provided via NextAuthProvider context,
 * not as a prop to AuthFlowClient.
 * 
 * @property route - Parsed authentication route information
 * @property initialSession - Initial session data from server (if available)
 * @property searchParams - URL search parameters for error handling and state
 * 
 * ### Error Handling
 * 
 * When the route type is 'error', the component will extract error information
 * from searchParams and display it using the ErrorRenderer component.
 * 
 * Supported error search parameters:
 * - `error`: Main error message (required)
 * - `error_description`: Detailed error description (optional, overrides error)
 * - `error_type`: Error type matching AuthErrorType enum values (optional)
 * - `error_code`: Error code for reference (optional)
 * 
 * @example
 * ```
 * // OAuth callback failure redirects to:
 * /auth/error?error=Failed%20to%20handle%20OAuth%20callback
 * 
 * // With detailed description:
 * /auth/error?error=oauth_failed&error_description=Provider%20returned%20invalid%20state
 * 
 * // With error type:
 * /auth/error?error=Invalid%20credentials&error_type=invalid_credentials
 * ```
 */
export interface AuthFlowClientProps {
  route: ParsedAuthRoute;
  initialSession: Session | null;
  searchParams?: Record<string, string | string[]>;
}

/**
 * Next.js Auth Provider props
 */
export interface NextAuthProviderProps {
  /**
   * Next.js auth configuration
   */
  config: NextAuthConfig;

  /**
   * Child components
   */
  children: React.ReactNode;
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
 * Re-exported from @authsome/ui-core for convenience
 */
export type { SessionData } from '@authsome/ui-core';

/**
 * Cookie data for forwarding adapter cookies
 * Re-exported from @authsome/ui-core for convenience
 */
export type { CookieData } from '@authsome/ui-core';

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
 * OAuth callback result
 * Returned by handleOAuthCallback with redirect URL and optional cookies
 */
export interface OAuthCallbackResult {
  success: boolean;
  redirect: string;
  error?: string;
  cookies?: CookieData[];
  rawSetCookieHeaders?: string[];
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
   * @default false (disabled for adapter-managed sessions)
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

