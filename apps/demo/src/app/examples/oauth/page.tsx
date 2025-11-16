'use client';

import { AuthProviderWrapper } from '@/components/AuthProviderWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Code } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@authsome/ui-react';

export default function OAuthPage() {
  const [showCode, setShowCode] = useState(false);
  const { oauthSignIn } = useAuth();

  const handleOAuth = async (provider: string) => {
    try {
      const result = await oauthSignIn({
        provider: provider as any,
        redirectUri: window.location.origin + '/dashboard',
      });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  const codeExample = `import { useAuth } from '@authsome/ui-react';

export default function LoginPage() {
  return (
    <OAuthButtons
      providers={['google', 'github', 'microsoft']}
      redirectUri="/dashboard"
      onError={(error) => console.error(error)}
    />
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
                <h1 className="text-xl font-bold">OAuth Authentication</h1>
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
              <h2 className="text-3xl font-bold mb-4">OAuth Providers</h2>
              <p className="text-muted-foreground">
                Social authentication with popular OAuth providers. Supports Google, GitHub,
                Microsoft, Facebook, Apple, and more.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Demo */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Interactive Demo</CardTitle>
                    <CardDescription>Click any provider to sign in</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      OAuth demo coming soon. Use the built-in renderers example to see OAuth in action.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Custom Styling</CardTitle>
                    <CardDescription>Stack buttons vertically</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      OAuth demo coming soon. Use the built-in renderers example to see OAuth in action.
                    </p>
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
                    <CardTitle>Supported Providers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {[
                        'Google',
                        'GitHub',
                        'Microsoft',
                        'Facebook',
                        'Apple',
                        'Twitter',
                        'Discord',
                        'Slack',
                      ].map((provider) => (
                        <div key={provider} className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full" />
                          {provider}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1">Provider Icons</h4>
                      <p className="text-sm text-muted-foreground">
                        Built-in icons for all major OAuth providers
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">PKCE Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Secure OAuth flow with PKCE for public clients
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">State Management</h4>
                      <p className="text-sm text-muted-foreground">
                        Built-in CSRF protection with state parameter
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Flexible Layout</h4>
                      <p className="text-sm text-muted-foreground">
                        Horizontal or vertical button layouts
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
                        <code className="bg-muted px-2 py-1 rounded">providers</code>
                        <span className="text-muted-foreground ml-2">
                          Array of OAuth provider names
                        </span>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">redirectUri</code>
                        <span className="text-muted-foreground ml-2">
                          Redirect URL after authentication
                        </span>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">layout</code>
                        <span className="text-muted-foreground ml-2">
                          'horizontal' or 'vertical'
                        </span>
                      </div>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded">onError</code>
                        <span className="text-muted-foreground ml-2">Error callback</span>
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

