'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, FileText, TrendingUp, PieChart, Download, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsPage() {
  const router = useRouter();

  const reportSections = [
    {
      title: 'Standard Reports',
      description: 'Pre-built reports for common administrative tasks',
      icon: FileText,
      href: '/admin/reports/standard',
      color: 'bg-blue-500',
      reports: ['User Activity', 'Course Enrollment', 'System Usage', 'Financial Summary']
    },
    {
      title: 'Custom Reports',
      description: 'Create and manage custom report configurations',
      icon: TrendingUp,
      href: '/admin/reports/custom',
      color: 'bg-green-500',
      reports: ['Custom Analytics', 'Data Exports', 'Scheduled Reports', 'Report Builder']
    },
    {
      title: 'Analytics',
      description: 'Interactive dashboards and data visualization',
      icon: PieChart,
      href: '/admin/reports/analytics',
      color: 'bg-purple-500',
      reports: ['Performance Metrics', 'Trend Analysis', 'Comparative Studies', 'Predictive Analytics']
    },
  ];

  const quickStats = [
    { title: 'Total Reports Generated', value: '1,247', change: '+12%', trend: 'up' },
    { title: 'Active Custom Reports', value: '23', change: '+3', trend: 'up' },
    { title: 'Scheduled Reports', value: '8', change: '0', trend: 'neutral' },
    { title: 'Last Report Generated', value: '2 hours ago', change: '', trend: 'neutral' },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate insights and analyze system performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
          <Button
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {stat.change} from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {reportSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card
              key={section.title}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => router.push(section.href)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${section.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription className="text-sm">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.reports.map((report, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                      {report}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(section.href);
                  }}
                >
                  Access {section.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Your latest generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'User Activity Report', type: 'Standard', date: '2024-01-15', status: 'Completed', size: '2.3 MB' },
              { name: 'Course Enrollment Analytics', type: 'Custom', date: '2024-01-14', status: 'Completed', size: '1.8 MB' },
              { name: 'System Performance Report', type: 'Analytics', date: '2024-01-13', status: 'Processing', size: '-' },
              { name: 'Financial Summary Q4', type: 'Standard', date: '2024-01-12', status: 'Completed', size: '3.1 MB' },
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-gray-500">{report.type} • {report.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                  <span className="text-sm text-gray-500">{report.size}</span>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

