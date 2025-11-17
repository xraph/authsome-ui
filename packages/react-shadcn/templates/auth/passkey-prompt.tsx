'use client';

import { usePasskey } from '@authsome/ui-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Fingerprint, Shield } from 'lucide-react';

interface PasskeyPromptProps {
  mode?: 'register' | 'authenticate';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function PasskeyPrompt({
  mode = 'authenticate',
  onSuccess,
  onError,
  className,
}: PasskeyPromptProps) {
  const { register, authenticate, loading, error } = usePasskey();

  const handleAction = async () => {
    try {
      if (mode === 'register') {
        await register();
      } else {
        await authenticate();
      }
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          {mode === 'register' ? 'Register Passkey' : 'Sign In with Passkey'}
        </CardTitle>
        <CardDescription>
          {mode === 'register'
            ? 'Set up a passkey for faster, more secure sign-ins'
            : 'Use your fingerprint, face, or device PIN'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error.message}
          </div>
        )}

        <div className="flex flex-col items-center gap-4 py-6">
          <div className="rounded-full bg-primary/10 p-6">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="font-semibold">
              {mode === 'register' ? 'Secure Your Account' : 'Quick & Secure'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {mode === 'register'
                ? 'Passkeys use biometrics or your device PIN for enhanced security. You can use it to sign in quickly on this device.'
                : 'Authenticate using your device&apos;s built-in security. No password needed.'}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          onClick={handleAction}
          disabled={loading}
          className="w-full"
        >
          {loading
            ? mode === 'register'
              ? 'Setting up...'
              : 'Authenticating...'
            : mode === 'register'
            ? 'Set Up Passkey'
            : 'Sign In with Passkey'}
        </Button>
        
        {mode === 'register' && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onSuccess?.()}
          >
            Skip for now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

