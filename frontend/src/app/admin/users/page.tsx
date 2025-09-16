'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import UserManagement from '@/components/admin/users/UserManagement';

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <UserManagement />
    </AdminLayout>
  );
}
