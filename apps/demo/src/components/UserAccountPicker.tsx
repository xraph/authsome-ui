import { User } from '@authsome/ui-core';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { User as UserIcon, LogOut, Plus, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserAccountPickerProps {
  user: User | null;
  onSignOut: () => Promise<void>;
}

export function UserAccountPicker({ user, onSignOut }: UserAccountPickerProps) {
  const router = useRouter();

  if (!user) return null;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Current Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User Profile */}
        <div className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name || 'User'} className="h-full w-full rounded-full object-cover" />
              ) : (
                <UserIcon className="h-5 w-5" />
              )}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium leading-none">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push('/settings/profile')}>
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>

        <div className="space-y-2">
          {/* Switch Account / Add Account */}
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2" 
            onClick={() => router.push('/auth/signin')}
          >
            <Plus className="h-4 w-4" />
            Add another account
          </Button>

          {/* Sign Out */}
          <Button 
            variant="destructive" 
            className="w-full justify-start gap-2"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

