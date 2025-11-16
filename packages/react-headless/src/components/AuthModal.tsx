/**
 * AuthModal - Headless modal wrapper for auth flows
 */

import React from 'react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: (props: AuthModalRenderProps) => React.ReactNode;
}

export interface AuthModalRenderProps {
  isOpen: boolean;
  close: () => void;
}

/**
 * Headless auth modal component
 * 
 * Provides open/close state management without any styling
 */
export function AuthModal({ isOpen, onClose, children }: AuthModalProps) {
  return (
    <>
      {children({
        isOpen,
        close: onClose,
      })}
    </>
  );
}

