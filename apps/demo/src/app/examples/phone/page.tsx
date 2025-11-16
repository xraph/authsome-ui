'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function PhoneAuthPage() {
  return (
    <div className="min-h-screen bg-background">
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
              <h1 className="text-xl font-bold">Phone Authentication</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Phone Number Authentication</h2>
            <p className="text-muted-foreground">
              Verify users via SMS codes sent to their phone numbers.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <Smartphone className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Implementation</CardTitle>
              <CardDescription>How to add phone authentication to your app</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                <code>{`import { PhoneAuthForm } from '@/components/ui/card';

export default function PhoneLogin() {
  return (
    <PhoneAuthForm
      onSuccess={() => router.push('/dashboard')}
      onError={(error) => console.error(error)}
    />
  );
}`}</code>
              </pre>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• International phone number formatting</div>
                <div>• SMS code delivery</div>
                <div>• Rate limiting</div>
                <div>• Resend code functionality</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Time-limited verification codes</div>
                <div>• Single-use codes</div>
                <div>• Carrier verification</div>
                <div>• Fraud detection</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

