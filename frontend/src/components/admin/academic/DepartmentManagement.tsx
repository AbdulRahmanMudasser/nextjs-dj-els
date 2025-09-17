'use client';

import React, { useState, useEffect } from 'react';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { Department, DepartmentForm, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DepartmentManagementProps {}

export default function DepartmentManagement({}: DepartmentManagementProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculty, setFaculty] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentForm>({
    name: '',
    code: '',
    description: '',
    head_of_department: undefined,
    established_date: '',
    contact_email: '',
    contact_phone: '',
    location: '',
    is_active: true,
  });

  // Fetch departments
  const { data: departmentsData, loading: departmentsLoading, error: departmentsError } = useApi<{results: Department[]}>('/academics/departments/');
  
  // Fetch faculty for HOD selection
  const { data: facultyData, loading: facultyLoading } = useApi<{results: UserProfile[]}>('/users/profiles/?role=FACULTY');
  
  // Mutation hooks for CRUD operations
  const { mutate: createDepartment, loading: createLoading } = useApiMutation<Department, DepartmentForm>();
  const { mutate: updateDepartment, loading: updateLoading } = useApiMutation<Department, DepartmentForm>();
  const { mutate: deleteDepartment, loading: deleteLoading } = useApiMutation<void>();

  useEffect(() => {
    if (departmentsData) {
      setDepartments(departmentsData.results);
    }
    if (facultyData) {
      setFaculty(facultyData.results);
    }
    setLoading(departmentsLoading || facultyLoading);
    setError(departmentsError);
  }, [departmentsData, facultyData, departmentsLoading, facultyLoading, departmentsError]);

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      // Clean form data - remove undefined values and ensure proper data types
      const cleanFormData: any = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        established_date: formData.established_date,
        contact_email: formData.contact_email.trim(),
        contact_phone: formData.contact_phone.trim(),
        location: formData.location.trim(),
        is_active: formData.is_active,
      };

      // Only include head_of_department if it's a valid number
      if (formData.head_of_department && typeof formData.head_of_department === 'number') {
        cleanFormData.head_of_department = formData.head_of_department;
      }

      console.log('Sending department data:', cleanFormData);

      const newDepartment = await createDepartment('/academics/departments/', 'POST', cleanFormData);
      
      console.log('Created department:', newDepartment);
      setDepartments([...departments, newDepartment]);
      setShowCreateModal(false);
      resetForm();
      setError(null); // Clear any previous errors
      setSuccessMessage('Department created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Department creation error:', err);
      if (err instanceof Error) {
        setError(`Failed to create department: ${err.message}`);
      } else {
        setError('Failed to create department - Network error');
      }
    }
  };

  const handleEdit = async () => {
    if (!selectedDepartment) return;

    try {
      // Clean form data - remove undefined values
      const cleanFormData = {
        ...formData,
        head_of_department: formData.head_of_department || null,
      };

      const updatedDepartment = await updateDepartment(`/academics/departments/${selectedDepartment.id}/`, 'PATCH', cleanFormData);
      
      setDepartments(departments.map(dept => 
        dept.id === selectedDepartment.id ? updatedDepartment : dept
      ));
      setShowEditModal(false);
      setSelectedDepartment(null);
      resetForm();
      setError(null); // Clear any previous errors
      setSuccessMessage('Department updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Department update error:', err);
      setError('Failed to update department');
    }
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;

    try {
      await deleteDepartment(`/academics/departments/${selectedDepartment.id}/`, 'DELETE');
      
      setDepartments(departments.filter(dept => dept.id !== selectedDepartment.id));
      setShowDeleteModal(false);
      setSelectedDepartment(null);
      setError(null); // Clear any previous errors
      setSuccessMessage('Department deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Department deletion error:', err);
      setError('Failed to delete department');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      head_of_department: undefined,
      established_date: '',
      contact_email: '',
      contact_phone: '',
      location: '',
      is_active: true,
    });
  };

  const openEditModal = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description,
      head_of_department: department.head_of_department,
      established_date: department.established_date,
      contact_email: department.contact_email,
      contact_phone: department.contact_phone,
      location: department.location,
      is_active: department.is_active,
    });
    setShowEditModal(true);
  };

  const openViewModal = (department: Department) => {
    setSelectedDepartment(department);
    setShowViewModal(true);
  };

  const openDeleteModal = (department: Department) => {
    setSelectedDepartment(department);
    setShowDeleteModal(true);
  };

  const exportDepartments = () => {
    const csvContent = [
      ['Name', 'Code', 'Description', 'Head of Department', 'Established Date', 'Contact Email', 'Contact Phone', 'Location', 'Active', 'Programs'],
      ...departments.map(dept => [
        dept.name,
        dept.code,
        dept.description,
        dept.head_of_department_name || 'N/A',
        dept.established_date,
        dept.contact_email,
        dept.contact_phone,
        dept.location,
        dept.is_active ? 'Yes' : 'No',
        dept.program_count.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'departments.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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

  if (error && !departments.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading departments</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage academic departments and their details
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportDepartments}
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
            Add Department
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
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <Card key={department.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {department.code}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={department.is_active ? "default" : "secondary"}>
                  {department.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{department.program_count} programs</span>
                </div>
                {department.head_of_department_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>HOD: {department.head_of_department_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{department.contact_email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{department.location}</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openViewModal(department)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(department)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteModal(department)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first department.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          )}
        </div>
      )}

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Department</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Department Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Department Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="head_of_department">Head of Department</Label>
                  <Select
                    value={formData.head_of_department?.toString() || ''}
                    onValueChange={(value) => setFormData({...formData, head_of_department: value ? parseInt(value) : undefined})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select HOD" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculty.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.full_name || `${member.user.first_name} ${member.user.last_name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="established_date">Established Date *</Label>
                  <Input
                    id="established_date"
                    type="date"
                    value={formData.established_date}
                    onChange={(e) => setFormData({...formData, established_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone *</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: !!checked})}
                />
                <Label htmlFor="is_active">Active</Label>
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
                    'Create Department'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Department</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Department Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Department Code *</Label>
                  <Input
                    id="edit-code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-head_of_department">Head of Department</Label>
                  <Select
                    value={formData.head_of_department?.toString() || ''}
                    onValueChange={(value) => setFormData({...formData, head_of_department: value ? parseInt(value) : undefined})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select HOD" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculty.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.full_name || `${member.user.first_name} ${member.user.last_name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-established_date">Established Date *</Label>
                  <Input
                    id="edit-established_date"
                    type="date"
                    value={formData.established_date}
                    onChange={(e) => setFormData({...formData, established_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-contact_email">Contact Email *</Label>
                  <Input
                    id="edit-contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contact_phone">Contact Phone *</Label>
                  <Input
                    id="edit-contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Location *</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: !!checked})}
                />
                <Label htmlFor="edit-is_active">Active</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedDepartment(null);
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
                    'Update Department'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Department Modal */}
      {showViewModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Department Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <p className="text-lg font-semibold">{selectedDepartment.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Code</Label>
                  <p className="text-lg font-semibold">{selectedDepartment.code}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-gray-900">{selectedDepartment.description || 'No description provided'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Head of Department</Label>
                  <p className="text-gray-900">{selectedDepartment.head_of_department_name || 'Not assigned'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Established Date</Label>
                  <p className="text-gray-900">{new Date(selectedDepartment.established_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Contact Email</Label>
                  <p className="text-gray-900">{selectedDepartment.contact_email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Contact Phone</Label>
                  <p className="text-gray-900">{selectedDepartment.contact_phone}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Location</Label>
                <p className="text-gray-900">{selectedDepartment.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge 
                    variant={selectedDepartment.is_active ? "default" : "secondary"}
                    className={selectedDepartment.is_active ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}
                  >
                    {selectedDepartment.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Programs</Label>
                  <p className="text-gray-900">{selectedDepartment.program_count} programs</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p className="text-gray-900">{new Date(selectedDepartment.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                  <p className="text-gray-900">{new Date(selectedDepartment.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedDepartment(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Department</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the department "{selectedDepartment.name}"? 
              This action cannot be undone and will affect all associated programs and courses.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDepartment(null);
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
