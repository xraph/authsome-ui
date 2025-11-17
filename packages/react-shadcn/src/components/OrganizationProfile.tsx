/**
 * OrganizationProfile component
 * 
 * Full-page organization settings and management
 * Shows organization details, members, and settings
 */

import React, { useState, useEffect } from 'react';
import { useOrganization } from '@authsome/ui-react';
import type { Organization } from '@authsome/ui-core';

export type OrganizationProfileTab = 'general' | 'members' | 'settings';

export interface OrganizationProfileProps {
  /**
   * Organization ID to display (defaults to active organization)
   */
  organizationId?: string;
  
  /**
   * Available tabs to show
   */
  tabs?: OrganizationProfileTab[];
  
  /**
   * Initial active tab
   */
  defaultTab?: OrganizationProfileTab;
  
  /**
   * Callback when organization is updated
   */
  onUpdate?: (organization: Organization) => void;
  
  /**
   * Custom className
   */
  className?: string;
}

/**
 * Full organization profile and settings page
 * 
 * @example
 * ```tsx
 * <OrganizationProfile
 *   tabs={['general', 'members', 'settings']}
 *   defaultTab="general"
 *   onUpdate={(org) => console.log('Updated:', org)}
 * />
 * ```
 */
export function OrganizationProfile({
  organizationId,
  tabs = ['general', 'members', 'settings'],
  defaultTab = 'general',
  onUpdate,
  className = '',
}: OrganizationProfileProps) {
  const { activeOrganization, organizations, isSupported } = useOrganization();
  const [activeTab, setActiveTab] = useState<OrganizationProfileTab>(defaultTab);
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    if (organizationId) {
      // Find organization by ID
      const org = organizations.find(o => o.id === organizationId);
      setOrganization(org || null);
    } else {
      // Use active organization
      setOrganization(activeOrganization);
    }
  }, [organizationId, activeOrganization, organizations]);

  if (!isSupported) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <p className="text-muted-foreground">
          Organizations are not supported with your current authentication provider.
        </p>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <p className="text-muted-foreground">
          No organization found. Please select an organization first.
        </p>
      </div>
    );
  }

  const tabConfig: Record<OrganizationProfileTab, { label: string; icon: React.ReactNode }> = {
    general: {
      label: 'General',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    members: {
      label: 'Members',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    settings: {
      label: 'Settings',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="border-b pb-6 mb-6">
        <div className="flex items-start gap-4">
          {organization.logoUrl ? (
            <img 
              src={organization.logoUrl} 
              alt={organization.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-2xl font-bold">
              {organization.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            {organization.slug && (
              <p className="text-muted-foreground mt-1">@{organization.slug}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {tabConfig[tab].icon}
              {tabConfig[tab].label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Organization Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <div className="mt-1 font-medium">{organization.name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Slug</label>
                  <div className="mt-1 font-mono text-sm">{organization.slug}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Organization ID</label>
                  <div className="mt-1 font-mono text-sm text-muted-foreground">{organization.id}</div>
                </div>
                {organization.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <div className="mt-1">{new Date(organization.createdAt).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Organization Members</h2>
              <p className="text-muted-foreground text-sm">
                Member management is currently not available through the UI. 
                Please use your authentication provider&apos;s dashboard to manage members.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Organization Settings</h2>
              <p className="text-muted-foreground text-sm">
                Advanced settings are managed through your authentication provider&apos;s dashboard.
              </p>
            </div>
            
            <div className="rounded-lg border border-destructive/50 p-6">
              <h2 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Irreversible actions that affect your organization.
              </p>
              <button
                className="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
                    console.log('Delete organization:', organization.id);
                  }
                }}
              >
                Delete Organization
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

