'use client';

import React, { useState, useEffect } from 'react';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { Program, ProgramForm, Department } from '@/types';
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
  BookOpen, 
  Building2, 
  Clock, 
  GraduationCap,
  Download
} from 'lucide-react';

interface ProgramManagementProps {}

export default function ProgramManagement({}: ProgramManagementProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState<ProgramForm>({
    name: '',
    code: '',
    department: 0,
    degree_type: 'BACHELOR',
    duration_years: 4,
    total_credit_hours: 120,
    description: '',
    admission_requirements: '',
    is_active: true,
  });

  // Fetch programs
  const { data: programsData, loading: programsLoading, error: programsError } = useApi<{results: Program[]}>('/academics/programs/');
  
  // Fetch departments
  const { data: departmentsData, loading: departmentsLoading } = useApi<{results: Department[]}>('/academics/departments/');
  
  // Mutation hooks for CRUD operations
  const { mutate: createProgram, loading: createLoading } = useApiMutation<Program, ProgramForm>();
  const { mutate: updateProgram, loading: updateLoading } = useApiMutation<Program, ProgramForm>();
  const { mutate: deleteProgram, loading: deleteLoading } = useApiMutation<void>();

  useEffect(() => {
    if (programsData) {
      setPrograms(programsData.results);
    }
    if (departmentsData) {
      setDepartments(departmentsData.results);
    }
    setLoading(programsLoading || departmentsLoading);
    setError(programsError);
  }, [programsData, departmentsData, programsLoading, departmentsLoading, programsError]);

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      // Clean form data - ensure proper data types
      const cleanFormData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        department: formData.department,
        degree_type: formData.degree_type,
        duration_years: formData.duration_years,
        total_credit_hours: formData.total_credit_hours,
        description: formData.description.trim(),
        admission_requirements: formData.admission_requirements.trim(),
        is_active: formData.is_active,
      };

      console.log('Sending program data:', cleanFormData);

      const newProgram = await createProgram('/academics/programs/', 'POST', cleanFormData);
      
      console.log('Created program:', newProgram);
      setPrograms([...programs, newProgram]);
      setShowCreateModal(false);
      resetForm();
      setError(null);
      setSuccessMessage('Program created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Program creation error:', err);
      setError('Failed to create program - Network error');
    }
  };

  const handleEdit = async () => {
    if (!selectedProgram) return;

    try {
      const updatedProgram = await updateProgram(`/academics/programs/${selectedProgram.id}/`, 'PATCH', formData);
      
      setPrograms(programs.map(program => 
        program.id === selectedProgram.id ? updatedProgram : program
      ));
      setShowEditModal(false);
      setSelectedProgram(null);
      resetForm();
      setError(null);
      setSuccessMessage('Program updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Program update error:', err);
      setError('Failed to update program');
    }
  };

  const handleDelete = async () => {
    if (!selectedProgram) return;

    try {
      await deleteProgram(`/academics/programs/${selectedProgram.id}/`, 'DELETE');
      
      setPrograms(programs.filter(program => program.id !== selectedProgram.id));
      setShowDeleteModal(false);
      setSelectedProgram(null);
      setError(null);
      setSuccessMessage('Program deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Program deletion error:', err);
      setError('Failed to delete program');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      department: 0,
      degree_type: 'BACHELOR',
      duration_years: 4,
      total_credit_hours: 120,
      description: '',
      admission_requirements: '',
      is_active: true,
    });
  };

  const openEditModal = (program: Program) => {
    setSelectedProgram(program);
    setFormData({
      name: program.name,
      code: program.code,
      department: program.department,
      degree_type: program.degree_type,
      duration_years: program.duration_years,
      total_credit_hours: program.total_credit_hours,
      description: program.description,
      admission_requirements: program.admission_requirements,
      is_active: program.is_active,
    });
    setShowEditModal(true);
  };

  const openViewModal = (program: Program) => {
    setSelectedProgram(program);
    setShowViewModal(true);
  };

  const openDeleteModal = (program: Program) => {
    setSelectedProgram(program);
    setShowDeleteModal(true);
  };

  const exportPrograms = () => {
    const csvContent = [
      ['Name', 'Code', 'Department', 'Degree Type', 'Duration (Years)', 'Credit Hours', 'Description', 'Active'],
      ...programs.map(program => [
        program.name,
        program.code,
        program.department_name,
        program.degree_type,
        program.duration_years.toString(),
        program.total_credit_hours.toString(),
        program.description,
        program.is_active ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'programs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getDegreeTypeColor = (degreeType: string) => {
    const colors = {
      'BACHELOR': 'bg-blue-100 text-blue-800',
      'MASTER': 'bg-green-100 text-green-800',
      'PHD': 'bg-purple-100 text-purple-800',
      'CERTIFICATE': 'bg-yellow-100 text-yellow-800',
      'DIPLOMA': 'bg-orange-100 text-orange-800',
    };
    return colors[degreeType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  if (error && !programs.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading programs</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Program Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage academic programs and degree types
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportPrograms}
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
            Add Program
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
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{program.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {program.code}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={program.is_active ? "default" : "secondary"}>
                  {program.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4" />
                  <span>{program.department_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap className="h-4 w-4" />
                  <Badge className={getDegreeTypeColor(program.degree_type)}>
                    {program.degree_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{program.duration_years} years</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{program.total_credit_hours} credit hours</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openViewModal(program)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(program)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteModal(program)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first program.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          )}
        </div>
      )}

      {/* Create Program Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Program</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Program Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Program Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department.toString()}
                  onValueChange={(value) => setFormData({...formData, department: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="degree_type">Degree Type *</Label>
                  <Select
                    value={formData.degree_type}
                    onValueChange={(value: any) => setFormData({...formData, degree_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Degree Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BACHELOR">Bachelor</SelectItem>
                      <SelectItem value="MASTER">Master</SelectItem>
                      <SelectItem value="PHD">PhD</SelectItem>
                      <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                      <SelectItem value="DIPLOMA">Diploma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_years">Duration (Years) *</Label>
                  <Input
                    id="duration_years"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.duration_years}
                    onChange={(e) => setFormData({...formData, duration_years: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_credit_hours">Total Credit Hours *</Label>
                <Input
                  id="total_credit_hours"
                  type="number"
                  min="1"
                  max="200"
                  value={formData.total_credit_hours}
                  onChange={(e) => setFormData({...formData, total_credit_hours: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admission_requirements">Admission Requirements *</Label>
                <Textarea
                  id="admission_requirements"
                  value={formData.admission_requirements}
                  onChange={(e) => setFormData({...formData, admission_requirements: e.target.value})}
                  rows={3}
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
                    'Create Program'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {showEditModal && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Program</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Program Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-code">Program Code *</Label>
                  <Input
                    id="edit-code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-department">Department *</Label>
                <Select
                  value={formData.department.toString()}
                  onValueChange={(value) => setFormData({...formData, department: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-degree_type">Degree Type *</Label>
                  <Select
                    value={formData.degree_type}
                    onValueChange={(value: any) => setFormData({...formData, degree_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Degree Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BACHELOR">Bachelor</SelectItem>
                      <SelectItem value="MASTER">Master</SelectItem>
                      <SelectItem value="PHD">PhD</SelectItem>
                      <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                      <SelectItem value="DIPLOMA">Diploma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-duration_years">Duration (Years) *</Label>
                  <Input
                    id="edit-duration_years"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.duration_years}
                    onChange={(e) => setFormData({...formData, duration_years: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-total_credit_hours">Total Credit Hours *</Label>
                <Input
                  id="edit-total_credit_hours"
                  type="number"
                  min="1"
                  max="200"
                  value={formData.total_credit_hours}
                  onChange={(e) => setFormData({...formData, total_credit_hours: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-admission_requirements">Admission Requirements *</Label>
                <Textarea
                  id="edit-admission_requirements"
                  value={formData.admission_requirements}
                  onChange={(e) => setFormData({...formData, admission_requirements: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
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
                    setSelectedProgram(null);
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
                    'Update Program'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Program Modal */}
      {showViewModal && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Program Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <p className="text-lg font-semibold">{selectedProgram.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Code</Label>
                  <p className="text-lg font-semibold">{selectedProgram.code}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Department</Label>
                  <p className="text-gray-900">{selectedProgram.department_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Degree Type</Label>
                  <Badge className={getDegreeTypeColor(selectedProgram.degree_type)}>
                    {selectedProgram.degree_type}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Duration</Label>
                  <p className="text-gray-900">{selectedProgram.duration_years} years</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Credit Hours</Label>
                  <p className="text-gray-900">{selectedProgram.total_credit_hours}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-gray-900">{selectedProgram.description}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Admission Requirements</Label>
                <p className="text-gray-900">{selectedProgram.admission_requirements}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge 
                    variant={selectedProgram.is_active ? "default" : "secondary"}
                    className={selectedProgram.is_active ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}
                  >
                    {selectedProgram.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p className="text-gray-900">{new Date(selectedProgram.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedProgram(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Program</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the program "{selectedProgram.name}"? 
              This action cannot be undone and will affect all associated courses and enrollments.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProgram(null);
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
