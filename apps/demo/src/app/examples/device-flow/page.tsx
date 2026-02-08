'use client';

import { AuthProviderWrapper } from '@/components/AuthProviderWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, ArrowLeft, Code, Monitor, Smartphone, Terminal, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@authsome/ui-react';

/**
 * Format user code with dash separator (e.g., "BCDF-GHJK")
 */
function formatUserCode(code: string): string {
  const cleaned = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (cleaned.length <= 4) {
    return cleaned;
  }
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
}

/**
 * Parse user code input, removing dashes
 */
function parseUserCode(input: string): string {
  return input.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function DeviceCodeEntryForm({ 
  onSuccess, 
  onError 
}: { 
  onSuccess: (userCode: string) => void; 
  onError: (error: Error) => void;
}) {
  const { verifyDeviceCode } = useAuth();
  const [userCode, setUserCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseUserCode(e.target.value);
    if (value.length <= 8) {
      setUserCode(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verifyDeviceCode) {
      onError(new Error('Device flow is not available'));
      return;
    }

    const cleanedCode = parseUserCode(userCode);
    if (cleanedCode.length < 8) {
      onError(new Error('Please enter the complete 8-character code'));
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyDeviceCode({ userCode: cleanedCode });
      
      if (!result.valid) {
        onError(new Error('Invalid code. Please check and try again.'));
        return;
      }
      
      onSuccess(cleanedCode);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Invalid device code'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="userCode" className="text-sm font-medium">
          Device Code
        </label>
        <Input
          ref={inputRef}
          id="userCode"
          type="text"
          value={formatUserCode(userCode)}
          onChange={handleInputChange}
          className="text-center text-2xl tracking-widest font-mono uppercase"
          placeholder="XXXX-XXXX"
          maxLength={9}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter the 8-character code shown on your CLI or device
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Verifying...' : 'Verify Code'}
      </Button>
    </form>
  );
}

function DeviceAuthorizeForm({
  userCode,
  onApprove,
  onDeny,
}: {
  userCode: string;
  onApprove: () => void;
  onDeny: () => void;
}) {
  const { authorizeDevice } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    if (!authorizeDevice) return;
    
    setIsLoading(true);
    try {
      await authorizeDevice({ userCode, action: 'approve' });
      onApprove();
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!authorizeDevice) return;
    
    setIsLoading(true);
    try {
      await authorizeDevice({ userCode, action: 'deny' });
      onDeny();
    } catch (error) {
      console.error('Failed to deny:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Monitor className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Authorize Device</h3>
        <p className="text-muted-foreground mb-4">
          A device is requesting access to your account
        </p>
      </div>
      
      <div className="rounded-lg border p-4 bg-muted/50">
        <p className="text-sm text-center text-muted-foreground mb-2">
          Confirm this is your code:
        </p>
        <p className="text-2xl font-mono font-bold text-center">
          {formatUserCode(userCode)}
        </p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Only approve if you initiated this request. If you did not request this
          authorization, click Deny.
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleDeny}
          disabled={isLoading}
          className="flex-1"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Deny
        </Button>
        <Button
          onClick={handleApprove}
          disabled={isLoading}
          className="flex-1"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve
        </Button>
      </div>
    </div>
  );
}

export default function DeviceFlowPage() {
  const [showCode, setShowCode] = useState(false);
  const [step, setStep] = useState<'entry' | 'authorize' | 'approved' | 'denied'>('entry');
  const [userCode, setUserCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cliCodeExample = `// CLI Device Flow Login Example
import { initiateDeviceFlow, pollDeviceToken } from '@authsome/ui-next/server';

async function deviceFlowLogin(clientId: string) {
  // 1. Initiate device flow
  const result = await initiateDeviceFlowAction({ clientId });
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  const { 
    deviceCode, 
    userCode, 
    verificationUri, 
    expiresIn, 
    interval 
  } = result.data;
  
  console.log('\\nTo sign in, visit:', verificationUri);
  console.log('Enter code:', userCode);
  console.log('\\nCode expires in', expiresIn, 'seconds');
  
  // 2. Poll for token
  const startTime = Date.now();
  let pollInterval = interval * 1000;
  
  while (Date.now() - startTime < expiresIn * 1000) {
    await sleep(pollInterval);
    
    const pollResult = await pollDeviceTokenAction({ 
      deviceCode, 
      clientId 
    });
    
    if (!pollResult.success) {
      throw new Error(pollResult.error);
    }
    
    // Check if we got tokens
    if ('user' in pollResult.data) {
      console.log('\\nLogin successful!');
      console.log('Welcome,', pollResult.data.user.name);
      return pollResult.data;
    }
    
    // Handle polling status
    const { status } = pollResult.data;
    
    if (status === 'slow_down') {
      pollInterval = pollInterval * 2;
    } else if (status === 'expired_token') {
      throw new Error('Device code expired');
    } else if (status === 'access_denied') {
      throw new Error('User denied access');
    }
    // authorization_pending - continue polling
  }
  
  throw new Error('Device flow timeout');
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}`;

  const webCodeExample = `// Web UI for Device Code Verification
import { useAuth } from '@authsome/ui-react';
import { useState } from 'react';

function DeviceAuthorizePage() {
  const { verifyDeviceCode, authorizeDevice } = useAuth();
  const [userCode, setUserCode] = useState('');
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    const result = await verifyDeviceCode({ userCode });
    if (result.valid) {
      setVerified(true);
    }
  };

  const handleAuthorize = async (action: 'approve' | 'deny') => {
    await authorizeDevice({ userCode, action });
    // Show success message
  };

  return verified ? (
    <div>
      <h2>Authorize Device?</h2>
      <p>Code: {userCode}</p>
      <button onClick={() => handleAuthorize('approve')}>Approve</button>
      <button onClick={() => handleAuthorize('deny')}>Deny</button>
    </div>
  ) : (
    <form onSubmit={handleVerify}>
      <input 
        value={userCode} 
        onChange={(e) => setUserCode(e.target.value)}
        placeholder="XXXX-XXXX"
      />
      <button type="submit">Verify</button>
    </form>
  );
}`;

  return (
    <AuthProviderWrapper>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/examples"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Examples
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Device Flow Authentication</h1>
              </div>
            </div>
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Code className="h-4 w-4" />
              {showCode ? 'Hide Code' : 'Show Code'}
            </button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">Device Flow (RFC 8628)</h2>
              <p className="text-muted-foreground">
                OAuth 2.0 Device Authorization Grant for CLI tools, smart TVs, and other
                input-constrained devices. Users authenticate on a secondary device.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Demo */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Web Verification UI</CardTitle>
                    <CardDescription>
                      Enter the code shown on your CLI or device
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    
                    {step === 'entry' && (
                      <DeviceCodeEntryForm
                        onSuccess={(code) => {
                          setUserCode(code);
                          setStep('authorize');
                          setError(null);
                        }}
                        onError={(err) => setError(err.message)}
                      />
                    )}
                    
                    {step === 'authorize' && (
                      <DeviceAuthorizeForm
                        userCode={userCode}
                        onApprove={() => setStep('approved')}
                        onDeny={() => setStep('denied')}
                      />
                    )}
                    
                    {step === 'approved' && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-green-600 mb-2">
                          Device Authorized
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          You have successfully authorized the device.
                          Return to your CLI to continue.
                        </p>
                        <button
                          onClick={() => {
                            setStep('entry');
                            setUserCode('');
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          Authorize another device
                        </button>
                      </div>
                    )}
                    
                    {step === 'denied' && (
                      <div className="text-center py-8">
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-red-600 mb-2">
                          Access Denied
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          You have denied the device authorization request.
                        </p>
                        <button
                          onClick={() => {
                            setStep('entry');
                            setUserCode('');
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          Start over
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3 text-sm">
                      <li className="flex gap-3">
                        <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          1
                        </span>
                        <div>
                          <span className="font-medium">CLI initiates flow</span>
                          <p className="text-muted-foreground">
                            Device requests authorization and receives a user code
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          2
                        </span>
                        <div>
                          <span className="font-medium">User visits verification URL</span>
                          <p className="text-muted-foreground">
                            Opens browser and navigates to the verification page
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          3
                        </span>
                        <div>
                          <span className="font-medium">User enters code</span>
                          <p className="text-muted-foreground">
                            Types the code shown on CLI into the web form
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          4
                        </span>
                        <div>
                          <span className="font-medium">User authorizes</span>
                          <p className="text-muted-foreground">
                            Reviews and approves the authorization request
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          5
                        </span>
                        <div>
                          <span className="font-medium">CLI receives tokens</span>
                          <p className="text-muted-foreground">
                            Device polling detects authorization and gets tokens
                          </p>
                        </div>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </div>

              {/* Documentation */}
              <div className="space-y-6">
                {showCode && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="h-5 w-5" />
                          CLI Implementation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                          <code>{cliCodeExample}</code>
                        </pre>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Monitor className="h-5 w-5" />
                          Web UI Implementation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                          <code>{webCodeExample}</code>
                        </pre>
                      </CardContent>
                    </Card>
                  </>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Use Cases</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Terminal className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">CLI Tools</h4>
                        <p className="text-sm text-muted-foreground">
                          Command-line applications that need user authentication
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Monitor className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Smart TVs</h4>
                        <p className="text-sm text-muted-foreground">
                          Devices with limited input capabilities
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Smartphone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">IoT Devices</h4>
                        <p className="text-sm text-muted-foreground">
                          Embedded systems and smart devices
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Short-lived device codes (10 min default)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Cryptographically secure code generation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Rate-limited polling (5 sec minimum)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>User code uses unambiguous characters</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Single-use codes</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>API Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div>
                        <code className="bg-muted px-2 py-1 rounded text-xs">initiateDeviceFlow()</code>
                        <p className="text-muted-foreground mt-1">
                          Starts device flow, returns codes and URLs
                        </p>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded text-xs">verifyDeviceCode()</code>
                        <p className="text-muted-foreground mt-1">
                          Validates user-entered code
                        </p>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded text-xs">authorizeDevice()</code>
                        <p className="text-muted-foreground mt-1">
                          Approves or denies authorization
                        </p>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded text-xs">pollDeviceToken()</code>
                        <p className="text-muted-foreground mt-1">
                          Polls for tokens (CLI side)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthProviderWrapper>
  );
}
