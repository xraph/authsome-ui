/**
 * Styled MagicLinkForm using shadcn/ui
 */

import React from 'react';
import { MagicLinkForm as HeadlessMagicLinkForm } from '@authsome/ui-react-headless';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, Mail, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export interface MagicLinkFormProps {
  redirectUri?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  title?: string;
  description?: string;
}

export function MagicLinkForm({
  redirectUri,
  onSuccess,
  onError,
  className,
  title = 'Sign In with Magic Link',
  description = 'Enter your email to receive a magic link',
}: MagicLinkFormProps) {
  return (
    <HeadlessMagicLinkForm redirectUri={redirectUri} onSuccess={onSuccess} onError={onError}>
      {({ email, setEmail, handleSubmit, isLoading, isSent, error, validationErrors }) => (
        <Card className={cn('w-full max-w-md', className)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          {isSent ? (
            <CardContent className="space-y-4">
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Magic link sent!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      Check your email at <strong>{email}</strong> for a link to sign in.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          ) : (
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
                  {isLoading ? 'Sending...' : 'Send Magic Link'}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      )}
    </HeadlessMagicLinkForm>
  );
}

