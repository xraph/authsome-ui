/**
 * useOrganization hook
 * 
 * Provides access to organization-related functionality
 * Only works with adapters that support organizations (e.g., Clerk)
 */

import { useAuth } from './useAuth';
import type { Organization } from '@authsome/ui-core';

export interface UseOrganizationReturn {
  /**
   * List of organizations the user belongs to
   */
  organizations: Organization[];
  
  /**
   * Currently active organization
   */
  activeOrganization: Organization | null;
  
  /**
   * Switch to a different organization
   */
  setActiveOrganization?: (organizationId: string) => Promise<void>;
  
  /**
   * Get all organizations (refreshes the list)
   */
  getOrganizations?: () => Promise<Organization[]>;
  
  /**
   * Get the active organization (refreshes)
   */
  getActiveOrganization?: () => Promise<Organization | null>;
  
  /**
   * Whether the current adapter supports organizations
   */
  isSupported: boolean;
  
  /**
   * Whether organizations are currently loading
   */
  isLoading: boolean;
}

/**
 * Hook for accessing organization data and methods
 * 
 * @example
 * ```tsx
 * function OrganizationSwitcher() {
 *   const { 
 *     organizations, 
 *     activeOrganization, 
 *     setActiveOrganization,
 *     isSupported 
 *   } = useOrganization();
 *   
 *   if (!isSupported) {
 *     return null; // Provider doesn't support organizations
 *   }
 *   
 *   return (
 *     <select 
 *       value={activeOrganization?.id} 
 *       onChange={(e) => setActiveOrganization?.(e.target.value)}
 *     >
 *       {organizations.map(org => (
 *         <option key={org.id} value={org.id}>
 *           {org.name}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useOrganization(): UseOrganizationReturn {
  const auth = useAuth();
  
  return {
    organizations: auth.organizations || [],
    activeOrganization: auth.activeOrganization || null,
    setActiveOrganization: auth.setActiveOrganization,
    getOrganizations: auth.getOrganizations,
    getActiveOrganization: auth.getActiveOrganization,
    isSupported: auth.supportsOrganizations || false,
    isLoading: auth.isLoading,
  };
}

