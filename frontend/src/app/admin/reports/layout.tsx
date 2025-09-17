'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface ReportsLayoutProps {
  children: React.ReactNode;
}

export default function ReportsLayout({ children }: ReportsLayoutProps) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}


