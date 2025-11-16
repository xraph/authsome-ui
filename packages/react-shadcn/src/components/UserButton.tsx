/**
 * UserButton component
 * 
 * User avatar/menu button (Clerk-style)
 * Shows user avatar, email, and account actions
 */

import React, { useState } from 'react';
import { useAuth, useOrganization } from '@authsome/ui-react';

export interface UserButtonMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
}

export interface UserButtonProps {
  /**
   * Show user email in the button
   */
  showEmail?: boolean;
  
  /**
   * Custom menu items to add before default items
   */
  customMenuItems?: UserButtonMenuItem[];
  
  /**
   * Callback when sign out is clicked
   */
  onSignOut?: () => void;
  
  /**
   * Callback when profile is clicked
   */
  onProfileClick?: () => void;
  
  /**
   * Callback when settings is clicked
   */
  onSettingsClick?: () => void;
  
  /**
   * Show organization in menu (if supported)
   */
  showOrganization?: boolean;
  
  /**
   * Custom className
   */
  className?: string;
}

/**
 * User avatar button with dropdown menu
 * 
 * @example
 * ```tsx
 * <UserButton
 *   showEmail
 *   showOrganization
 *   onProfileClick={() => router.push('/profile')}
 *   onSignOut={() => router.push('/')}
 * />
 * ```
 */
export function UserButton({
  showEmail = false,
  customMenuItems = [],
  onSignOut,
  onProfileClick,
  onSettingsClick,
  showOrganization = true,
  className = '',
}: UserButtonProps) {
  const { user, signOut, isAuthenticated } = useAuth();
  const { activeOrganization, isSupported: orgSupported } = useOrganization();
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

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {/* Avatar */}
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
        
        {/* Optional email display */}
        {showEmail && user.email && (
          <span className="text-sm font-medium hidden sm:inline">{user.email}</span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 z-50 mt-2 w-[280px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
            {/* User Info Section */}
            <div className="px-2 py-3 border-b">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || user.email || 'User'}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {getInitials()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {user.name && (
                    <div className="font-medium text-sm truncate">{user.name}</div>
                  )}
                  {user.email && (
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  )}
                </div>
              </div>
              
              {/* Active Organization */}
              {showOrganization && orgSupported && activeOrganization && (
                <div className="mt-2 px-2 py-1.5 rounded-md bg-accent/50 text-xs">
                  <div className="text-muted-foreground">Organization</div>
                  <div className="font-medium flex items-center gap-1 mt-0.5">
                    {activeOrganization.logoUrl ? (
                      <img 
                        src={activeOrganization.logoUrl} 
                        alt={activeOrganization.name}
                        className="h-3 w-3 rounded"
                      />
                    ) : (
                      <div className="h-3 w-3 rounded bg-primary/10" />
                    )}
                    <span className="truncate">{activeOrganization.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Menu Items */}
            {customMenuItems.length > 0 && (
              <>
                {customMenuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsOpen(false);
                      item.onClick();
                    }}
                    className={`
                      relative flex w-full cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors
                      hover:bg-accent hover:text-accent-foreground
                      ${item.destructive ? 'text-destructive hover:text-destructive' : ''}
                    `}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </button>
                ))}
                <div className="my-1 h-px bg-border" />
              </>
            )}

            {/* Default Menu Items */}
            {onProfileClick && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onProfileClick();
                }}
                className="relative flex w-full cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
            )}

            {onSettingsClick && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSettingsClick();
                }}
                className="relative flex w-full cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            )}

            {/* Sign Out */}
            <div className="my-1 h-px bg-border" />
            <button
              onClick={handleSignOut}
              className="relative flex w-full cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-destructive hover:text-destructive"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

