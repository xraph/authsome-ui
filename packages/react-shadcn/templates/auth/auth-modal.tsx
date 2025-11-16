'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignInForm } from './sign-in-form';
import { SignUpForm } from './sign-up-form';
import { OAuthButtons } from './oauth-buttons';
import { Separator } from '@/components/ui/separator';
import type { OAuthProvider } from '@authsome/ui-core';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  defaultTab?: 'signin' | 'signup';
  oauthProviders?: OAuthProvider[];
  showOAuth?: boolean;
  redirectUri?: string;
}

export function AuthModal({
  open,
  onOpenChange,
  onSuccess,
  onError,
  defaultTab = 'signin',
  oauthProviders,
  showOAuth = true,
  redirectUri,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-4">
            <SignInForm
              onSuccess={handleSuccess}
              onError={onError}
            />

            {showOAuth && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <OAuthButtons
                  providers={oauthProviders}
                  redirectUri={redirectUri}
                  onError={onError}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            <SignUpForm
              onSuccess={handleSuccess}
              onError={onError}
            />

            {showOAuth && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <OAuthButtons
                  providers={oauthProviders}
                  redirectUri={redirectUri}
                  onError={onError}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

