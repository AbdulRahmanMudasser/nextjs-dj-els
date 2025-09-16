'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

interface PermissionContextType {
  permissions: string[];
  roles: string[];
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  canAccess: (resource: string, action: string, resourceId?: number) => boolean;
  isLoading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const { isAuthenticated, token } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    // Only fetch permissions if user is authenticated
    if (!isAuthenticated || !token) {
      setPermissions([]);
      setRoles([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const [permissionsResponse, rolesResponse] = await Promise.all([
        apiClient.get<{ permissions: string[] }>('/rbac/permission-checks/my_permissions/'),
        apiClient.get<{ roles: any[] }>('/rbac/permission-checks/my_roles/')
      ]);
      
      setPermissions(permissionsResponse.permissions || []);
      setRoles(rolesResponse.roles?.map((role: any) => role.code) || []);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
      setPermissions([]);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPermissions = async () => {
    await fetchPermissions();
  };

  useEffect(() => {
    fetchPermissions();
  }, [isAuthenticated, token]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every(permission => permissions.includes(permission));
  };

  const hasAnyRole = (roleList: string[]): boolean => {
    return roleList.some(role => roles.includes(role));
  };

  const hasAllRoles = (roleList: string[]): boolean => {
    return roleList.every(role => roles.includes(role));
  };

  const canAccess = (resource: string, action: string, resourceId?: number): boolean => {
    // This is a simplified implementation
    // In a real application, you might want to make API calls to check specific resource access
    const permission = `${action}_${resource.toLowerCase()}`;
    return hasPermission(permission);
  };

  const value: PermissionContextType = {
    permissions,
    roles,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    canAccess,
    isLoading,
    error,
    refreshPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}
