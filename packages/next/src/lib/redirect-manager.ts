/**
 * Redirect manager for post-auth navigation
 * Handles validation and sanitization of redirect URLs
 */

import type { RedirectValidation } from '../types';
import { ERROR_MESSAGES } from './constants';

/**
 * Validate and sanitize redirect URL
 * Prevents open redirect vulnerabilities
 * 
 * Rules:
 * 1. Must be a relative path (starts with /)
 * 2. OR must be same origin as current request
 * 3. Cannot contain protocol (http://, https://, etc.)
 * 4. Cannot contain @ symbol (username in URL)
 * 
 * @param url - URL to validate
 * @param currentOrigin - Current request origin for same-origin check
 * @returns Validation result with sanitized URL
 */
export function validateRedirectUrl(
  url: string | undefined | null,
  currentOrigin?: string
): RedirectValidation {
  // Empty or null URL is invalid
  if (!url || url.trim() === '') {
    return {
      isValid: false,
      sanitizedUrl: '/',
      error: 'Empty redirect URL',
    };
  }

  const trimmedUrl = url.trim();

  // Check for protocol - must not be present for relative URLs
  if (trimmedUrl.includes('://')) {
    // If protocol is present, must be same origin
    try {
      const urlObj = new URL(trimmedUrl);
      
      // Check if same origin
      if (currentOrigin && urlObj.origin === currentOrigin) {
        return {
          isValid: true,
          sanitizedUrl: urlObj.pathname + urlObj.search + urlObj.hash,
        };
      }

      return {
        isValid: false,
        sanitizedUrl: '/',
        error: ERROR_MESSAGES.INVALID_REDIRECT,
      };
    } catch {
      return {
        isValid: false,
        sanitizedUrl: '/',
        error: 'Invalid URL format',
      };
    }
  }

  // Check for @ symbol (username in URL)
  if (trimmedUrl.includes('@')) {
    return {
      isValid: false,
      sanitizedUrl: '/',
      error: 'URL cannot contain @ symbol',
    };
  }

  // Must start with / for relative paths
  if (!trimmedUrl.startsWith('/')) {
    return {
      isValid: false,
      sanitizedUrl: '/',
      error: 'Redirect URL must start with /',
    };
  }

  // Check for double slashes (protocol-relative URLs)
  if (trimmedUrl.startsWith('//')) {
    return {
      isValid: false,
      sanitizedUrl: '/',
      error: 'Protocol-relative URLs not allowed',
    };
  }

  return {
    isValid: true,
    sanitizedUrl: trimmedUrl,
  };
}

/**
 * Get redirect URL from various sources
 * Priority: callback parameter > configured URL > default
 * 
 * @param callbackUrl - Callback URL from query params
 * @param configuredUrl - Configured redirect URL
 * @param defaultUrl - Default fallback URL
 * @param currentOrigin - Current request origin for validation
 * @returns Validated and sanitized redirect URL
 */
export function getRedirectUrl(
  callbackUrl: string | undefined,
  configuredUrl?: string,
  defaultUrl: string = '/',
  currentOrigin?: string
): string {
  // Priority 1: Callback URL from query params
  if (callbackUrl) {
    const validation = validateRedirectUrl(callbackUrl, currentOrigin);
    if (validation.isValid) {
      return validation.sanitizedUrl;
    }
  }

  // Priority 2: Configured URL
  if (configuredUrl) {
    const validation = validateRedirectUrl(configuredUrl, currentOrigin);
    if (validation.isValid) {
      return validation.sanitizedUrl;
    }
  }

  // Priority 3: Default URL
  const validation = validateRedirectUrl(defaultUrl, currentOrigin);
  return validation.sanitizedUrl;
}

/**
 * Build redirect URL with query params
 * 
 * @param basePath - Base path
 * @param params - Query parameters
 * @returns URL with query params
 */
export function buildRedirectUrl(
  basePath: string,
  params?: Record<string, string>
): string {
  if (!params || Object.keys(params).length === 0) {
    return basePath;
  }

  const searchParams = new URLSearchParams(params);
  return `${basePath}?${searchParams.toString()}`;
}

/**
 * Extract and validate callback URL from Next.js searchParams
 * 
 * @param searchParams - Next.js searchParams object
 * @param currentOrigin - Current request origin
 * @returns Validated callback URL or undefined
 */
export function extractValidCallbackUrl(
  searchParams: Record<string, string | string[] | undefined> | URLSearchParams | undefined,
  currentOrigin?: string
): string | undefined {
  if (!searchParams) {
    return undefined;
  }

  let callbackUrl: string | undefined;

  if (searchParams instanceof URLSearchParams) {
    callbackUrl = searchParams.get('callbackUrl') || searchParams.get('redirectTo') || undefined;
  } else {
    const cb = searchParams.callbackUrl || searchParams.redirectTo;
    callbackUrl = typeof cb === 'string' ? cb : undefined;
  }

  if (!callbackUrl) {
    return undefined;
  }

  const validation = validateRedirectUrl(callbackUrl, currentOrigin);
  return validation.isValid ? validation.sanitizedUrl : undefined;
}

