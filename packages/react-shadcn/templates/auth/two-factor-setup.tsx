'use client';

import { useState, useEffect } from 'react';
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
import { QrCode, Copy, Check } from 'lucide-react';
import type { TwoFactorMethod } from '@authsome/ui-core';

interface TwoFactorSetupProps {
  method?: TwoFactorMethod;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function TwoFactorSetup({
  method = 'totp',
  onSuccess,
  onError,
  className,
}: TwoFactorSetupProps) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { setup, verify, loading, error, setupData } = use2FA();

  useEffect(() => {
    setup(method).catch(onError);
  }, [method]);

  const handleCopySecret = async () => {
    if (setupData?.secret) {
      await navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await verify(code, method);
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Set Up Two-Factor Authentication</CardTitle>
        <CardDescription>
          Secure your account with an authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error.message}
          </div>
        )}

        {setupData?.qrCode && (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-4 bg-white rounded-lg">
                {/* QR Code would be rendered here */}
                <div className="w-48 h-48 flex items-center justify-center bg-muted">
                  <QrCode className="h-12 w-12 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Scan this QR code
                  </p>
                </div>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Scan this code with your authenticator app
              </p>
            </div>

            {setupData.secret && (
              <div className="space-y-2">
                <Label>Or enter this code manually:</Label>
                <div className="flex gap-2">
                  <Input
                    value={setupData.secret}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopySecret}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Enter Verification Code</Label>
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
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
            {loading ? 'Verifying...' : 'Complete Setup'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

