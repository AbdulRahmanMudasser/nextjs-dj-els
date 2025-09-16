'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import UserDetail from '@/components/admin/users/UserDetail';

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <AdminLayout>
      <UserDetail userId={userId} />
    </AdminLayout>
  );
}
