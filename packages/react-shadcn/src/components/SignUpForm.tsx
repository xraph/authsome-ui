/**
 * Styled SignUpForm using shadcn/ui
 */

import React from 'react';
import { SignUpForm as HeadlessSignUpForm } from '@authsome/ui-react-headless';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export interface SignUpFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onSignInClick?: () => void;
  className?: string;
  title?: string;
  description?: string;
  showSignInLink?: boolean;
}

export function SignUpForm({
  onSuccess,
  onError,
  onSignInClick,
  className,
  title = 'Create Account',
  description = 'Enter your information to create an account',
  showSignInLink = true,
}: SignUpFormProps) {
  return (
    <HeadlessSignUpForm onSuccess={onSuccess} onError={onError}>
      {({
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        name,
        setName,
        handleSubmit,
        isLoading,
        error,
        validationErrors,
      }) => (
        <Card className={cn('w-full max-w-md', className)}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
            {showSignInLink && (
              <CardAction>
                <Button variant="link" onClick={onSignInClick} type="button">
                  Sign In
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className={validationErrors.confirmPassword ? 'border-destructive' : ''}
                />
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.confirmPassword}
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
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </HeadlessSignUpForm>
  );
}

