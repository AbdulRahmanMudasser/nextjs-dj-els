'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, BookOpen, BarChart3 } from 'lucide-react';

interface AnalyticsChartsProps {
  data?: any;
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  // Mock data for charts - will be replaced with real chart library
  const userGrowthData = [
    { month: 'Jan', users: 1200 },
    { month: 'Feb', users: 1350 },
    { month: 'Mar', users: 1450 },
    { month: 'Apr', users: 1600 },
    { month: 'May', users: 1750 },
    { month: 'Jun', users: 1900 },
  ];

  const courseEnrollmentData = [
    { course: 'CS101', enrollment: 120 },
    { course: 'CS201', enrollment: 95 },
    { course: 'CS301', enrollment: 80 },
    { course: 'MATH101', enrollment: 150 },
    { course: 'PHYS101', enrollment: 110 },
  ];

  const roleDistribution = [
    { role: 'Students', count: 2156, percentage: 75.7, color: 'bg-blue-500' },
    { role: 'Faculty', count: 234, percentage: 8.2, color: 'bg-green-500' },
    { role: 'Admins', count: 12, percentage: 0.4, color: 'bg-purple-500' },
    { role: 'Others', count: 445, percentage: 15.7, color: 'bg-gray-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Analytics Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Growth Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            User Growth Trend
          </h3>
          <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-between p-4">
            {userGrowthData.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="bg-blue-500 rounded-t w-8 mb-2"
                  style={{ height: `${(item.users / 2000) * 100}px` }}
                ></div>
                <span className="text-xs text-gray-600">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Course Enrollment */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Top Enrolled Courses
          </h3>
          <div className="space-y-2">
            {courseEnrollmentData.map((course, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{course.course}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(course.enrollment / 150) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {course.enrollment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Distribution */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            User Role Distribution
          </h3>
          <div className="space-y-3">
            {roleDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-600">{item.role}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {item.count}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
