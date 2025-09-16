'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { usePermissions } from '@/contexts/PermissionContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import Breadcrumbs from './Breadcrumbs';
import Loading from '../Loading';
import { PermissionGate } from '../PermissionGate';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const { hasPermission } = usePermissions();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth?redirect=/admin');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <Loading text="Loading admin panel..." />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirecting to Login...</h1>
          <p className="text-gray-600">Please wait while we redirect you to the login page.</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGate
      requiredPermission="can_access_admin_panel"
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access the admin panel.</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main Content */}
        <div className="lg:ml-64 min-h-screen flex flex-col">
          {/* Header */}
          <AdminHeader 
            onMenuClick={handleMenuClick}
            user={user}
          />
          
          {/* Page Content */}
          <main className="flex-1 py-6 w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              {/* Breadcrumbs */}
              <div className="mb-6">
                <Breadcrumbs />
              </div>
              
              {children}
            </div>
          </main>
        </div>
      </div>
    </PermissionGate>
  );
}
