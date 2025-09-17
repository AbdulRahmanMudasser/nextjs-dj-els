'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Bell, FileText, Mail, Send, Users, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CommunicationsPage() {
  const router = useRouter();

  const communicationSections = [
    {
      title: 'Announcements',
      description: 'Create and manage system-wide announcements',
      icon: Bell,
      href: '/admin/communications/announcements',
      color: 'bg-blue-500',
      features: ['Broadcast Messages', 'Targeted Notifications', 'Scheduled Announcements', 'Delivery Tracking']
    },
    {
      title: 'Templates',
      description: 'Manage email and message templates',
      icon: FileText,
      href: '/admin/communications/templates',
      color: 'bg-green-500',
      features: ['Email Templates', 'SMS Templates', 'Push Notifications', 'Template Variables']
    },
    {
      title: 'Email History',
      description: 'View and manage email communication history',
      icon: Mail,
      href: '/admin/communications/email-history',
      color: 'bg-purple-500',
      features: ['Sent Emails', 'Delivery Status', 'Bounce Tracking', 'Unsubscribe Management']
    },
  ];

  const communicationStats = [
    { title: 'Messages Sent Today', value: '1,247', icon: Send, change: '+12%' },
    { title: 'Active Templates', value: '23', icon: FileText, change: '+3' },
    { title: 'Delivery Rate', value: '98.5%', icon: CheckCircle, change: '+0.2%' },
    { title: 'Pending Messages', value: '8', icon: Clock, change: '-2' },
  ];

  const recentActivities = [
    { action: 'Announcement sent to all users', time: '2 hours ago', type: 'announcement', status: 'sent' },
    { action: 'Email template updated', time: '4 hours ago', type: 'template', status: 'updated' },
    { action: 'Bulk email campaign completed', time: '6 hours ago', type: 'email', status: 'completed' },
    { action: 'New template created', time: '8 hours ago', type: 'template', status: 'created' },
    { action: 'Scheduled announcement sent', time: '1 day ago', type: 'announcement', status: 'sent' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'updated': return 'text-yellow-600 bg-yellow-100';
      case 'created': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'announcement': return Bell;
      case 'template': return FileText;
      case 'email': return Mail;
      default: return MessageSquare;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage announcements, templates, and email communications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Quick Send
          </Button>
          <Button className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            New Announcement
          </Button>
        </div>
      </div>

      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {communicationStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change} from yesterday
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Communication Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {communicationSections.map((section) => {
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
                  {section.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                      {feature}
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

      {/* Recent Communication Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Communication Activities</CardTitle>
          <CardDescription>Latest communication events and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded">
                      <ActivityIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common communication tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-2" />
              Send Announcement
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Create Template
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Send Bulk Email
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Manage Recipients
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communication Overview</CardTitle>
            <CardDescription>Summary of communication metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Messages Sent</span>
              <span className="text-sm text-gray-500">12,847</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email Delivery Rate</span>
              <span className="text-sm text-gray-500">98.5%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '98.5%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Template Usage</span>
              <span className="text-sm text-gray-500">67%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '67%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">User Engagement</span>
              <span className="text-sm text-gray-500">89%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '89%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


