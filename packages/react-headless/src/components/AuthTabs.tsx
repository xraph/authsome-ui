/**
 * AuthTabs - Headless tabbed interface for auth flows
 */

import React, { useState } from 'react';

export type AuthTab = 'signin' | 'signup';

export interface AuthTabsProps {
  defaultTab?: AuthTab;
  onTabChange?: (tab: AuthTab) => void;
  children: (props: AuthTabsRenderProps) => React.ReactNode;
}

export interface AuthTabsRenderProps {
  activeTab: AuthTab;
  setActiveTab: (tab: AuthTab) => void;
  isSignIn: boolean;
  isSignUp: boolean;
}

/**
 * Headless auth tabs component
 */
export function AuthTabs({ defaultTab = 'signin', onTabChange, children }: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <>
      {children({
        activeTab,
        setActiveTab: handleTabChange,
        isSignIn: activeTab === 'signin',
        isSignUp: activeTab === 'signup',
      })}
    </>
  );
}

