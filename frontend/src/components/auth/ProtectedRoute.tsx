'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Loading from '../Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const { user, permissions, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/auth');
    }
  }, [loading, isAuthenticated, isRedirecting, router]);

  if (loading) {
    return <Loading text="Loading..." />;
  }

  if (!isAuthenticated) {
    return fallback || <Loading text="Redirecting to login..." />;
  }

  if (requiredRole) {
    const userRole = user?.role;
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
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
                You don't have permission to access this page.
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
