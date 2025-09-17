'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface SystemLayoutProps {
  children: React.ReactNode;
}

export default function SystemLayout({ children }: SystemLayoutProps) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}


