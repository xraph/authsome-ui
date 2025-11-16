'use client';

import { useAuth } from '@authsome/ui-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Globe, Clock, X } from 'lucide-react';
import type { Session } from '@authsome/ui-core';

interface SessionListProps {
  onRevoke?: (sessionId: string) => void;
  className?: string;
}

export function SessionList({ onRevoke, className }: SessionListProps) {
  const { session } = useAuth();

  // In a real implementation, you'd fetch all sessions from the backend
  // For now, we'll show the current session
  const sessions: Session[] = session ? [session] : [];

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="h-5 w-5" />;
    
    if (userAgent.includes('Mobile')) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Manage your active sessions across devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No active sessions
          </p>
        ) : (
          sessions.map((sess, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-4 p-4 border rounded-lg"
            >
              <div className="flex gap-3">
                <div className="mt-1">
                  {getDeviceIcon(sess.user.metadata?.userAgent)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {sess.user.metadata?.device || 'Current Device'}
                    </p>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {sess.user.metadata?.location || 'Unknown location'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {sess.user.createdAt ? formatDate(sess.user.createdAt) : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              {index !== 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRevoke?.(sess.user.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

