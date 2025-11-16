'use client';

import { AuthProviderWrapper } from '@/components/AuthProviderWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Code, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@authsome/ui-react';

function MagicLinkForm({ onSuccess, onError }: { onSuccess: () => void; onError: (error: any) => void }) {
  const { sendMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendMagicLink({ email });
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
          We'll send you a secure link to sign in
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Magic Link'}
      </Button>
    </form>
  );
}

export default function MagicLinkPage() {
  const [showCode, setShowCode] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const codeExample = `import { useAuth } from '@authsome/ui-react';

export default function LoginPage() {
  const { sendMagicLink } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendMagicLink({ email });
      alert('Check your email!');
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
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
                <h1 className="text-xl font-bold">Magic Link Authentication</h1>
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
              <h2 className="text-3xl font-bold mb-4">Magic Link Auth</h2>
              <p className="text-muted-foreground">
                Passwordless authentication via email. Users receive a secure login link that
                expires after a set time.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Demo */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Interactive Demo</CardTitle>
                    <CardDescription>Enter your email to receive a magic link</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {emailSent ? (
                      <div className="text-center py-8">
                        <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
                        <p className="text-muted-foreground mb-4">
                          We've sent a magic link to your email address. Click the link to sign in.
                        </p>
                        <button
                          onClick={() => setEmailSent(false)}
                          className="text-sm text-primary hover:underline"
                        >
                          Send another link
                        </button>
                      </div>
                    ) : (
                      <MagicLinkForm
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
                        <span>User enters their email address</span>
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
                        <span>Email with magic link is sent to user</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          4
                        </span>
                        <span>User clicks link and is automatically signed in</span>
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
                      <h4 className="font-medium mb-1">Passwordless</h4>
                      <p className="text-sm text-muted-foreground">
                        No passwords to remember or manage
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Time-Limited Links</h4>
                      <p className="text-sm text-muted-foreground">
                        Links expire after configurable time period
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Single Use</h4>
                      <p className="text-sm text-muted-foreground">
                        Each link can only be used once for security
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Rate Limiting</h4>
                      <p className="text-sm text-muted-foreground">
                        Built-in protection against abuse
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
                      <span>Cryptographically secure token generation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Email verification required</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Prevents phishing attacks</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>No password database breach risk</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Props</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">onSuccess</code>
                        <span className="text-muted-foreground ml-2">
                          Callback when email is sent
                        </span>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">onError</code>
                        <span className="text-muted-foreground ml-2">Error callback</span>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">title</code>
                        <span className="text-muted-foreground ml-2">Optional form title</span>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">redirectUri</code>
                        <span className="text-muted-foreground ml-2">Post-auth redirect URL</span>
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

