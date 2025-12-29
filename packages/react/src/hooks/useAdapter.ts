/**
 * useAdapter hook
 * 
 * Hook for getting the adapter instance
 */

import { useAuth } from './useAuth';
import type {
  AuthProvider,
} from '@authsome/ui-core';

/**
 * Hook for magic link authentication
 */
export function useAdapter<T extends AuthProvider>(): T {
  const { client } = useAuth();
  const adapter = client.adapter as T;
 
  return adapter;
}

