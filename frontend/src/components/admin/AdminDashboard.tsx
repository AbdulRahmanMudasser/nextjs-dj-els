'use client';

import React from 'react';
import { useApi } from '@/hooks/useApi';
import { DashboardMetrics } from '@/types/admin';
import MetricsGrid from './dashboard/MetricsGrid';
import QuickActions from './dashboard/QuickActions';
import ActivityFeed from './dashboard/ActivityFeed';
import AnalyticsCharts from './dashboard/AnalyticsCharts';
import SystemHealth from './dashboard/SystemHealth';

export default function AdminDashboard() {
  // Fetch dashboard data
  const { data: dashboardData, loading, error } = useApi<DashboardMetrics>('/admin/dashboard/');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading dashboard
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to the Learning Management System admin panel
        </p>
      </div>

      {/* System Health Status */}
      <SystemHealth data={dashboardData?.systemHealth} />

      {/* Key Metrics */}
      <MetricsGrid data={dashboardData} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCharts data={dashboardData} />
        <ActivityFeed data={dashboardData} />
      </div>
    </div>
  );
}
