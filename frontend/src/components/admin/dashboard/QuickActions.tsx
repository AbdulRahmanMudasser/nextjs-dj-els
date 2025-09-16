'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/contexts/PermissionContext';
import {
  UserPlus,
  BookOpen,
  Bell,
  FileText,
  Database,
  History,
  Upload,
  Settings,
  BarChart3,
  MessageSquare,
  Shield
} from 'lucide-react';

export default function QuickActions() {
  const { hasPermission } = usePermissions();

  const actions = [
    {
      title: 'Add New User',
      description: 'Create a new user account',
      icon: UserPlus,
      href: '/admin/users/add',
      permission: 'can_create_users',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Create Course',
      description: 'Add a new course to the system',
      icon: BookOpen,
      href: '/admin/academic/courses/add',
      permission: 'can_create_courses',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Send Announcement',
      description: 'Broadcast message to users',
      icon: Bell,
      href: '/admin/communications/announcements/new',
      permission: 'can_send_announcements',
      color: 'bg-yellow-500 hover:bg-yellow-600',
    },
    {
      title: 'Generate Report',
      description: 'Create system reports',
      icon: FileText,
      href: '/admin/reports/standard',
      permission: 'can_generate_reports',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'System Backup',
      description: 'Create system backup',
      icon: Database,
      href: '/admin/system/backups',
      permission: 'can_modify_system_settings',
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      title: 'View System Logs',
      description: 'Monitor system activity',
      icon: History,
      href: '/admin/system/logs',
      permission: 'can_view_system_logs',
      color: 'bg-gray-500 hover:bg-gray-600',
    },
    {
      title: 'Bulk Import Users',
      description: 'Import users from CSV',
      icon: Upload,
      href: '/admin/users/import',
      permission: 'can_create_users',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      title: 'System Settings',
      description: 'Configure system options',
      icon: Settings,
      href: '/admin/system/settings',
      permission: 'can_modify_system_settings',
      color: 'bg-teal-500 hover:bg-teal-600',
    },
  ];

  const filteredActions = actions.filter(action => 
    !action.permission || hasPermission(action.permission)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all"
              >
                <div className={`p-3 rounded-full text-white ${action.color}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-sm text-gray-900">{action.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
