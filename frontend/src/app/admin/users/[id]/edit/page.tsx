'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import UserEdit from '@/components/admin/users/UserEdit';

export default function AdminUserEditPage() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <AdminLayout>
      <UserEdit userId={userId} />
    </AdminLayout>
  );
}
