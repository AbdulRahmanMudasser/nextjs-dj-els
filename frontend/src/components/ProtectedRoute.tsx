'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { usePermissions } from '@/contexts/PermissionContext';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: string | string[];
  requireAllRoles?: boolean;
  requireAllPermissions?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  requireAllRoles = false,
  requireAllPermissions = false,
  fallback,
  redirectTo = '/auth',
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const {
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAllRoles,
    hasAnyPermission,
    hasAllPermissions,
    isLoading: permissionsLoading,
  } = usePermissions();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !permissionsLoading && !isAuthenticated && !isRedirecting) {
      setIsRedirecting(true);
      router.push(redirectTo);
    }
  }, [loading, permissionsLoading, isAuthenticated, isRedirecting, router, redirectTo]);

  // Show loading state
  if (loading || permissionsLoading) {
    return <Loading text="Loading..." />;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return fallback || <Loading text="Redirecting to login..." />;
  }

  // Check role requirements
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    let hasRequiredRole = false;

    if (requireAllRoles) {
      hasRequiredRole = hasAllRoles(roles);
    } else {
      hasRequiredRole = hasAnyRole(roles);
    }

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have the required role to access this page.
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Required: {Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Check permission requirements
  if (requiredPermission) {
    const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    let hasRequiredPermission = false;

    if (requireAllPermissions) {
      hasRequiredPermission = hasAllPermissions(permissions);
    } else {
      hasRequiredPermission = hasAnyPermission(permissions);
    }

    if (!hasRequiredPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have the required permission to access this page.
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Required: {Array.isArray(requiredPermission) ? requiredPermission.join(', ') : requiredPermission}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
