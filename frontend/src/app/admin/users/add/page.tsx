'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import UserForm from '@/components/admin/users/UserForm';

export default function AddUserPage() {
  return (
    <AdminLayout>
      <UserForm />
    </AdminLayout>
  );
}
