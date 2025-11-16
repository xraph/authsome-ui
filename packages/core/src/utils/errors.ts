/**
 * Error handling utilities
 */

import { AuthError, AuthErrorType } from '../types';

/**
 * Create an auth error
 * 
 * @deprecated Use `new AuthError()` directly instead
 */
export function createAuthError(
  type: AuthErrorType,
  message: string,
  details?: Record<string, unknown>,
  code?: string | number
): AuthError {
  return new AuthError(message, type, { details, code });
}

/**
 * Check if an error is an auth error
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

/**
 * Convert unknown error to auth error
 */
export function toAuthError(error: unknown): AuthError {
  if (isAuthError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AuthError(error.message, AuthErrorType.UNKNOWN_ERROR, {
      details: {
        originalError: error.name,
        stack: error.stack,
      },
    });
  }

  if (typeof error === 'string') {
    return new AuthError(error, AuthErrorType.UNKNOWN_ERROR);
  }

  return new AuthError(
    'An unknown error occurred',
    AuthErrorType.UNKNOWN_ERROR,
    { details: { error } }
  );
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'NetworkError' ||
      error.message.includes('network') ||
      error.message.includes('fetch')
    );
  }
  return false;
}

/**
 * Check if error indicates authentication is required
 */
export function isUnauthenticatedError(error: unknown): boolean {
  if (isAuthError(error)) {
    return (
      error.type === AuthErrorType.INVALID_TOKEN ||
      error.type === AuthErrorType.TOKEN_EXPIRED
    );
  }
  return false;
}

/**
 * Check if error requires MFA
 */
export function isMFARequiredError(error: unknown): boolean {
  if (isAuthError(error)) {
    return error.type === AuthErrorType.MFA_REQUIRED;
  }
  return false;
}
