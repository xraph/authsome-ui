'use client';

import { SignInForm } from './sign-in-form';
import { SignUpForm } from './sign-up-form';
import { OAuthButtons } from './oauth-buttons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import type { OAuthProvider } from '@authsome/ui-core';

interface AuthTabsProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  oauthProviders?: OAuthProvider[];
  showOAuth?: boolean;
  redirectUri?: string;
  className?: string;
}

export function AuthTabs({
  onSuccess,
  onError,
  oauthProviders,
  showOAuth = true,
  redirectUri,
  className,
}: AuthTabsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Sign in to your account or create a new one</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <SignInForm onSuccess={onSuccess} onError={onError} />
            
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

          <TabsContent value="signup" className="space-y-4">
            <SignUpForm onSuccess={onSuccess} onError={onError} />
            
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
      </CardContent>
    </Card>
  );
}

