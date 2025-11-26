'use client';

import { AuthProviderWrapper } from '@/components/AuthProviderWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Code, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@authsome/ui-react';

function PasswordResetForm({ onSuccess, onError }: { onSuccess: () => void; onError: (error: any) => void }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword({ email });
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
          We'll send you a link to reset your password
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </form>
  );
}

export default function PasswordResetPage() {
  const [showCode, setShowCode] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const codeExample = `import { useAuth } from '@authsome/ui-react';

export default function ForgotPasswordPage() {
  const { resetPassword, confirmPasswordReset } = useAuth();
  
  // Request password reset
  const handleRequestReset = async (email: string) => {
    try {
      await resetPassword({ email });
      alert('Check your email for reset link!');
    } catch (error) {
      console.error(error);
    }
  };
  
  // Confirm password reset with token
  const handleConfirmReset = async (token: string, newPassword: string) => {
    try {
      await confirmPasswordReset({ token, newPassword });
      alert('Password reset successful!');
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleRequestReset(email);
    }}>
      {/* Your form fields */}
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
                <h1 className="text-xl font-bold">Password Reset</h1>
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
              <h2 className="text-3xl font-bold mb-4">Password Reset Flow</h2>
              <p className="text-muted-foreground">
                Complete forgot password and reset flow with email verification and secure token-based reset.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Demo */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Interactive Demo</CardTitle>
                    <CardDescription>Request a password reset link</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {emailSent ? (
                      <div className="text-center py-8">
                        <Lock className="h-16 w-16 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
                        <p className="text-muted-foreground mb-4">
                          We've sent a password reset link to your email address. Click the link to set a new password.
                        </p>
                        <button
                          onClick={() => setEmailSent(false)}
                          className="text-sm text-primary hover:underline"
                        >
                          Send another link
                        </button>
                      </div>
                    ) : (
                      <PasswordResetForm
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
                        <span>User requests password reset with email</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          2
                        </span>
                        <span>System generates a secure, time-limited token</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          3
                        </span>
                        <span>Email with reset link is sent to user</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          4
                        </span>
                        <span>User clicks link and sets new password</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          5
                        </span>
                        <span>Token is validated and password is updated</span>
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
                      <h4 className="font-medium mb-1">Secure Tokens</h4>
                      <p className="text-sm text-muted-foreground">
                        Cryptographically secure, time-limited reset tokens
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Email Verification</h4>
                      <p className="text-sm text-muted-foreground">
                        Only valid email owners can reset passwords
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Single Use</h4>
                      <p className="text-sm text-muted-foreground">
                        Each reset link can only be used once
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Password Validation</h4>
                      <p className="text-sm text-muted-foreground">
                        Enforces strong password requirements
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
                      <span>Time-limited tokens (15 minutes default)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Rate limiting to prevent abuse</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>No account enumeration protection</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Automatic token invalidation after use</span>
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
                        <code className="bg-muted px-2 py-1 rounded">resetPassword({'{'} email {'}'})</code>
                        <span className="text-muted-foreground ml-2 block mt-1">
                          Send reset link to email address
                        </span>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">confirmPasswordReset({'{'} token, newPassword {'}'})</code>
                        <span className="text-muted-foreground ml-2 block mt-1">
                          Confirm reset with token and new password
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

