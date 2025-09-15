'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { apiClient } from '@/lib/api';
import Loading from '../Loading';

export default function UserProfile() {
  const { user, permissions, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    emergency_contact: user?.emergency_contact || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.updateProfile(formData);
      await refreshProfile();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      await apiClient.uploadAvatar(file);
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Loading text="Loading profile..." />;
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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture and Basic Info */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="relative inline-block">
                  {user.profile_picture ? (
                    <img
                      className="h-32 w-32 rounded-full object-cover"
                      src={user.profile_picture}
                      alt={user.full_name}
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-2xl font-medium text-gray-600">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={loading}
                  />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {user.full_name}
                </h2>
                <p className="text-sm text-gray-500">{getRoleDisplayName(user.role)}</p>
                <p className="text-sm text-gray-500">@{user.user.username}</p>
              </div>

              {/* Permissions */}
              {permissions && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Permissions</h3>
                  <div className="space-y-2">
                    {Object.entries(permissions)
                      .filter(([key, value]) => key !== 'role' && typeof value === 'boolean')
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-400' : 'bg-gray-300'}`} />
                          <span className="text-sm text-gray-600 capitalize">
                            {key.replace('can_', '').replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <textarea
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700">
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.user.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.phone_number || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Emergency Contact</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.emergency_contact || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Address</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.address || 'Not provided'}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(user.created_at).toLocaleDateString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(user.updated_at).toLocaleDateString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Terms Accepted</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.terms_accepted ? 'Yes' : 'No'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Privacy Policy Accepted</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.privacy_policy_accepted ? 'Yes' : 'No'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Role-specific information */}
                  {user.role === 'STUDENT' && user.student_profile && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Student ID</dt>
                          <dd className="mt-1 text-sm text-gray-900">{user.student_id}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Admission Year</dt>
                          <dd className="mt-1 text-sm text-gray-900">{user.student_profile.admission_year}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">GPA</dt>
                          <dd className="mt-1 text-sm text-gray-900">{user.student_profile.gpa}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {user.student_profile.is_alumni ? 'Alumni' : 'Current Student'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )}

                  {user.role === 'FACULTY' && user.faculty_profile && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Faculty Information</h3>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
                          <dd className="mt-1 text-sm text-gray-900">{user.employee_id}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Department</dt>
                          <dd className="mt-1 text-sm text-gray-900">{user.faculty_profile.department}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Designation</dt>
                          <dd className="mt-1 text-sm text-gray-900">{user.faculty_profile.designation}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Experience</dt>
                          <dd className="mt-1 text-sm text-gray-900">{user.faculty_profile.experience_years} years</dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
