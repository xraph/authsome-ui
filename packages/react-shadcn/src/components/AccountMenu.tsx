/**
 * AccountMenu component
 * 
 * Full account management dropdown menu
 * Shows user info, organization, and account actions
 */

import React, { useState } from 'react';
import { useAuth, useOrganization } from '@authsome/ui-react';

export interface AccountAction {
  label: string;
  description?: string;
  onClick: () => void;
  icon?: React.ReactNode;
  badge?: string;
}

export interface AccountMenuProps {
  /**
   * Show organizations section
   */
  showOrganizations?: boolean;
  
  /**
   * Custom account actions
   */
  customActions?: AccountAction[];
  
  /**
   * Callback when sign out is clicked
   */
  onSignOut?: () => void;
  
  /**
   * Callback when organization switcher is clicked
   */
  onOrganizationSwitcherClick?: () => void;
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Trigger element (button content)
   */
  trigger?: React.ReactNode;
}

/**
 * Comprehensive account management menu
 * 
 * @example
 * ```tsx
 * <AccountMenu
 *   showOrganizations
 *   customActions={[
 *     {
 *       label: 'Enable 2FA',
 *       description: 'Add extra security',
 *       onClick: () => router.push('/security'),
 *       badge: 'Recommended'
 *     }
 *   ]}
 * />
 * ```
 */
export function AccountMenu({
  showOrganizations = true,
  customActions = [],
  onSignOut,
  onOrganizationSwitcherClick,
  className = '',
  trigger,
}: AccountMenuProps) {
  const { user, signOut, isAuthenticated } = useAuth();
  const { 
    activeOrganization, 
    organizations, 
    isSupported: orgSupported 
  } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleSignOut = async () => {
    setIsOpen(false);
    if (onSignOut) {
      onSignOut();
    } else if (signOut) {
      await signOut();
    }
  };

  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  const defaultTrigger = (
    <button
      type="button"
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name || user.email || 'User'}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
          {getInitials()}
        </div>
      )}
      <span className="font-medium">Account</span>
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  return (
    <div className={`relative ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || defaultTrigger}
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 z-50 mt-2 w-[320px] rounded-md border bg-popover text-popover-foreground shadow-lg">
            {/* User Info Section */}
            <div className="p-4 border-b">
              <div className="flex items-start gap-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || user.email || 'User'}
                    className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-medium flex-shrink-0">
                    {getInitials()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {user.name && (
                    <div className="font-semibold text-base truncate">{user.name}</div>
                  )}
                  {user.email && (
                    <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                  )}
                  {user.id && (
                    <div className="text-xs text-muted-foreground mt-1 font-mono truncate">
                      ID: {user.id.slice(0, 12)}...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Organization Section */}
            {showOrganizations && orgSupported && organizations.length > 0 && (
              <div className="p-2 border-b">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                  Organization
                </div>
                {activeOrganization ? (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOrganizationSwitcherClick?.();
                    }}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-sm hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {activeOrganization.logoUrl ? (
                        <img 
                          src={activeOrganization.logoUrl} 
                          alt={activeOrganization.name}
                          className="h-5 w-5 rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {activeOrganization.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium truncate">{activeOrganization.name}</span>
                    </div>
                    <svg className="h-4 w-4 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <div className="px-2 py-2 text-sm text-muted-foreground">
                    No active organization
                  </div>
                )}
              </div>
            )}

            {/* Custom Actions */}
            {customActions.length > 0 && (
              <div className="p-2 border-b">
                {customActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsOpen(false);
                      action.onClick();
                    }}
                    className="w-full flex items-start gap-3 px-2 py-2 rounded-sm hover:bg-accent transition-colors text-left"
                  >
                    {action.icon && (
                      <span className="flex-shrink-0 mt-0.5">{action.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{action.label}</span>
                        {action.badge && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            {action.badge}
                          </span>
                        )}
                      </div>
                      {action.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {action.description}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Account Status */}
            <div className="p-2 border-b">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                Account Status
              </div>
              <div className="px-2 py-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Email</span>
                  {user.emailVerified ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="text-amber-600">Not verified</span>
                  )}
                </div>
                {user.phone && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Phone</span>
                    {user.phoneVerified ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <span className="text-amber-600">Not verified</span>
                    )}
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sign Out */}
            <div className="p-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-sm hover:bg-destructive/10 hover:text-destructive transition-colors text-destructive"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

