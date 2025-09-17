'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Activity, HardDrive, History, Server, Database, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SystemPage() {
  const router = useRouter();

  const systemSections = [
    {
      title: 'Settings',
      description: 'Configure system-wide settings and preferences',
      icon: Settings,
      href: '/admin/system/settings',
      color: 'bg-blue-500',
      features: ['General Settings', 'Email Configuration', 'Security Settings', 'API Keys']
    },
    {
      title: 'Monitoring',
      description: 'Real-time system monitoring and health checks',
      icon: Activity,
      href: '/admin/system/monitoring',
      color: 'bg-green-500',
      features: ['Performance Metrics', 'Health Status', 'Alert Management', 'Resource Usage']
    },
    {
      title: 'Backups',
      description: 'Manage system backups and data recovery',
      icon: HardDrive,
      href: '/admin/system/backups',
      color: 'bg-purple-500',
      features: ['Automated Backups', 'Manual Backups', 'Restore Points', 'Storage Management']
    },
    {
      title: 'Logs',
      description: 'System logs, audit trails, and debugging information',
      icon: History,
      href: '/admin/system/logs',
      color: 'bg-orange-500',
      features: ['System Logs', 'Error Logs', 'Audit Trails', 'Debug Information']
    },
  ];

  const systemStats = [
    { title: 'System Uptime', value: '99.9%', icon: Server, status: 'healthy' },
    { title: 'Database Status', value: 'Online', icon: Database, status: 'healthy' },
    { title: 'Last Backup', value: '2 hours ago', icon: HardDrive, status: 'healthy' },
    { title: 'Security Status', value: 'Protected', icon: Shield, status: 'healthy' },
  ];

  const recentActivities = [
    { action: 'System backup completed', time: '2 hours ago', type: 'backup' },
    { action: 'Security scan completed', time: '4 hours ago', type: 'security' },
    { action: 'Database optimization', time: '6 hours ago', type: 'maintenance' },
    { action: 'User login attempt failed', time: '8 hours ago', type: 'security' },
    { action: 'System update installed', time: '1 day ago', type: 'update' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'backup': return HardDrive;
      case 'security': return Shield;
      case 'maintenance': return Settings;
      case 'update': return Clock;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage system health, settings, and maintenance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Health Check
          </Button>
          <Button className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Quick Settings
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center mt-2">
                  <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(stat.status).split(' ')[1]}`}></div>
                  <span className={`text-xs ${getStatusColor(stat.status).split(' ')[0]}`}>
                    {stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {systemSections.map((section) => {
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

      {/* Recent System Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activities</CardTitle>
          <CardDescription>Latest system events and maintenance activities</CardDescription>
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
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor('healthy')}`}>
                    {activity.type}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Current system performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <span className="text-sm font-medium">Network I/O</span>
              <span className="text-sm text-gray-500">12%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '12%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common system management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <HardDrive className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Activity className="h-4 w-4 mr-2" />
              Run Health Check
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Security Scan
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              System Maintenance
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


