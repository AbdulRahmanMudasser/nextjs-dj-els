'use client';

import React, { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useApiMutation } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield,
  Save,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserEditProps {
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

export default function UserEdit({ userId }: UserEditProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    role: '',
    phone_number: '',
    address: '',
    emergency_contact: '',
    date_of_birth: '',
    student_id: '',
    employee_id: '',
    is_active: true
  });
  
  const { mutate: updateUser } = useApiMutation();
  
  // Fetch user data
  const { data: userData, loading, error } = useApi<UserProfile>(`/admin/users/${userId}/`);

  // Update form data when user data is loaded
  React.useEffect(() => {
    if (userData) {
      setFormData({
        first_name: userData.user.first_name || '',
        last_name: userData.user.last_name || '',
        email: userData.user.email || '',
        username: userData.user.username || '',
        role: userData.role || '',
        phone_number: userData.phone_number || '',
        address: userData.address || '',
        emergency_contact: userData.emergency_contact || '',
        date_of_birth: userData.date_of_birth || '',
        student_id: userData.student_id || '',
        employee_id: userData.employee_id || '',
        is_active: userData.is_active
      });
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await updateUser(`/admin/users/${userId}/`, 'PUT', formData);
      router.push(`/admin/users/${userId}`);
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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
              Edit User: {userData.user.first_name} {userData.user.last_name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Update user information
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            onClick={() => router.push(`/admin/users/${userId}`)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Badge className="bg-blue-100 text-blue-800">
                      {getRoleDisplayName(userData.role)}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center justify-center space-x-2">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Active Account</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <Input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <Input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username *
                    </label>
                    <Input
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="ADMIN">Administrator</option>
                      <option value="FACULTY">Faculty Member</option>
                      <option value="STUDENT">Student</option>
                      <option value="PARENT">Parent</option>
                      <option value="LIBRARIAN">Librarian</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <Input
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                    />
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact
                    </label>
                    <Input
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-specific Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Role-specific Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    <Input
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleInputChange}
                      placeholder="For students only"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID
                    </label>
                    <Input
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleInputChange}
                      placeholder="For faculty/staff only"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
