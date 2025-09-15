'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/Layout';
import UserProfile from '@/components/profile/UserProfile';

function ProfileContent() {
  return (
    <Layout>
      <UserProfile />
    </Layout>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
