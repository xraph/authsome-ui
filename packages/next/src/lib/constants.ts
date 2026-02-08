/**
 * Default constants for Next.js Auth
 */

export const DEFAULT_BASE_PATH = '/auth';

export const DEFAULT_PAGES = {
  signIn: '/auth/signin',
  signUp: '/auth/signup',
  error: '/auth/error',
  verify: '/auth/verify',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  verifyEmail: '/auth/verify-email',
  cliLogin: '/auth/cli-login',
} as const;

export const DEFAULT_SESSION_CONFIG = {
  strategy: 'adapter' as const, // Default to adapter-managed
  cookieName: 'authsome.session',
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  sameSite: 'lax' as const,
};

export const DEFAULT_AFTER_AUTH_REDIRECT = '/';
export const DEFAULT_AFTER_SIGNOUT_REDIRECT = '/auth/signin';

export const DEFAULT_AUTH_ROUTES = [
  '/auth/signin', 
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
];

export const DEFAULT_PUBLIC_ROUTES: string[] = [];

export const DEFAULT_POLL_INTERVAL = 60000; // 1 minute

/**
 * Session encryption password minimum length
 */
export const MIN_PASSWORD_LENGTH = 32;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NO_SESSION_PASSWORD: 'Session password must be at least 32 characters. Set SESSION_SECRET environment variable or provide session.password in config.',
  INVALID_ADAPTER: 'Invalid adapter provided. Must implement AuthProvider interface.',
  NO_ADAPTER: 'No adapter provided. Please provide an adapter in the NextAuthConfig.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  INVALID_REDIRECT: 'Invalid redirect URL. Must be a relative path or same origin.',
  NO_PROVIDER: 'No OAuth provider specified.',
  CALLBACK_ERROR: 'OAuth callback error occurred.',
} as const;

