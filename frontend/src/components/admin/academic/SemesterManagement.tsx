'use client';

import React, { useState, useEffect } from 'react';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { Semester, SemesterForm } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Clock, 
  Users,
  Download,
  Star
} from 'lucide-react';

interface SemesterManagementProps {}

export default function SemesterManagement({}: SemesterManagementProps) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [formData, setFormData] = useState<SemesterForm>({
    name: '',
    code: '',
    start_date: '',
    end_date: '',
    registration_start: '',
    registration_end: '',
    is_current: false,
    is_active: true,
  });

  // Fetch semesters
  const { data: semestersData, loading: semestersLoading, error: semestersError } = useApi<{results: Semester[]}>('/academics/semesters/');
  
  // Mutation hooks for CRUD operations
  const { mutate: createSemester, loading: createLoading } = useApiMutation<Semester, SemesterForm>();
  const { mutate: updateSemester, loading: updateLoading } = useApiMutation<Semester, SemesterForm>();
  const { mutate: deleteSemester, loading: deleteLoading } = useApiMutation<void>();

  useEffect(() => {
    if (semestersData) {
      setSemesters(semestersData.results);
    }
    setLoading(semestersLoading);
    setError(semestersError);
  }, [semestersData, semestersLoading, semestersError]);

  const filteredSemesters = semesters.filter(semester =>
    semester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    semester.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      // Clean form data - ensure proper data types
      const cleanFormData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        registration_start: formData.registration_start,
        registration_end: formData.registration_end,
        is_current: formData.is_current,
        is_active: formData.is_active,
      };

      console.log('Sending semester data:', cleanFormData);

      const newSemester = await createSemester('/academics/semesters/', 'POST', cleanFormData);
      
      console.log('Created semester:', newSemester);
      setSemesters([...semesters, newSemester]);
      setShowCreateModal(false);
      resetForm();
      setError(null);
      setSuccessMessage('Semester created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Semester creation error:', err);
      setError('Failed to create semester - Network error');
    }
  };

  const handleEdit = async () => {
    if (!selectedSemester) return;

    try {
      const response = await fetch(`/api/v1/academics/semesters/${selectedSemester.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedSemester = await response.json();
        setSemesters(semesters.map(semester => 
          semester.id === selectedSemester.id ? updatedSemester : semester
        ));
        setShowEditModal(false);
        setSelectedSemester(null);
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to update semester');
      }
    } catch (err) {
      setError('Failed to update semester');
    }
  };

  const handleDelete = async () => {
    if (!selectedSemester) return;

    try {
      const response = await fetch(`/api/v1/academics/semesters/${selectedSemester.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setSemesters(semesters.filter(semester => semester.id !== selectedSemester.id));
        setShowDeleteModal(false);
        setSelectedSemester(null);
      } else {
        setError('Failed to delete semester');
      }
    } catch (err) {
      setError('Failed to delete semester');
    }
  };

  const handleSetCurrent = async (semester: Semester) => {
    try {
      const response = await fetch(`/api/v1/academics/semesters/${semester.id}/set_current/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Update all semesters to remove current status
        setSemesters(semesters.map(s => ({
          ...s,
          is_current: s.id === semester.id
        })));
      } else {
        setError('Failed to set current semester');
      }
    } catch (err) {
      setError('Failed to set current semester');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      start_date: '',
      end_date: '',
      registration_start: '',
      registration_end: '',
      is_current: false,
      is_active: true,
    });
  };

  const openEditModal = (semester: Semester) => {
    setSelectedSemester(semester);
    setFormData({
      name: semester.name,
      code: semester.code,
      start_date: semester.start_date,
      end_date: semester.end_date,
      registration_start: semester.registration_start,
      registration_end: semester.registration_end,
      is_current: semester.is_current,
      is_active: semester.is_active,
    });
    setShowEditModal(true);
  };

  const openViewModal = (semester: Semester) => {
    setSelectedSemester(semester);
    setShowViewModal(true);
  };

  const openDeleteModal = (semester: Semester) => {
    setSelectedSemester(semester);
    setShowDeleteModal(true);
  };

  const exportSemesters = () => {
    const csvContent = [
      ['Name', 'Code', 'Start Date', 'End Date', 'Registration Start', 'Registration End', 'Current', 'Active', 'Course Offerings', 'Enrollments'],
      ...semesters.map(semester => [
        semester.name,
        semester.code,
        semester.start_date,
        semester.end_date,
        semester.registration_start,
        semester.registration_end,
        semester.is_current ? 'Yes' : 'No',
        semester.is_active ? 'Yes' : 'No',
        semester.course_offering_count.toString(),
        semester.enrollment_count.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'semesters.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  if (error && !semesters.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading semesters</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Semester Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage academic semesters and terms
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportSemesters}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Semester
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Success
              </h3>
              <div className="mt-2 text-sm text-green-700">
                {successMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search semesters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Semesters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSemesters.map((semester) => (
          <Card key={semester.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{semester.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {semester.code}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {semester.is_current && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Current
                    </Badge>
                  )}
                  <Badge variant={semester.is_active ? "default" : "secondary"}>
                    {semester.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(semester.start_date)} - {formatDate(semester.end_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Reg: {formatDate(semester.registration_start)} - {formatDate(semester.registration_end)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{semester.course_offering_count} offerings, {semester.enrollment_count} enrollments</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openViewModal(semester)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(semester)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {!semester.is_current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetCurrent(semester)}
                    className="text-yellow-600 hover:text-yellow-700"
                    title="Set as current semester"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteModal(semester)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSemesters.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No semesters found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first semester.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Semester
            </Button>
          )}
        </div>
      )}

      {/* Create Semester Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Semester</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Semester Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Fall 2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Semester Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="e.g., FA24"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="registration_start">Registration Start *</Label>
                  <Input
                    id="registration_start"
                    type="datetime-local"
                    value={formData.registration_start}
                    onChange={(e) => setFormData({...formData, registration_start: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_end">Registration End *</Label>
                  <Input
                    id="registration_end"
                    type="datetime-local"
                    value={formData.registration_end}
                    onChange={(e) => setFormData({...formData, registration_end: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_current"
                    checked={formData.is_current}
                    onCheckedChange={(checked) => setFormData({...formData, is_current: !!checked})}
                  />
                  <Label htmlFor="is_current">Current Semester</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: !!checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {createLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Semester'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Semester Modal */}
      {showEditModal && selectedSemester && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Semester</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Semester Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-code">Semester Code *</Label>
                  <Input
                    id="edit-code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start_date">Start Date *</Label>
                  <Input
                    id="edit-start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end_date">End Date *</Label>
                  <Input
                    id="edit-end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-registration_start">Registration Start *</Label>
                  <Input
                    id="edit-registration_start"
                    type="datetime-local"
                    value={formData.registration_start}
                    onChange={(e) => setFormData({...formData, registration_start: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-registration_end">Registration End *</Label>
                  <Input
                    id="edit-registration_end"
                    type="datetime-local"
                    value={formData.registration_end}
                    onChange={(e) => setFormData({...formData, registration_end: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is_current"
                    checked={formData.is_current}
                    onCheckedChange={(checked) => setFormData({...formData, is_current: !!checked})}
                  />
                  <Label htmlFor="edit-is_current">Current Semester</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: !!checked})}
                  />
                  <Label htmlFor="edit-is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSemester(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateLoading} className="bg-green-600 hover:bg-green-700 text-white">
                  {updateLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Semester'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Semester Modal */}
      {showViewModal && selectedSemester && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Semester Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <p className="text-lg font-semibold">{selectedSemester.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Code</Label>
                  <p className="text-lg font-semibold">{selectedSemester.code}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Start Date</Label>
                  <p className="text-gray-900">{formatDate(selectedSemester.start_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">End Date</Label>
                  <p className="text-gray-900">{formatDate(selectedSemester.end_date)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Registration Start</Label>
                  <p className="text-gray-900">{formatDateTime(selectedSemester.registration_start)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Registration End</Label>
                  <p className="text-gray-900">{formatDateTime(selectedSemester.registration_end)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="flex gap-2">
                    {selectedSemester.is_current && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                    )}
                  <Badge 
                    variant={selectedSemester.is_active ? "default" : "secondary"}
                    className={selectedSemester.is_active ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}
                  >
                    {selectedSemester.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Course Offerings</Label>
                  <p className="text-gray-900">{selectedSemester.course_offering_count}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Enrollments</Label>
                  <p className="text-gray-900">{selectedSemester.enrollment_count}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p className="text-gray-900">{formatDate(selectedSemester.created_at)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSemester(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSemester && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Semester</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the semester "{selectedSemester.name}"? 
              This action cannot be undone and will affect all associated course offerings and enrollments.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSemester(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
