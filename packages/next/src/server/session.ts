/**
 * Server-side session management
 * Integrates cookie storage with auth provider validation
 */

import { cookies } from 'next/headers';
import type { AuthProvider, Session, User, RequestContext } from '@authsome/ui-core';
import type { SessionConfig } from '../types';
import {
  getSessionData,
  setSessionCookie,
  deleteSessionCookie,
  refreshSessionCookie,
  isSessionExpired,
} from './cookies';
import { DEFAULT_SESSION_CONFIG } from '../lib/constants';

/**
 * Type for the cookie store returned by Next.js cookies()
 */
type CookieStore = Awaited<ReturnType<typeof cookies>>;

/**
 * Set adapter context from cookie store
 * Extracts all cookies and sets them on the adapter for API calls
 */
function setAdapterContext(adapter: AuthProvider, cookieStore: CookieStore): void {
  if (!adapter) {
    console.error('[setAdapterContext] Adapter is undefined');
    return;
  }

  if (!adapter.setContext) {
    console.log('[setAdapterContext] Adapter does not support setContext');
    return;
  }

  // Extract all cookies from the cookie store
  const allCookies = cookieStore.getAll();
  const cookiesMap: Record<string, string> = {};
  
  for (const cookie of allCookies) {
    cookiesMap[cookie.name] = cookie.value;
  }

  console.log('[setAdapterContext] Setting context with cookies:', Object.keys(cookiesMap));

  // Build request context with cookies
  const context: RequestContext = {
    url: '', // Not relevant for server-side calls
    method: 'GET',
    headers: {},
    cookies: cookiesMap,
  };

  adapter.setContext(context);
  console.log('[setAdapterContext] Context set successfully');
}

/**
 * Clear adapter context
 */
function clearAdapterContext(adapter: AuthProvider): void {
  if (!adapter) {
    console.error('[clearAdapterContext] Adapter is undefined');
    return;
  }

  if (adapter.clearContext) {
    adapter.clearContext();
  }
}

/**
 * Get server-side session
 * Validates session with adapter if needed
 * 
 * @param adapter - Auth provider adapter
 * @param config - Session configuration
 * @param cookieStore - Optional cookie store from next/headers cookies()
 * @returns Session or null if not authenticated
 */
