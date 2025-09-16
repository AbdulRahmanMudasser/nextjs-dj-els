'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, BookOpen, FileText, MessageSquare, AlertTriangle } from 'lucide-react';

interface ActivityFeedProps {
  data?: any;
}

export default function ActivityFeed({ data }: ActivityFeedProps) {
  // Mock data for now - will be replaced with real API data
  const activities = [
    {
      id: 1,
      type: 'user_registration',
      title: 'New user registered',
      description: 'John Doe registered as a student',
      timestamp: '2 minutes ago',
      icon: User,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      id: 2,
      type: 'course_created',
      title: 'Course created',
      description: 'Data Structures and Algorithms course was created',
      timestamp: '15 minutes ago',
      icon: BookOpen,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      id: 3,
      type: 'assignment_submitted',
      title: 'Assignment submitted',
      description: 'Sarah Wilson submitted Programming Assignment 1',
      timestamp: '1 hour ago',
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      id: 4,
      type: 'message_sent',
      title: 'Message sent',
      description: 'Dr. Smith sent a message to CS201 students',
      timestamp: '2 hours ago',
      icon: MessageSquare,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      id: 5,
      type: 'system_alert',
      title: 'System alert',
      description: 'High CPU usage detected on server',
      timestamp: '3 hours ago',
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      id: 6,
      type: 'user_login',
      title: 'User login',
      description: 'Admin user logged in from new location',
      timestamp: '4 hours ago',
      icon: User,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
  ];

  const getActivityTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'user_registration': 'User',
      'course_created': 'Course',
      'assignment_submitted': 'Assignment',
      'message_sent': 'Message',
      'system_alert': 'System',
      'user_login': 'Security',
    };
    return typeMap[type] || 'General';
  };

  const getActivityTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'user_registration': 'bg-blue-100 text-blue-800',
      'course_created': 'bg-green-100 text-green-800',
      'assignment_submitted': 'bg-purple-100 text-purple-800',
      'message_sent': 'bg-yellow-100 text-yellow-800',
      'system_alert': 'bg-red-100 text-red-800',
      'user_login': 'bg-indigo-100 text-indigo-800',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 p-2 rounded-full ${activity.bgColor}`}>
                <activity.icon className={`h-4 w-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <Badge className={getActivityTypeColor(activity.type)}>
                    {getActivityTypeLabel(activity.type)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a
            href="/admin/system/logs"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            View all activity logs →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
