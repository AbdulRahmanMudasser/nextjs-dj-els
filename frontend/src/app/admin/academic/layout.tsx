'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface AcademicLayoutProps {
  children: React.ReactNode;
}

export default function AcademicLayout({ children }: AcademicLayoutProps) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}

