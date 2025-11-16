/**
 * Styled SignInForm using shadcn/ui
 */

import React from 'react';
import { SignInForm as HeadlessSignInForm } from '@authsome/ui-react-headless';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export interface SignInFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  title?: string;
  description?: string;
  showRememberMe?: boolean;
}

export function SignInForm({
  onSuccess,
  onError,
  className,
  title = 'Sign In',
  description = 'Enter your credentials to access your account',
  showRememberMe = false,
}: SignInFormProps) {
  return (
    <HeadlessSignInForm onSuccess={onSuccess} onError={onError}>
      {({ email, setEmail, password, setPassword, handleSubmit, isLoading, error, validationErrors }) => (
        <Card className={cn('w-full max-w-md', className)}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={validationErrors.email ? 'border-destructive' : ''}
                />
                {validationErrors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className={validationErrors.password ? 'border-destructive' : ''}
                />
                {validationErrors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3">
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error.message}
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </HeadlessSignInForm>
  );
}

