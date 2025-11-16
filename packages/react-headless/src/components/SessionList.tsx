/**
 * SessionList - Headless session management component
 */

import React from 'react';
import { useSession } from '@authsome/ui-react';
import type { Session } from '@authsome/ui-core';

export interface SessionListProps {
  onRevoke?: (sessionId: string) => void;
  children: (props: SessionListRenderProps) => React.ReactNode;
}

export interface SessionListRenderProps {
  currentSession: Session | null;
  // In a full implementation, you would fetch all sessions from the backend
  sessions: Session[];
  revokeSession: (sessionId: string) => Promise<void>;
}

/**
 * Headless session list component
 */
export function SessionList({ onRevoke, children }: SessionListProps) {
  const currentSession = useSession();

  const revokeSession = async (sessionId: string) => {
    // In a full implementation, call the backend to revoke the session
    onRevoke?.(sessionId);
  };

  return (
    <>
      {children({
        currentSession,
        sessions: currentSession ? [currentSession] : [],
        revokeSession,
      })}
    </>
  );
}

