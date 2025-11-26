'use client';

import { AuthProviderWrapper } from '@/components/AuthProviderWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Code, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@authsome/ui-react';

function EmailVerificationForm({ onSuccess, onError }: { onSuccess: () => void; onError: (error: any) => void }) {
  const { sendVerificationEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendVerificationEmail({ email });
      onSuccess();
    } catch (error) {
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="john@example.com"
          required
        />
        <p className="text-xs text-muted-foreground">
          We'll send you a verification code and link
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Verification Email'}
      </Button>
    </form>
  );
}

function CodeVerificationForm({ onSuccess, onError }: { onSuccess: () => void; onError: (error: any) => void }) {
  const { verifyEmail } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await verifyEmail({ code });
      onSuccess();
    } catch (error) {
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="code" className="text-sm font-medium">
          Verification Code
        </label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          value={code}
          onChange={handleCodeChange}
          className="w-full px-3 py-2 border rounded-md text-center text-2xl tracking-widest font-mono"
          placeholder="000000"
          maxLength={6}
          required
        />
        <p className="text-xs text-muted-foreground text-center">
          Enter the 6-digit code from your email
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
        {isLoading ? 'Verifying...' : 'Verify Email'}
      </Button>
    </form>
  );
}

export default function EmailVerificationPage() {
  const [showCode, setShowCode] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showCodeEntry, setShowCodeEntry] = useState(false);

  const codeExample = `import { useAuth } from '@authsome/ui-react';

export default function EmailVerificationPage() {
  const { 
    sendVerificationEmail, 
    verifyEmail, 
    verifyEmailLink 
  } = useAuth();
  
  // Send verification email
  const handleSendVerification = async (email: string) => {
    try {
      await sendVerificationEmail({ email });
      alert('Check your email!');
    } catch (error) {
      console.error(error);
    }
  };
  
  // Verify with 6-digit code
  const handleVerifyCode = async (code: string) => {
    try {
      await verifyEmail({ code });
      alert('Email verified!');
    } catch (error) {
      console.error(error);
    }
  };
  
  // Verify with link token (from URL)
  const handleVerifyLink = async (token: string) => {
    try {
      await verifyEmailLink({ token });
      alert('Email verified!');
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <div>
      {/* Your UI */}
    </div>
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
                <h1 className="text-xl font-bold">Email Verification</h1>
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
              <h2 className="text-3xl font-bold mb-4">Email Verification</h2>
              <p className="text-muted-foreground">
                Complete email verification flow supporting both 6-digit codes and secure link-based verification.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Demo */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Interactive Demo</CardTitle>
                    <CardDescription>
                      {verified ? 'Email verified!' : showCodeEntry ? 'Enter verification code' : emailSent ? 'Check your email' : 'Send verification email'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {verified ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Email Verified!</h3>
                        <p className="text-muted-foreground mb-4">
                          Your email has been successfully verified.
                        </p>
                        <button
                          onClick={() => {
                            setVerified(false);
                            setEmailSent(false);
                            setShowCodeEntry(false);
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          Try again
                        </button>
                      </div>
                    ) : showCodeEntry ? (
                      <>
                        <CodeVerificationForm
                          onSuccess={() => setVerified(true)}
                          onError={(error) => alert(`Error: ${error.message}`)}
                        />
                        <button
                          onClick={() => setShowCodeEntry(false)}
                          className="text-sm text-muted-foreground hover:text-foreground mt-4 block mx-auto"
                        >
                          Back
                        </button>
                      </>
                    ) : emailSent ? (
                      <div className="text-center py-8">
                        <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
                        <p className="text-muted-foreground mb-4">
                          We've sent a verification email with a 6-digit code and a verification link.
                        </p>
                        <div className="space-y-2">
                          <Button
                            onClick={() => setShowCodeEntry(true)}
                            className="w-full"
                          >
                            Enter Verification Code
                          </Button>
                          <button
                            onClick={() => setEmailSent(false)}
                            className="text-sm text-primary hover:underline block w-full"
                          >
                            Resend email
                          </button>
                        </div>
                      </div>
                    ) : (
                      <EmailVerificationForm
                        onSuccess={() => setEmailSent(true)}
                        onError={(error) => alert(`Error: ${error.message}`)}
                      />
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
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          1
                        </span>
                        <span>User requests email verification</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          2
                        </span>
                        <span>System generates 6-digit code and secure link</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          3
                        </span>
                        <span>Email sent with both verification options</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          4
                        </span>
                        <span>User verifies via code entry OR link click</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          5
                        </span>
                        <span>Email is marked as verified</span>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </div>

              {/* Documentation */}
              <div className="space-y-6">
                {showCode && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Code Example</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        <code>{codeExample}</code>
                      </pre>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1">Dual Verification</h4>
                      <p className="text-sm text-muted-foreground">
                        Support for both 6-digit codes and secure links
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Auto-Submit</h4>
                      <p className="text-sm text-muted-foreground">
                        Code automatically verifies when 6 digits entered
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Time-Limited</h4>
                      <p className="text-sm text-muted-foreground">
                        Codes and links expire after configurable time
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Resend Option</h4>
                      <p className="text-sm text-muted-foreground">
                        Users can request new verification emails
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Cryptographically secure code generation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Rate limiting on verification attempts</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Single-use verification codes and links</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Protection against brute force attacks</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>API Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">sendVerificationEmail({'{'} email {'}'})</code>
                        <span className="text-muted-foreground ml-2 block mt-1">
                          Send verification email with code and link
                        </span>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">verifyEmail({'{'} code {'}'})</code>
                        <span className="text-muted-foreground ml-2 block mt-1">
                          Verify email with 6-digit code
                        </span>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">verifyEmailLink({'{'} token {'}'})</code>
                        <span className="text-muted-foreground ml-2 block mt-1">
                          Verify email with link token
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">method: 'code'</code>
                        <span className="text-muted-foreground ml-2 block mt-1">
                          Only 6-digit code verification
                        </span>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">method: 'link'</code>
                        <span className="text-muted-foreground ml-2 block mt-1">
                          Only link-based verification
                        </span>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">method: 'both'</code>
                        <span className="text-muted-foreground ml-2 block mt-1">
                          Both verification methods (default)
                        </span>
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

