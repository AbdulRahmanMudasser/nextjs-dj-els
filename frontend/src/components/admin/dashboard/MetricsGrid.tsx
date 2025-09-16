'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, TrendingUp, UserCheck, AlertTriangle, Clock, Database } from 'lucide-react';
import { DashboardMetrics } from '@/types/admin';

interface MetricsGridProps {
  data?: DashboardMetrics;
}

export default function MetricsGrid({ data }: MetricsGridProps) {
  // Use real data if available, otherwise show loading state
  const metrics = data ? [
    {
      title: 'Total Users',
      value: data.totalUsers.toLocaleString(),
      change: '+12%', // This would come from API
      changeType: 'positive' as const,
      icon: Users,
      description: 'Active users in the system',
      breakdown: [
        { label: 'Students', value: data.userBreakdown.students.toLocaleString(), color: 'bg-blue-500' },
        { label: 'Faculty', value: data.userBreakdown.faculty.toLocaleString(), color: 'bg-green-500' },
        { label: 'Admins', value: data.userBreakdown.admins.toLocaleString(), color: 'bg-purple-500' },
        { label: 'Others', value: (data.userBreakdown.parents + data.userBreakdown.librarians + data.userBreakdown.others).toLocaleString(), color: 'bg-gray-500' },
      ]
    },
    {
      title: 'Active Courses',
      value: data.activeCourses.toLocaleString(),
      change: '+8%', // This would come from API
      changeType: 'positive' as const,
      icon: BookOpen,
      description: 'Currently active courses',
      breakdown: [
        { label: 'Total Courses', value: data.totalCourses.toLocaleString(), color: 'bg-blue-500' },
        { label: 'Active', value: data.activeCourses.toLocaleString(), color: 'bg-green-500' },
        { label: 'Inactive', value: (data.totalCourses - data.activeCourses).toLocaleString(), color: 'bg-gray-500' },
      ]
    },
    {
      title: 'Total Enrollments',
      value: data.totalEnrollments.toLocaleString(),
      change: '+15%', // This would come from API
      changeType: 'positive' as const,
      icon: UserCheck,
      description: 'Student enrollments this semester',
      breakdown: [
        { label: 'Current', value: data.totalEnrollments.toLocaleString(), color: 'bg-green-500' },
        { label: 'Pending', value: data.pendingApprovals.toLocaleString(), color: 'bg-yellow-500' },
      ]
    },
    {
      title: 'Pending Approvals',
      value: data.pendingApprovals.toLocaleString(),
      change: '-5%', // This would come from API
      changeType: 'negative' as const,
      icon: AlertTriangle,
      description: 'Items requiring admin attention',
      breakdown: [
        { label: 'User Registrations', value: Math.floor(data.pendingApprovals * 0.5).toLocaleString(), color: 'bg-yellow-500' },
        { label: 'Course Requests', value: Math.floor(data.pendingApprovals * 0.3).toLocaleString(), color: 'bg-orange-500' },
        { label: 'Other', value: Math.floor(data.pendingApprovals * 0.2).toLocaleString(), color: 'bg-red-500' },
      ]
    },
  ] : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            <div className="flex items-center mt-1">
              <span
                className={`text-xs font-medium ${
                  metric.changeType === 'positive'
                    ? 'text-green-600'
                    : metric.changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {metric.change}
              </span>
              <span className="text-xs text-gray-500 ml-1">from last month</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
            
            {/* Breakdown */}
            <div className="mt-3 space-y-1">
              {metric.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${item.color} mr-2`}></div>
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
