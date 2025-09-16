'use client';

import React from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield,
  Edit,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserDetailProps {
  userId: string;
}

interface UserProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    date_joined: string;
    last_login: string;
    is_active: boolean;
  };
  role: string;
  employee_id?: string;
  student_id?: string;
  phone_number?: string;
  address?: string;
  emergency_contact?: string;
  date_of_birth?: string;
  profile_picture?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function UserDetail({ userId }: UserDetailProps) {
  const router = useRouter();
  
  // Fetch user data
  const { data: userData, loading, error } = useApi<UserProfile>(`/admin/users/${userId}/`);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 h-64 bg-gray-200 rounded"></div>
            <div className="lg:col-span-2 h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading user
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">User not found</h3>
        <p className="text-gray-500">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN': 'Administrator',
      'FACULTY': 'Faculty Member',
      'STUDENT': 'Student',
      'PARENT': 'Parent',
      'LIBRARIAN': 'Librarian',
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'ADMIN': 'bg-red-100 text-red-800',
      'FACULTY': 'bg-blue-100 text-blue-800',
      'STUDENT': 'bg-green-100 text-green-800',
      'PARENT': 'bg-yellow-100 text-yellow-800',
      'LIBRARIAN': 'bg-purple-100 text-purple-800',
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {userData.user.first_name} {userData.user.last_name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              User Details
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link href={`/admin/users/${userId}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center mb-4">
                  {userData.profile_picture ? (
                    <img
                      className="h-24 w-24 rounded-full object-cover"
                      src={userData.profile_picture}
                      alt={`${userData.user.first_name} ${userData.user.last_name}`}
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-600" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {userData.user.first_name} {userData.user.last_name}
                </h3>
                <p className="text-sm text-gray-500">@{userData.user.username}</p>
                <div className="mt-4">
                  <Badge className={getRoleColor(userData.role)}>
                    {getRoleDisplayName(userData.role)}
                  </Badge>
                </div>
                <div className="mt-4">
                  <Badge 
                    className={userData.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }
                  >
                    {userData.is_active ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Username</label>
                  <p className="text-sm text-gray-900">{userData.user.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {userData.user.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">First Name</label>
                  <p className="text-sm text-gray-900">{userData.user.first_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Name</label>
                  <p className="text-sm text-gray-900">{userData.user.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="text-sm text-gray-900">{getRoleDisplayName(userData.role)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ID Number</label>
                  <p className="text-sm text-gray-900">
                    {userData.student_id || userData.employee_id || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {userData.phone_number || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {userData.date_of_birth 
                      ? new Date(userData.date_of_birth).toLocaleDateString()
                      : 'Not provided'
                    }
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {userData.address || 'Not provided'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                  <p className="text-sm text-gray-900">
                    {userData.emergency_contact || 'Not provided'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date Joined</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(userData.user.date_joined).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Login</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {userData.user.last_login 
                      ? new Date(userData.user.last_login).toLocaleString()
                      : 'Never'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Status</label>
                  <p className="text-sm text-gray-900">
                    {userData.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Profile Created</label>
                  <p className="text-sm text-gray-900">
                    {new Date(userData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
