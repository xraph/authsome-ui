/**
 * OrganizationSwitcher component
 * 
 * Dropdown component for switching between organizations
 * Compatible with Clerk-style organization management
 */

import React, { useState } from 'react';
import { useOrganization } from '@authsome/ui-react';
import type { Organization } from '@authsome/ui-core';

export interface OrganizationSwitcherProps {
  /**
   * Callback when organization is switched
   */
  onSwitch?: (organization: Organization) => void;
  
  /**
   * Show create organization button
   */
  showCreateButton?: boolean;
  
  /**
   * Callback when create button is clicked
   */
  onCreateClick?: () => void;
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Trigger content customization
   */
  triggerContent?: (activeOrg: Organization | null) => React.ReactNode;
}

/**
 * Organization switcher dropdown component
 * 
 * @example
 * ```tsx
 * <OrganizationSwitcher
 *   onSwitch={(org) => console.log('Switched to:', org.name)}
 *   showCreateButton
 *   onCreateClick={() => router.push('/create-org')}
 * />
 * ```
 */
export function OrganizationSwitcher({
  onSwitch,
  showCreateButton = false,
  onCreateClick,
  className = '',
  triggerContent,
}: OrganizationSwitcherProps) {
  const { 
    organizations, 
    activeOrganization, 
    setActiveOrganization, 
    isSupported 
  } = useOrganization();
  
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if organizations aren't supported
  if (!isSupported) {
    return null;
  }

  const handleSwitch = async (org: Organization) => {
    if (setActiveOrganization) {
      try {
        await setActiveOrganization(org.id);
        setIsOpen(false);
        
        if (onSwitch) {
          onSwitch(org);
        }
      } catch (error) {
        console.error('[OrganizationSwitcher] Failed to switch organization:', error);
      }
    }
  };

  const renderTrigger = () => {
    if (triggerContent) {
      return triggerContent(activeOrganization);
    }

    return (
      <div className="flex items-center gap-2">
        {activeOrganization?.logoUrl ? (
          <img 
            src={activeOrganization.logoUrl} 
            alt={activeOrganization.name}
            className="h-6 w-6 rounded"
          />
        ) : (
          <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-xs font-medium">
            {activeOrganization?.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="font-medium text-sm">{activeOrganization?.name || 'Select Organization'}</span>
        <svg 
          className="h-4 w-4 opacity-50" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {renderTrigger()}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute z-50 mt-2 w-full min-w-[200px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
            {/* Current organization section */}
            {activeOrganization && (
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Active Organization
              </div>
            )}

            {/* Organization list */}
            <div className="max-h-[300px] overflow-y-auto">
              {organizations.length === 0 ? (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No organizations found
                </div>
              ) : (
                organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSwitch(org)}
                    className={`
                      relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors
                      hover:bg-accent hover:text-accent-foreground
                      ${org.id === activeOrganization?.id ? 'bg-accent text-accent-foreground' : ''}
                    `}
                  >
                    {org.logoUrl ? (
                      <img 
                        src={org.logoUrl} 
                        alt={org.name}
                        className="mr-2 h-5 w-5 rounded"
                      />
                    ) : (
                      <div className="mr-2 h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="flex-1 text-left">{org.name}</span>
                    {org.id === activeOrganization?.id && (
                      <svg 
                        className="h-4 w-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Create organization button */}
            {showCreateButton && onCreateClick && (
              <>
                <div className="my-1 h-px bg-border" />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onCreateClick();
                  }}
                  className="relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <svg 
                    className="mr-2 h-4 w-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Organization
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

