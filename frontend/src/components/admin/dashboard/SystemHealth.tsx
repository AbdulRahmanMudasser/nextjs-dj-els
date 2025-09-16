'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, Database, HardDrive, Cpu, Wifi, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { SystemHealth as SystemHealthType } from '@/types/admin';

interface SystemHealthProps {
  data?: SystemHealthType;
}

export default function SystemHealth({ data }: SystemHealthProps) {
  // Use real data if available, otherwise show loading state
  const systemMetrics = data ? [
    {
      name: 'API Server',
      status: data.status,
      responseTime: '45ms', // This would come from API
      uptime: `${data.uptime}%`,
      icon: Server,
      color: data.status === 'healthy' ? 'text-green-500' : data.status === 'warning' ? 'text-yellow-500' : 'text-red-500',
      bgColor: data.status === 'healthy' ? 'bg-green-50' : data.status === 'warning' ? 'bg-yellow-50' : 'bg-red-50',
    },
    {
      name: 'Database',
      status: data.databaseStatus === 'connected' ? 'healthy' : 'error',
      responseTime: '12ms', // This would come from API
      uptime: '99.8%', // This would come from API
      icon: Database,
      color: data.databaseStatus === 'connected' ? 'text-green-500' : 'text-red-500',
      bgColor: data.databaseStatus === 'connected' ? 'bg-green-50' : 'bg-red-50',
    },
    {
      name: 'Storage',
      status: data.diskUsage > 90 ? 'error' : data.diskUsage > 75 ? 'warning' : 'healthy',
      usage: `${data.diskUsage}%`,
      available: `${100 - data.diskUsage}%`,
      icon: HardDrive,
      color: data.diskUsage > 90 ? 'text-red-500' : data.diskUsage > 75 ? 'text-yellow-500' : 'text-green-500',
      bgColor: data.diskUsage > 90 ? 'bg-red-50' : data.diskUsage > 75 ? 'bg-yellow-50' : 'bg-green-50',
    },
    {
      name: 'CPU Usage',
      status: data.serverLoad > 90 ? 'error' : data.serverLoad > 75 ? 'warning' : 'healthy',
      usage: `${data.serverLoad}%`,
      load: data.serverLoad.toFixed(1),
      icon: Cpu,
      color: data.serverLoad > 90 ? 'text-red-500' : data.serverLoad > 75 ? 'text-yellow-500' : 'text-green-500',
      bgColor: data.serverLoad > 90 ? 'bg-red-50' : data.serverLoad > 75 ? 'bg-yellow-50' : 'bg-green-50',
    },
    {
      name: 'Memory',
      status: data.memoryUsage > 90 ? 'error' : data.memoryUsage > 75 ? 'warning' : 'healthy',
      usage: `${data.memoryUsage}%`,
      connections: data.activeConnections,
      icon: Wifi,
      color: data.memoryUsage > 90 ? 'text-red-500' : data.memoryUsage > 75 ? 'text-yellow-500' : 'text-green-500',
      bgColor: data.memoryUsage > 90 ? 'bg-red-50' : data.memoryUsage > 75 ? 'bg-yellow-50' : 'bg-green-50',
    },
  ] : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="h-5 w-5 mr-2" />
          System Health Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {systemMetrics.map((metric, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`flex-shrink-0 p-2 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {metric.name}
                  </p>
                  {getStatusIcon(metric.status)}
                </div>
                <div className="mt-1">
                  {getStatusBadge(metric.status)}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {metric.responseTime && (
                    <div>Response: {metric.responseTime}</div>
                  )}
                  {metric.uptime && (
                    <div>Uptime: {metric.uptime}</div>
                  )}
                  {metric.usage && (
                    <div>Usage: {metric.usage}</div>
                  )}
                  {metric.available && (
                    <div>Available: {metric.available}</div>
                  )}
                  {metric.latency && (
                    <div>Latency: {metric.latency}</div>
                  )}
                  {metric.connections && (
                    <div>Connections: {metric.connections}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Overall Status */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {data ? (
                data.status === 'healthy' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : data.status === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )
              ) : (
                <Clock className="h-5 w-5 text-gray-500" />
              )}
              <span className="text-sm font-medium text-gray-900">
                Overall System Status: {data ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Loading...'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {data ? 'Just now' : 'Loading...'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
