'use client';

import { useState } from 'react';
import { AuthProviderWrapper } from '@/components/AuthProviderWrapper';
import { SignInForm, SignUpForm } from '@authsome/ui-react-headless';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PlaygroundPage() {
  const [selectedComponent, setSelectedComponent] = useState<string>('signin');

  const components = {
    signin: {
      title: 'Sign In Form (Headless)',
      component: <SignInForm onSuccess={() => alert('Sign in successful!')}>
        {({ email, setEmail, password, setPassword, handleSubmit, loading, error }) => (
          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
            {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error.message}</div>}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        )}
      </SignInForm>,
      code: `import { SignInForm } from '@authsome/ui-react-headless';

<SignInForm onSuccess={() => router.push('/dashboard')}>
  {({ email, setEmail, password, setPassword, handleSubmit, loading, error }) => (
    <form onSubmit={handleSubmit}>
      {/* Your custom form UI */}
    </form>
  )}
</SignInForm>`,
    },
    signup: {
      title: 'Sign Up Form (Headless)',
      component: <SignUpForm onSuccess={() => alert('Account created!')}>
        {({ email, setEmail, password, setPassword, username, setUsername, handleSubmit, loading, error }) => (
          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
            {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error.message}</div>}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Username (optional)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
        )}
      </SignUpForm>,
      code: `import { SignUpForm } from '@authsome/ui-react-headless';

<SignUpForm onSuccess={() => router.push('/dashboard')}>
  {({ email, setEmail, password, setPassword, username, setUsername, handleSubmit, loading, error }) => (
    <form onSubmit={handleSubmit}>
      {/* Your custom form UI */}
    </form>
  )}
</SignUpForm>`,
    },
  };

  const current = components[selectedComponent as keyof typeof components];

  return (
    <AuthProviderWrapper>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Interactive Playground</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Component Selector */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Component</CardTitle>
                  <CardDescription>Choose a component to preview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {Object.entries(components).map(([key, { title }]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedComponent(key)}
                        className={`p-3 text-left rounded-md border transition-colors ${
                          selectedComponent === key
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                    <code>{current.code}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>

            {/* Preview */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Live preview of {current.title}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center min-h-[500px]">
                  {current.component}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthProviderWrapper>
  );
}

