/**
 * Cookie utility functions
 * Framework-agnostic helpers for cookie parsing and serialization
 */

import type { CookieData } from '../types';

/**
 * Parse Set-Cookie header value into CookieData
 * @param setCookieHeader - The Set-Cookie header value
 * @returns Parsed cookie data
 */
export function parseCookie(setCookieHeader: string): CookieData | null {
  if (!setCookieHeader) return null;

  const parts = setCookieHeader.split(';').map(p => p.trim());
  if (parts.length === 0) return null;

  const [nameValue] = parts;
  const [name, value] = nameValue.split('=');
  if (!name || value === undefined) return null;

  const cookieData: CookieData = { name, value };

  // Parse options
  const options: CookieData['options'] = {};
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const lowerPart = part.toLowerCase();
    
    if (lowerPart === 'httponly') {
      options.httpOnly = true;
    } else if (lowerPart === 'secure') {
      options.secure = true;
    } else if (lowerPart.startsWith('path=')) {
      options.path = part.substring(5);
    } else if (lowerPart.startsWith('domain=')) {
      options.domain = part.substring(7);
    } else if (lowerPart.startsWith('max-age=')) {
      const maxAge = parseInt(part.substring(8), 10);
      if (!isNaN(maxAge)) {
        options.maxAge = maxAge;
      }
    } else if (lowerPart.startsWith('expires=')) {
      const expiresStr = part.substring(8);
      const expiresDate = new Date(expiresStr);
      if (!isNaN(expiresDate.getTime())) {
        options.expires = expiresDate;
      }
    } else if (lowerPart.startsWith('samesite=')) {
      const sameSiteValue = lowerPart.substring(9);
      if (sameSiteValue === 'strict' || sameSiteValue === 'lax' || sameSiteValue === 'none') {
        options.sameSite = sameSiteValue;
      }
    }
  }

  if (Object.keys(options).length > 0) {
    cookieData.options = options;
  }

  return cookieData;
}

/**
 * Extract multiple cookies from Set-Cookie headers
 * @param setCookieHeaders - Array of Set-Cookie header values or single string
 * @returns Array of parsed cookies
 */
export function extractCookiesFromHeaders(setCookieHeaders: string | string[]): CookieData[] {
  const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  const cookies: CookieData[] = [];

  for (const header of headers) {
    const cookie = parseCookie(header);
    if (cookie) {
      cookies.push(cookie);
    }
  }

  return cookies;
}

/**
 * Serialize a CookieData object into a Set-Cookie header value
 * @param cookie - The cookie data to serialize
 * @returns Set-Cookie header value
 */
export function serializeCookie(cookie: CookieData): string {
  const parts: string[] = [`${cookie.name}=${cookie.value}`];

  if (cookie.options) {
    const opts = cookie.options;

    if (opts.path) {
      parts.push(`Path=${opts.path}`);
    }

    if (opts.domain) {
      parts.push(`Domain=${opts.domain}`);
    }

    if (opts.expires) {
      parts.push(`Expires=${opts.expires.toUTCString()}`);
    }

    if (opts.maxAge !== undefined) {
      parts.push(`Max-Age=${opts.maxAge}`);
    }

    if (opts.httpOnly) {
      parts.push('HttpOnly');
    }

    if (opts.secure) {
      parts.push('Secure');
    }

    if (opts.sameSite) {
      const sameSite = opts.sameSite.charAt(0).toUpperCase() + opts.sameSite.slice(1);
      parts.push(`SameSite=${sameSite}`);
    }
  }

  return parts.join('; ');
}

/**
 * Parse Cookie header value into key-value pairs
 * @param cookieHeader - The Cookie header value
 * @returns Object with cookie name-value pairs
 */
export function parseCookieOptions(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) return cookies;

  const pairs = cookieHeader.split(';').map(p => p.trim());
  for (const pair of pairs) {
    const [name, value] = pair.split('=');
    if (name && value !== undefined) {
      cookies[name.trim()] = value.trim();
    }
  }

  return cookies;
}

/**
 * Convert cookie object to Cookie header string
 * @param cookies - Object with cookie name-value pairs
 * @returns Cookie header value
 */
export function serializeCookies(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
}

