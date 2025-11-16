/**
 * useUser hook
 * 
 * Convenient hook for accessing the current user
 */

import { useAuth } from './useAuth';
import type { User } from '@authsome/ui-core';

/**
 * Get current user
 * 
 * @returns Current user or null if not authenticated
 */
export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}

