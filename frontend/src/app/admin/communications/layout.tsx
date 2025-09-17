'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface CommunicationsLayoutProps {
  children: React.ReactNode;
}

export default function CommunicationsLayout({ children }: CommunicationsLayoutProps) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}