export async function getServerSession(
  adapter: AuthProvider,
  config?: SessionConfig,
  cookieStore?: CookieStore
): Promise<Session | null> {
  try {
    // Get or create cookie store
    const store = cookieStore || await cookies();
    const strategy = config?.strategy || DEFAULT_SESSION_CONFIG.strategy;
    
    // Set adapter context with all cookies for API calls
    setAdapterContext(adapter, store);

    try {
      // Get session data from adapter (like middleware does)
      const sessionData = await adapter.getCurrentSessionData();

      if (!sessionData) {
        clearAdapterContext(adapter);
        return null;
      }

      // Only manage iron-session cookies if strategy is 'cookie'
      if (strategy === 'cookie') {
        if (isSessionExpired(sessionData)) {
          await deleteSessionCookie(config, store);
          clearAdapterContext(adapter);
          return null;
        }
        // Only write cookie in cookie mode (NOT on every read)
        const existingSession = await getSessionData(config, store);
        if (!existingSession) {
          await setServerSession(sessionData.user, sessionData.session, config, store);
        }
      }

      clearAdapterContext(adapter);
      return sessionData.session;
    } catch (error) {
      // Fallback to cookie only if strategy is 'cookie'
      console.error('Error getting session from adapter, falling back to cookie:', error);
      clearAdapterContext(adapter);
      
      if (strategy === 'cookie') {
        const sessionData = await getSessionData(config, store);
        if (!sessionData || isSessionExpired(sessionData)) {
          if (sessionData) await deleteSessionCookie(config, store);
          return null;
        }
        return sessionData.session;
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error getting server session:', error);
    clearAdapterContext(adapter);
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
 * @param cookieStore - Optional cookie store from next/headers cookies()
 */
export async function setServerSession(
  user: User,
  session: Session,
  config?: SessionConfig,
  cookieStore?: CookieStore
): Promise<void> {
  await setSessionCookie(user, session, config, cookieStore);
}

/**
 * Clear server-side session
 * Removes session cookie
 * 
 * @param config - Session configuration
 * @param cookieStore - Optional cookie store from next/headers cookies()
 */
export async function clearServerSession(
  config?: SessionConfig,
  cookieStore?: CookieStore
): Promise<void> {
  await deleteSessionCookie(config, cookieStore);
}

/**
 * Get current user from session
 * 
 * @param adapter - Auth provider adapter
 * @param config - Session configuration
 * @param cookieStore - Optional cookie store from next/headers cookies()
 * @returns User or null if not authenticated
 */
export async function getServerUser(
  adapter: AuthProvider,
  config?: SessionConfig,
  cookieStore?: CookieStore
): Promise<User | null> {
  try {
    // Get or create cookie store
    const store = cookieStore || await cookies();
    const strategy = config?.strategy || DEFAULT_SESSION_CONFIG.strategy;
    
    console.log('[getServerUser] Cookie store obtained, cookies count:', store.getAll().length);
    
    // Set adapter context with cookies for API calls
    setAdapterContext(adapter, store);
    
    try {
      // Get session data from adapter (like middleware does)
      console.log('[getServerUser] Calling adapter.getCurrentSessionData()...');
      const sessionData = await adapter.getCurrentSessionData();
      console.log('[getServerUser] Session data from adapter:', sessionData ? 'FOUND' : 'NULL');
      
      if (!sessionData) {
        clearAdapterContext(adapter);
        return null;
      }

      // Only manage iron-session cookies if strategy is 'cookie'
      if (strategy === 'cookie') {
        if (isSessionExpired(sessionData)) {
          await deleteSessionCookie(config, store);
          clearAdapterContext(adapter);
          return null;
        }
      }

      clearAdapterContext(adapter);
      return sessionData.user;
    } catch (error) {
      // Fallback to cookie only if strategy is 'cookie'
      console.error('Error getting user from adapter, falling back to cookie:', error);
      clearAdapterContext(adapter);
      
      if (strategy === 'cookie') {
        const sessionData = await getSessionData(config, store);
        if (!sessionData || isSessionExpired(sessionData)) {
          if (sessionData) await deleteSessionCookie(config, store);
          return null;
        }
        return sessionData.user;
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error getting server user:', error);
    clearAdapterContext(adapter);
    return null;
  }
}

/**
 * Refresh server session
 * Updates expiration time and validates with adapter
 * 
 * @param adapter - Auth provider adapter
 * @param config - Session configuration
 * @param cookieStore - Optional cookie store from next/headers cookies()
 * @returns Refreshed session or null
 */
export async function refreshServerSession(
  adapter: AuthProvider,
  config?: SessionConfig,
  cookieStore?: CookieStore
): Promise<Session | null> {
  try {
    // Get or create cookie store
    const store = cookieStore || await cookies();
    const strategy = config?.strategy || DEFAULT_SESSION_CONFIG.strategy;
    
    // Only check cookie session in 'cookie' mode
    if (strategy === 'cookie') {
      const sessionData = await getSessionData(config, store);
      if (!sessionData) {
        return null;
      }
    }

    // Set adapter context with all cookies for API calls
    setAdapterContext(adapter, store);

    // Try to refresh session with adapter
    try {
      const refreshedSession = await adapter.refreshSession();
      const currentUser = await adapter.getCurrentUser();

      if (refreshedSession && currentUser) {
        // Only write to cookie in 'cookie' mode
        if (strategy === 'cookie') {
          await setServerSession(currentUser, refreshedSession, config, store);
        }
        clearAdapterContext(adapter);
        return refreshedSession;
      }
    } catch (error) {
      // If refresh fails in 'cookie' mode, check if current session is still valid
      if (strategy === 'cookie') {
        const sessionData = await getSessionData(config, store);
        if (sessionData && !isSessionExpired(sessionData)) {
          await refreshSessionCookie(config, store);
          clearAdapterContext(adapter);
          return sessionData.session;
        }
      }
    }

    // Session could not be refreshed
    if (strategy === 'cookie') {
      await clearServerSession(config, store);
    }
    clearAdapterContext(adapter);
    return null;
  } catch (error) {
    console.error('Error refreshing server session:', error);
    clearAdapterContext(adapter);
    return null;
  }
}

/**
 * Check if user is authenticated
 * 
 * @param adapter - Auth provider adapter
 * @param config - Session configuration
 * @param cookieStore - Optional cookie store from next/headers cookies()
 * @returns True if authenticated
 */
export async function isAuthenticated(
  adapter: AuthProvider,
  config?: SessionConfig,
  cookieStore?: CookieStore
): Promise<boolean> {
  // Get or create cookie store
  const store = cookieStore || await cookies();
  const session = await getServerSession(adapter, config, store);
  return session !== null;
}

/**
 * Require authentication
 * Throws error if not authenticated
 * 
 * @param adapter - Auth provider adapter
 * @param config - Session configuration
 * @param cookieStore - Optional cookie store from next/headers cookies()
 * @returns Session
 * @throws Error if not authenticated
 */
export async function requireAuth(
  adapter: AuthProvider,
  config?: SessionConfig,
  cookieStore?: CookieStore
): Promise<{ user: User; session: Session }> {
  // Get or create cookie store
  const store = cookieStore || await cookies();
  const strategy = config?.strategy || DEFAULT_SESSION_CONFIG.strategy;
  
  // In 'adapter' mode, get session from adapter directly
  if (strategy === 'adapter') {
    setAdapterContext(adapter, store);
    try {
      const sessionData = await adapter.getCurrentSessionData();
      clearAdapterContext(adapter);
      
      if (!sessionData) {
        throw new Error('Authentication required');
      }
      
      return {
        user: sessionData.user,
        session: sessionData.session,
      };
    } catch (error) {
      clearAdapterContext(adapter);
      throw new Error('Authentication required');
    }
  }
  
  // In 'cookie' mode, check cookie storage
  const sessionData = await getSessionData(config, store);

  if (!sessionData) {
    throw new Error('Authentication required');
  }

  if (isSessionExpired(sessionData)) {
    await deleteSessionCookie(config, store);
    throw new Error('Session expired');
  }

  return {
    user: sessionData.user,
    session: sessionData.session,
  };
}

