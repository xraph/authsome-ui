/**
 * Server-side session management
 * Integrates cookie storage with auth provider validation
 */

import type { AuthProvider, Session, User } from '@authsome/ui-core';
import type { SessionConfig } from '../types';
import {
  getSessionData,
  setSessionCookie,
  deleteSessionCookie,
  refreshSessionCookie,
  isSessionExpired,
} from './cookies';

/**
 * Get server-side session
 * Validates session with adapter if needed
 * 
 * @param adapter - Auth provider adapter
 * @param config - Session configuration
 * @returns Session or null if not authenticated
 */
export async function getServerSession(
  adapter: AuthProvider,
  config?: SessionConfig
): Promise<Session | null> {
  try {
    const sessionData = await getSessionData(config);

    // No session in cookie
    if (!sessionData) {
      return null;
    }

    // Check if session is expired
    if (isSessionExpired(sessionData)) {
      await deleteSessionCookie(config);
      return null;
    }

    // Optionally validate session with adapter
    // This ensures the session is still valid on the backend
    try {
      const currentSession = await adapter.getCurrentSession();
      
      // If adapter returns null, session is invalid
      if (!currentSession) {
        await deleteSessionCookie(config);
        return null;
      }

      // Update cookie if session token changed
      if (currentSession.token !== sessionData.session.token) {
        const currentUser = await adapter.getCurrentUser();
        if (currentUser) {
          await setServerSession(currentUser, currentSession, config);
        }
        return currentSession;
      }

      return sessionData.session;
    } catch (error) {
      // If adapter validation fails, try to use cached session
      // This allows offline tolerance
      return sessionData.session;
    }
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

/**
 * Set server-side session
 * Stores session in encrypted cookie
 * 
 * @param user - User object
 * @param session - Session object
 * @param config - Session configuration
 */
export async function setServerSession(
  user: User,
  session: Session,
  config?: SessionConfig
): Promise<void> {
  await setSessionCookie(user, session, config);
}

/**
 * Clear server-side session
 * Removes session cookie
 * 
 * @param config - Session configuration
 */
export async function clearServerSession(config?: SessionConfig): Promise<void> {
  await deleteSessionCookie(config);
}

/**
 * Get current user from session
 * 
 * @param adapter - Auth provider adapter
 * @param config - Session configuration
 * @returns User or null if not authenticated
 */
export async function getServerUser(
  _adapter: AuthProvider,
  config?: SessionConfig
): Promise<User | null> {
  try {
    const sessionData = await getSessionData(config);

    if (!sessionData) {
      return null;
    }

    if (isSessionExpired(sessionData)) {
      await deleteSessionCookie(config);
      return null;
    }

    return sessionData.user;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

/**
 * Refresh server session
 * Updates expiration time and validates with adapter
 * 
 * @param adapter - Auth provider adapter
 * @param config - Session configuration
 * @returns Refreshed session or null
 */
export async function refreshServerSession(
  adapter: AuthProvider,
  config?: SessionConfig
): Promise<Session | null> {
  try {
    const sessionData = await getSessionData(config);

    if (!sessionData) {
      return null;
    }

    // Try to refresh session with adapter
    try {
      const refreshedSession = await adapter.refreshSession();
      const currentUser = await adapter.getCurrentUser();

      if (refreshedSession && currentUser) {
        await setServerSession(currentUser, refreshedSession, config);
        return refreshedSession;
      }
    } catch (error) {
      // If refresh fails, check if current session is still valid
      if (!isSessionExpired(sessionData)) {
        await refreshSessionCookie(config);
        return sessionData.session;
      }
    }

    // Session could not be refreshed
    await clearServerSession(config);
    return null;
  } catch (error) {
    console.error('Error refreshing server session:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * 
 * @param adapter - Auth provider adapter
 * @param config - Session configuration
 * @returns True if authenticated
 */
export async function isAuthenticated(
  adapter: AuthProvider,
  config?: SessionConfig
): Promise<boolean> {
  const session = await getServerSession(adapter, config);
  return session !== null;
}

/**
 * Require authentication
 * Throws error if not authenticated
 * 
 * @param adapter - Auth provider adapter
 * @param config - Session configuration
 * @returns Session
 * @throws Error if not authenticated
 */
export async function requireAuth(
  _adapter: AuthProvider,
  config?: SessionConfig
): Promise<{ user: User; session: Session }> {
  const sessionData = await getSessionData(config);

  if (!sessionData) {
    throw new Error('Authentication required');
  }

  if (isSessionExpired(sessionData)) {
    await deleteSessionCookie(config);
    throw new Error('Session expired');
  }

  return {
    user: sessionData.user,
    session: sessionData.session,
  };
}

