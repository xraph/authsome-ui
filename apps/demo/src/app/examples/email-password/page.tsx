'use client';

import { AuthProviderWrapper } from '@/components/AuthProviderWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Code } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@authsome/ui-react';

function SignInForm({ onSuccess, onError }: { onSuccess: () => void; onError: (error: any) => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn({ email, password });
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
          Email
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
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="••••••••"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}

function SignUpForm({ onSuccess, onError }: { onSuccess: () => void; onError: (error: any) => void }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      onError(new Error('Passwords do not match'));
      return;
    }
    setIsLoading(true);
    try {
      await signUp({ email, password });
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
        <label htmlFor="signup-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="john@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="signup-password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="••••••••"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="confirm-password" className="text-sm font-medium">
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="••••••••"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  );
}

export default function EmailPasswordPage() {
  const router = useRouter();
  const [showCode, setShowCode] = useState(false);

  const codeExample = `import { useAuth } from '@authsome/ui-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn({ email, password });
      router.push('/dashboard');
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
                <h1 className="text-xl font-bold">Email/Password Authentication</h1>
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
              <h2 className="text-3xl font-bold mb-4">Email & Password Auth</h2>
              <p className="text-muted-foreground">
                Traditional authentication using email and password. Includes built-in validation,
                error handling, and password visibility toggle.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Demo */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Interactive Demo</CardTitle>
                    <CardDescription>Try signing in or creating an account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="signin">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="signin">Sign In</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                      </TabsList>
                      <TabsContent value="signin">
                        <SignInForm
                          onSuccess={() => {
                            alert('Sign in successful!');
                            router.push('/dashboard');
                          }}
                          onError={(error) => console.error('Sign in error:', error)}
                        />
                      </TabsContent>
                      <TabsContent value="signup">
                        <SignUpForm
                          onSuccess={() => {
                            alert('Account created successfully!');
                            router.push('/dashboard');
                          }}
                          onError={(error) => console.error('Sign up error:', error)}
                        />
                      </TabsContent>
                    </Tabs>
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
                      <h4 className="font-medium mb-1">Built-in Validation</h4>
                      <p className="text-sm text-muted-foreground">
                        Email format validation and password strength requirements
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Error Handling</h4>
                      <p className="text-sm text-muted-foreground">
                        Clear error messages for invalid credentials and network issues
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Loading States</h4>
                      <p className="text-sm text-muted-foreground">
                        Loading indicators and disabled state during authentication
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Accessibility</h4>
                      <p className="text-sm text-muted-foreground">
                        ARIA labels, keyboard navigation, and screen reader support
                      </p>
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
                          Callback fired on successful authentication
                        </span>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">onError</code>
                        <span className="text-muted-foreground ml-2">
                          Callback fired on authentication error
                        </span>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">title</code>
                        <span className="text-muted-foreground ml-2">Optional form title</span>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">showRememberMe</code>
                        <span className="text-muted-foreground ml-2">
                          Show remember me checkbox
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

