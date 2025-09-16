'use client';

import React, { ReactNode } from 'react';
import { usePermissions } from '@/contexts/PermissionContext';

interface PermissionGateProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  role?: string;
  roles?: string[];
  requireAllRoles?: boolean;
  resource?: string;
  action?: string;
  resourceId?: number;
  fallback?: ReactNode;
  showError?: boolean;
  errorMessage?: string;
}

export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  requireAllRoles = false,
  resource,
  action,
  resourceId,
  fallback = null,
  showError = false,
  errorMessage = 'You do not have permission to access this content.',
}: PermissionGateProps) {
  const {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    canAccess,
    isLoading,
  } = usePermissions();

  // Show loading state
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>;
  }

  let hasAccess = true;

  // Check permissions
  if (permission) {
    hasAccess = hasAccess && hasPermission(permission);
  }

  if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAccess && hasAllPermissions(permissions);
    } else {
      hasAccess = hasAccess && hasAnyPermission(permissions);
    }
  }

  // Check roles
  if (role) {
    hasAccess = hasAccess && hasRole(role);
  }

  if (roles && roles.length > 0) {
    if (requireAllRoles) {
      hasAccess = hasAccess && hasAllRoles(roles);
    } else {
      hasAccess = hasAccess && hasAnyRole(roles);
    }
  }

  // Check resource access
  if (resource && action) {
    hasAccess = hasAccess && canAccess(resource, action, resourceId);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Access Denied
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {errorMessage}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{fallback}</>;
}

// Convenience components for common use cases
export function AdminGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate role="ADMIN" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function FacultyGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate roles={['ADMIN', 'FACULTY']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function StudentGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate roles={['ADMIN', 'FACULTY', 'STUDENT']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function CreateCourseGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate permission="can_create_courses" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function GradeAssignmentsGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate permission="can_grade_assignments" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function ManageUsersGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate permission="can_create_users" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function AccessAdminGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate permission="can_access_admin_panel" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}
