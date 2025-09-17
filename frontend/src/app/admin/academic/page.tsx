'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, BookOpen, Calendar, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AcademicPage() {
  const router = useRouter();

  const academicSections = [
    {
      title: 'Departments',
      description: 'Manage academic departments and their details',
      icon: Building2,
      href: '/admin/academic/departments',
      color: 'bg-blue-500',
    },
    {
      title: 'Programs',
      description: 'Manage academic programs and degree types',
      icon: BookOpen,
      href: '/admin/academic/programs',
      color: 'bg-green-500',
    },
    {
      title: 'Courses',
      description: 'Manage courses and course offerings',
      icon: BookOpen,
      href: '/admin/academic/courses',
      color: 'bg-purple-500',
    },
    {
      title: 'Semesters',
      description: 'Manage academic semesters and terms',
      icon: Calendar,
      href: '/admin/academic/semesters',
      color: 'bg-orange-500',
    },
    {
      title: 'Enrollments',
      description: 'Manage student enrollments in courses',
      icon: Users,
      href: '/admin/academic/enrollments',
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage departments, programs, courses, and semesters
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/academic/departments')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Quick Add
        </Button>
      </div>

      {/* Academic Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {academicSections.map((section) => {
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
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(section.href);
                  }}
                >
                  Manage {section.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Active programs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Active courses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Active semester
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

