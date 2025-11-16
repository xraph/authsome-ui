/**
 * ProfileMenu - Headless user profile menu
 */

import React, { useState } from 'react';
import { useUser, useSignOut } from '@authsome/ui-react';

export interface ProfileMenuProps {
  onSignOut?: () => void;
  children: (props: ProfileMenuRenderProps) => React.ReactNode;
}

export interface ProfileMenuRenderProps {
  user: ReturnType<typeof useUser>;
  isOpen: boolean;
  isSigningOut: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  signOut: () => Promise<void>;
}

/**
 * Headless profile menu component
 */
export function ProfileMenu({ onSignOut, children }: ProfileMenuProps) {
  const user = useUser();
  const { signOut, isLoading } = useSignOut();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    onSignOut?.();
  };

  return (
    <>
      {children({
        user,
        isOpen,
        isSigningOut: isLoading,
        toggle: () => setIsOpen(!isOpen),
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        signOut: handleSignOut,
      })}
    </>
  );
}

