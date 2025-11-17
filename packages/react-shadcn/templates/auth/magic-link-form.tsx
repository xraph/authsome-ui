'use client';

import { useState } from 'react';
import { useMagicLink } from '@authsome/ui-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail } from 'lucide-react';

interface MagicLinkFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectUri?: string;
  className?: string;
}

export function MagicLinkForm({
  onSuccess,
  onError,
  redirectUri,
  className,
}: MagicLinkFormProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { sendMagicLink, loading, error } = useMagicLink();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await sendMagicLink(email, { redirectUri });
      setSent(true);
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    }
  };

  if (sent) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Check Your Email
          </CardTitle>
          <CardDescription>
            We&apos;ve sent a magic link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click the link in your email to sign in. The link will expire in 15 minutes.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSent(false)}
          >
            Use a different email
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sign In with Magic Link</CardTitle>
        <CardDescription>
          We&apos;ll send you a secure link to sign in without a password
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Magic Link'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

