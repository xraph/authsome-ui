/**
 * Cookie utilities for encrypted session storage
 * Uses iron-session for secure cookie encryption
 */

import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { SessionConfig, SessionData } from '../types';
import type { Session, User } from '@authsome/ui-core';
import { DEFAULT_SESSION_CONFIG, MIN_PASSWORD_LENGTH, ERROR_MESSAGES } from '../lib/constants';

/**
 * Type for the cookie store returned by Next.js cookies()
 */
type CookieStore = Awaited<ReturnType<typeof cookies>>;

/**
 * Get session encryption password
 * Falls back to environment variable
 */
function getSessionPassword(config?: SessionConfig): string {
  const password = config?.password || process.env.SESSION_SECRET;

  if (!password) {
    throw new Error(ERROR_MESSAGES.NO_SESSION_PASSWORD);
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(ERROR_MESSAGES.NO_SESSION_PASSWORD);
  }

  return password;
}

/**
 * Get iron-session configuration
 */
function getIronSessionConfig(config?: SessionConfig) {
  const password = getSessionPassword(config);

  return {
    password,
    cookieName: config?.cookieName || DEFAULT_SESSION_CONFIG.cookieName,
    cookieOptions: {
      secure: config?.secure ?? DEFAULT_SESSION_CONFIG.secure,
      httpOnly: true,
      sameSite: config?.sameSite || DEFAULT_SESSION_CONFIG.sameSite,
      path: config?.path || DEFAULT_SESSION_CONFIG.path,
      maxAge: config?.maxAge || DEFAULT_SESSION_CONFIG.maxAge,
      ...(config?.domain && { domain: config.domain }),
    },
  };
}

/**
 * Get encrypted session from cookie
 * 
 * @param config - Session configuration
 * @param cookieStore - Optional cookie store from next/headers cookies()
 * @returns Iron session instance
 */
export async function getSessionCookie(
  config?: SessionConfig,
  cookieStore?: CookieStore
): Promise<IronSession<SessionData>> {
  const ironConfig = getIronSessionConfig(config);
  const store = cookieStore || await cookies();
  return getIronSession<SessionData>(store, ironConfig);
}

/**
 * Set encrypted session cookie
 * 
 * @param user - User object
 * @param session - Session object
 * @param config - Session configuration
 * @param cookieStore - Optional cookie store from next/headers cookies()
 */
export async function setSessionCookie(
  user: User,
  session: Session,
  config?: SessionConfig,
  cookieStore?: CookieStore
): Promise<void> {
  const ironSession = await getSessionCookie(config, cookieStore);
  
  // Calculate expiration time
  const maxAge = config?.maxAge || DEFAULT_SESSION_CONFIG.maxAge;
  const expiresAt = Date.now() + (maxAge * 1000);

  // Store session data
  ironSession.user = user;
  ironSession.session = session;
  ironSession.expiresAt = expiresAt;

  await ironSession.save();
}

/**
 * Delete session cookie
 * 
 * @param config - Session configuration
 * @param cookieStore - Optional cookie store from next/headers cookies()
 */
export async function deleteSessionCookie(
  config?: SessionConfig,
  cookieStore?: CookieStore
): Promise<void> {
  const ironSession = await getSessionCookie(config, cookieStore);
  ironSession.destroy();
}

/**
 * Check if session is expired
 * 
 * @param sessionData - Session data from cookie
 * @returns True if session is expired
 */
export function isSessionExpired(sessionData: SessionData | null): boolean {
  if (!sessionData || !sessionData.expiresAt) {
    return true;
  }

  return Date.now() >= sessionData.expiresAt;
}

/**
 * Get session data from cookie
 * Returns null if no session or expired
 * 
 * @param config - Session configuration
 * @param cookieStore - Optional cookie store from next/headers cookies()
 * @returns Session data or null
 */
export async function getSessionData(
  config?: SessionConfig,
  cookieStore?: CookieStore
): Promise<SessionData | null> {
  try {
    const ironSession = await getSessionCookie(config, cookieStore);
    
    // Check if session exists
    if (!ironSession.user || !ironSession.session) {
      return null;
    }

    const sessionData: SessionData = {
      user: ironSession.user,
      session: ironSession.session,
      expiresAt: ironSession.expiresAt,
    };

    // Check if expired
    if (isSessionExpired(sessionData)) {
      // Clean up expired session
      await deleteSessionCookie(config, cookieStore);
      return null;
    }

    return sessionData;
  } catch (error) {
    // Session parsing error, return null
    return null;
  }
}

/**
 * Update session expiration time
 * Useful for "remember me" functionality
 * 
 * @param config - Session configuration
 * @param cookieStore - Optional cookie store from next/headers cookies()
 */
export async function refreshSessionCookie(
  config?: SessionConfig,
  cookieStore?: CookieStore
): Promise<void> {
  const sessionData = await getSessionData(config, cookieStore);
  
  if (!sessionData) {
    return;
  }

  // Update expiration time
  await setSessionCookie(sessionData.user, sessionData.session, config, cookieStore);
}

