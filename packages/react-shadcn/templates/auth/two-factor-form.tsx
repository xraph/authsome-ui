'use client';

import { useState } from 'react';
import { use2FA } from '@authsome/ui-react';
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
import type { TwoFactorMethod } from '@authsome/ui-core';

interface TwoFactorFormProps {
  method?: TwoFactorMethod;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function TwoFactorForm({
  method = 'totp',
  onSuccess,
  onError,
  className,
}: TwoFactorFormProps) {
  const [code, setCode] = useState('');
  const { verify, loading, error } = use2FA();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await verify(code, method);
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    }
  };

  const getMethodLabel = () => {
    switch (method) {
      case 'totp':
        return 'authenticator app';
      case 'sms':
        return 'phone';
      case 'email':
        return 'email';
      default:
        return 'authenticator';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the verification code from your {getMethodLabel()}
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
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              disabled={loading}
              className="text-center text-2xl tracking-widest"
            />
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

