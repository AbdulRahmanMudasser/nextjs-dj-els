'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import RoleManagement from '@/components/admin/users/RoleManagement';

export default function AdminUsersRolesPage() {
  return (
    <AdminLayout>
      <RoleManagement />
    </AdminLayout>
  );
}
