'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import BulkImport from '@/components/admin/users/BulkImport';

export default function BulkImportPage() {
  return (
    <AdminLayout>
      <BulkImport />
    </AdminLayout>
  );
}
