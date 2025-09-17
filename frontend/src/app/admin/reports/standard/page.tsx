'use client';

import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter, FileText, Users, BookOpen, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApi } from '@/hooks/useApi';

interface StandardReport {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  lastGenerated: string;
  frequency: string;
  status: 'available' | 'generating' | 'error';
  parameters: string[];
}

interface ReportData {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  revenue: number;
  growthRate: number;
}

export default function StandardReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('30');
  const [format, setFormat] = useState<string>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: reportData, loading } = useApi<ReportData>('/admin/reports/standard/data/');
  const { data: availableReports } = useApi<StandardReport[]>('/admin/reports/standard/list/');

  const standardReports = [
    {
      id: 1,
      name: 'User Activity Report',
      description: 'Comprehensive overview of user activities and engagement',
      category: 'Users',
      icon: 'Users',
      lastGenerated: '2024-01-15',
      frequency: 'Weekly',
      status: 'available' as const,
      parameters: ['Date Range', 'User Type', 'Activity Type']
    },
    {
      id: 2,
      name: 'Course Enrollment Report',
      description: 'Detailed analysis of course enrollments and trends',
      category: 'Academic',
      icon: 'BookOpen',
      lastGenerated: '2024-01-14',
      frequency: 'Monthly',
      status: 'available' as const,
      parameters: ['Semester', 'Department', 'Program']
    },
    {
      id: 3,
      name: 'System Performance Report',
      description: 'System metrics, performance indicators, and health status',
      category: 'System',
      icon: 'TrendingUp',
      lastGenerated: '2024-01-13',
      frequency: 'Daily',
      status: 'available' as const,
      parameters: ['Time Period', 'Metrics', 'Thresholds']
    },
    {
      id: 4,
      name: 'Financial Summary Report',
      description: 'Revenue, expenses, and financial performance analysis',
      category: 'Financial',
      icon: 'DollarSign',
      lastGenerated: '2024-01-12',
      frequency: 'Monthly',
      status: 'available' as const,
      parameters: ['Period', 'Revenue Type', 'Expense Category']
    },
    {
      id: 5,
      name: 'Academic Progress Report',
      description: 'Student progress, grades, and academic performance',
      category: 'Academic',
      icon: 'BookOpen',
      lastGenerated: '2024-01-11',
      frequency: 'Weekly',
      status: 'available' as const,
      parameters: ['Semester', 'Program', 'Grade Range']
    },
    {
      id: 6,
      name: 'Communication Analytics',
      description: 'Email campaigns, announcements, and communication effectiveness',
      category: 'Communication',
      icon: 'FileText',
      lastGenerated: '2024-01-10',
      frequency: 'Weekly',
      status: 'available' as const,
      parameters: ['Campaign Type', 'Recipients', 'Time Period']
    }
  ];

  const handleGenerateReport = async () => {
    if (!selectedReport) return;
    
    setIsGenerating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call the backend API
      console.log('Generating report:', selectedReport, 'with params:', { dateRange, format });
      
      // Show success message
      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons = {
      Users,
      BookOpen,
      TrendingUp,
      DollarSign,
      FileText
    };
    return icons[iconName as keyof typeof icons] || FileText;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Users: 'bg-blue-100 text-blue-800',
      Academic: 'bg-green-100 text-green-800',
      System: 'bg-purple-100 text-purple-800',
      Financial: 'bg-yellow-100 text-yellow-800',
      Communication: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6 w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Standard Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate pre-built reports for common administrative tasks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Report Generation Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select a report type and configure parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a report" />
                </SelectTrigger>
                <SelectContent>
                  {standardReports.map((report) => (
                    <SelectItem key={report.id} value={report.name}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={handleGenerateReport}
                disabled={!selectedReport || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {standardReports.map((report) => {
          const IconComponent = getIconComponent(report.icon);
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <IconComponent className="h-6 w-6 text-gray-600" />
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(report.category)}`}>
                    {report.category}
                  </span>
                </div>
                <CardTitle className="text-lg">{report.name}</CardTitle>
                <CardDescription className="text-sm">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p><strong>Frequency:</strong> {report.frequency}</p>
                  <p><strong>Last Generated:</strong> {report.lastGenerated}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Parameters:</p>
                  <div className="flex flex-wrap gap-1">
                    {report.parameters.map((param, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                        {param}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedReport(report.name)}
                  >
                    Select
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Statistics */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {reportData.activeUsers} active users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {reportData.totalEnrollments} enrollments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${reportData.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {reportData.growthRate > 0 ? '+' : ''}{reportData.growthRate}% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.growthRate}%</div>
              <p className="text-xs text-muted-foreground">
                Month over month
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

