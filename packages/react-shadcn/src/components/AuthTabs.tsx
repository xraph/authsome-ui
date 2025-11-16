/**
 * Styled AuthTabs using shadcn/ui
 */

import React from 'react';
import { AuthTabs as HeadlessAuthTabs } from '@authsome/ui-react-headless';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { cn } from '../lib/utils';

export interface AuthTabsProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  defaultTab?: 'signin' | 'signup';
  showSignIn?: boolean;
  showSignUp?: boolean;
}

export function AuthTabs({
  onSuccess,
  onError,
  className,
  defaultTab = 'signin',
  showSignIn = true,
  showSignUp = true,
}: AuthTabsProps) {
  return (
    <HeadlessAuthTabs defaultTab={defaultTab}>
      {({ activeTab, setActiveTab }) => (
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}
          className={cn('w-full max-w-md', className)}
        >
          <TabsList className="grid w-full grid-cols-2">
            {showSignIn && <TabsTrigger value="signin">Sign In</TabsTrigger>}
            {showSignUp && <TabsTrigger value="signup">Sign Up</TabsTrigger>}
          </TabsList>

          {showSignIn && (
            <TabsContent value="signin">
              <SignInForm
                onSuccess={onSuccess}
                onError={onError}
                title=""
                description=""
                className="border-0 shadow-none"
              />
            </TabsContent>
          )}

          {showSignUp && (
            <TabsContent value="signup">
              <SignUpForm
                onSuccess={onSuccess}
                onError={onError}
                title=""
                description=""
                className="border-0 shadow-none"
              />
            </TabsContent>
          )}
        </Tabs>
      )}
    </HeadlessAuthTabs>
  );
}

