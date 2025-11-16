'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Code, Palette, Zap, Github } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Shield,
      title: 'Secure by Default',
      description: 'Built-in security features with multiple auth flows including 2FA and passkeys',
    },
    {
      icon: Code,
      title: 'Developer Friendly',
      description: 'Type-safe APIs, excellent documentation, and intuitive hooks',
    },
    {
      icon: Palette,
      title: 'Fully Customizable',
      description: 'Headless components or pre-styled with shadcn/ui - your choice',
    },
    {
      icon: Zap,
      title: 'Production Ready',
      description: 'Battle-tested patterns, error handling, and comprehensive validation',
    },
  ];

  const authFlows = [
    { name: 'Email/Password', path: '/examples/email-password' },
    { name: 'OAuth Providers', path: '/examples/oauth' },
    { name: 'Magic Links', path: '/examples/magic-link' },
    { name: 'Two-Factor Auth', path: '/examples/2fa' },
    { name: 'Phone Auth', path: '/examples/phone' },
    { name: 'Username Auth', path: '/examples/username' },
    { name: 'Passkeys', path: '/examples/passkey' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">AuthSome UI</h1>
          </div>
          <a
            href="https://github.com/xraph/authsome-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Github className="h-5 w-5" />
            GitHub
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Authentication UI Toolkit
          <br />
          <span className="text-primary">Made Simple</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Framework-agnostic auth with headless components, React hooks, and beautiful pre-styled
          UI. Support for all major auth flows out of the box.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/examples"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-8 py-3 text-sm font-medium hover:bg-primary/90"
          >
            View Examples
          </Link>
          <Link
            href="/playground"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Try Playground
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Why AuthSome UI?</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Auth Flows */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Supported Auth Flows</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {authFlows.map((flow) => (
            <Link
              key={flow.name}
              href={flow.path}
              className="p-4 rounded-lg border bg-card text-card-foreground hover:bg-accent transition-colors text-center"
            >
              <p className="font-medium">{flow.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Code Example */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Quick Start</h3>
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6">
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
              <code>{`// Install AuthSome UI CLI
npx authsome-ui init

// Add sign-in component to your project
npx authsome-ui add sign-in-form

// Use in your app
import { SignInForm } from '@/components/auth/sign-in-form';

function App() {
  return (
    <SignInForm
      onSuccess={() => router.push('/dashboard')}
    />
  );
}`}</code>
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground text-sm">
          <p>© 2025 AuthSome UI by XRAPH. MIT License.</p>
        </div>
      </footer>
    </div>
  );
}

