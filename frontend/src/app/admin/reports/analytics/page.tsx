'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, BookOpen, Calendar, DollarSign, Activity, BarChart3, PieChart, LineChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';

interface AnalyticsData {
  userGrowth: {
    labels: string[];
    data: number[];
  };
  courseEnrollment: {
    labels: string[];
    data: number[];
  };
  revenue: {
    labels: string[];
    data: number[];
  };
  systemPerformance: {
    cpu: number;
    memory: number;
    disk: number;
    uptime: number;
  };
  topCourses: Array<{
    name: string;
    enrollments: number;
    revenue: number;
  }>;
  userActivity: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
    sessions: number;
  }>;
}

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const { data: analyticsData, loading } = useApi<AnalyticsData>('/admin/reports/analytics/');

  const metrics: MetricCard[] = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Active Courses',
      value: '156',
      change: '+8.2%',
      trend: 'up',
      icon: BookOpen
    },
    {
      title: 'Monthly Revenue',
      value: '$45,230',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      change: '+0.1%',
      trend: 'up',
      icon: Activity
    }
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Interactive dashboards and data visualization
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="users">User Analytics</SelectItem>
              <SelectItem value="courses">Course Analytics</SelectItem>
              <SelectItem value="revenue">Revenue Analytics</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${getTrendColor(metric.trend)}`}>
                  <span className="mr-1">{getTrendIcon(metric.trend)}</span>
                  {metric.change} from last period
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Growth
            </CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">User Growth Chart</p>
                <p className="text-sm text-gray-400">Chart visualization would be here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Enrollment Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Enrollment
            </CardTitle>
            <CardDescription>Enrollment trends by course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Enrollment Chart</p>
                <p className="text-sm text-gray-400">Chart visualization would be here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Analytics
            </CardTitle>
            <CardDescription>Revenue breakdown and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Revenue Chart</p>
                <p className="text-sm text-gray-400">Chart visualization would be here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Performance
            </CardTitle>
            <CardDescription>Real-time system metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-gray-500">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-gray-500">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className="text-sm text-gray-500">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-sm text-gray-500">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Courses</CardTitle>
          <CardDescription>Courses with highest enrollment and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Introduction to Computer Science', enrollments: 245, revenue: 12250 },
              { name: 'Data Structures and Algorithms', enrollments: 189, revenue: 9450 },
              { name: 'Web Development Fundamentals', enrollments: 167, revenue: 8350 },
              { name: 'Database Management Systems', enrollments: 143, revenue: 7150 },
              { name: 'Software Engineering Principles', enrollments: 134, revenue: 6700 },
            ].map((course, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm text-gray-500">{course.enrollments} enrollments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${course.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity Timeline</CardTitle>
          <CardDescription>Daily user activity metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: '2024-01-15', activeUsers: 1247, newUsers: 23, sessions: 3456 },
              { date: '2024-01-14', activeUsers: 1189, newUsers: 18, sessions: 3123 },
              { date: '2024-01-13', activeUsers: 1156, newUsers: 31, sessions: 2987 },
              { date: '2024-01-12', activeUsers: 1234, newUsers: 27, sessions: 3345 },
              { date: '2024-01-11', activeUsers: 1198, newUsers: 19, sessions: 3089 },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{new Date(activity.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">{activity.sessions} total sessions</p>
                </div>
                <div className="flex space-x-6">
                  <div className="text-center">
                    <p className="font-medium text-blue-600">{activity.activeUsers}</p>
                    <p className="text-xs text-gray-500">Active Users</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-green-600">{activity.newUsers}</p>
                    <p className="text-xs text-gray-500">New Users</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


