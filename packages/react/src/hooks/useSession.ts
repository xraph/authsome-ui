/**
 * useSession hook
 * 
 * Convenient hook for accessing the current session
 */

import { useAuth } from './useAuth';
import type { Session } from '@authsome/ui-core';

/**
 * Get current session
 * 
 * @returns Current session or null if not authenticated
 */
export function useSession(): Session | null {
  const { session } = useAuth();
  return session;
}

