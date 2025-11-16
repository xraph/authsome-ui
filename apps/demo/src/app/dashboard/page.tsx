'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProviderWrapper } from '@/components/AuthProviderWrapper';
import { useAuth, RequireAuth, useOrganization } from '@authsome/ui-react';
import { UserButton, OrganizationSwitcher } from '@authsome/ui-react-shadcn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, LogOut, User, Mail, Clock, Key, Building2 } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const authContext = useAuth();
  const { user, session, isLoading, client } = authContext as any;
  const { activeOrganization, isSupported: orgSupported } = useOrganization();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    // Fetch user sessions
    const loadSessions = async () => {
      try {
        // This would call the auth provider to get all active sessions
        // For demo purposes, we'll show the current session
        if (session) {
          setSessions([session]);
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    };

    if (!isLoading && user) {
      loadSessions();
    }
  }, [user, session, isLoading]);

  const handleSignOut = async () => {
    try {
      // Use client signOut method
      await client.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Dashboard</h1>
            
            {/* Organization Switcher (only shows if supported) */}
            {orgSupported && (
              <div className="hidden md:block">
                <OrganizationSwitcher />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* User Button with dropdown menu */}
            <UserButton 
              showEmail
              showOrganization
              onProfileClick={() => router.push('/profile')}
              onSettingsClick={() => router.push('/settings')}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome */}
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h2>
            <p className="text-muted-foreground">
              You're successfully authenticated. This is a protected page.
            </p>
          </div>

          {/* User Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="font-medium">{user?.email || 'Not available'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Key className="h-4 w-4" />
                    User ID
                  </div>
                  <p className="font-mono text-sm">{user?.id || 'Not available'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    Account Created
                  </div>
                  <p className="text-sm">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'Not available'}
                  </p>
                </div>
                {orgSupported && activeOrganization && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Building2 className="h-4 w-4" />
                      Active Organization
                    </div>
                    <p className="font-medium">{activeOrganization.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="font-medium">Active</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Expires</div>
                  <p className="text-sm">
                    {session?.expiresAt
                      ? new Date(session.expiresAt).toLocaleString()
                      : 'Not available'}
                  </p>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Active Sessions</div>
                  <p className="font-medium">{sessions.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <button className="p-4 border rounded-lg hover:bg-accent text-left transition-colors">
                  <h4 className="font-medium mb-1">Change Password</h4>
                  <p className="text-sm text-muted-foreground">Update your password</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-accent text-left transition-colors">
                  <h4 className="font-medium mb-1">Enable 2FA</h4>
                  <p className="text-sm text-muted-foreground">Add extra security</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-accent text-left transition-colors">
                  <h4 className="font-medium mb-1">Manage Sessions</h4>
                  <p className="text-sm text-muted-foreground">View active sessions</p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Integration Example */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Example</CardTitle>
              <CardDescription>How this page is protected</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                <code>{`import { RequireAuth } from '@authsome/ui-react';

export default function DashboardPage() {
  return (
    <RequireAuth
      fallback="/login"
      onUnauthorized={() => console.log('Not authenticated')}
    >
      <YourProtectedContent />
    </RequireAuth>
  );
}`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProviderWrapper>
      <RequireAuth 
        fallback="/"
        redirectTo="/"
        onUnauthenticated={() => {}}
      >
        <DashboardContent />
      </RequireAuth>
    </AuthProviderWrapper>
  );
}

