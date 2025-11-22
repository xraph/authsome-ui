/**
 * Middleware exports
 */

export {
  createAuthMiddleware,
  createAuthMiddlewareWithHandler,
  isPublicRoute,
  isAuthRoute,
  isConfiguredAuthRoute,
  shouldProcessRequest,
  normalizePath,
} from './authMiddleware';

export {
  getSessionFromRequest,
  isAuthenticated,
} from './edge-session';

export type { MiddlewareConfig } from '../types';

