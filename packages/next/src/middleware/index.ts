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

export type { MiddlewareConfig } from '../types';

