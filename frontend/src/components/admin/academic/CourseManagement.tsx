'use client';

import React, { useState, useEffect } from 'react';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { Course, CourseForm, Department } from '@/types';
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
  Users,
  Download
} from 'lucide-react';

interface CourseManagementProps {}

export default function CourseManagement({}: CourseManagementProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseForm>({
    name: '',
    code: '',
    department: 0,
    credit_hours: 3,
    course_type: 'CORE',
    level: 'UNDERGRADUATE',
    description: '',
    prerequisites: [],
    corequisites: [],
    learning_outcomes: '',
    is_active: true,
  });

  // Fetch courses
  const { data: coursesData, loading: coursesLoading, error: coursesError } = useApi<{results: Course[]}>('/courses/courses/');
  
  // Fetch departments
  const { data: departmentsData, loading: departmentsLoading } = useApi<{results: Department[]}>('/academics/departments/');
  
  // Mutation hooks for CRUD operations
  const { mutate: createCourse, loading: createLoading } = useApiMutation<Course, CourseForm>();
  const { mutate: updateCourse, loading: updateLoading } = useApiMutation<Course, CourseForm>();
  const { mutate: deleteCourse, loading: deleteLoading } = useApiMutation<void>();

  useEffect(() => {
    if (coursesData) {
      setCourses(coursesData.results);
    }
    if (departmentsData) {
      setDepartments(departmentsData.results);
    }
    setLoading(coursesLoading || departmentsLoading);
    setError(coursesError);
  }, [coursesData, departmentsData, coursesLoading, departmentsLoading, coursesError]);

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      // Clean form data - ensure proper data types
      const cleanFormData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        department: formData.department,
        credit_hours: formData.credit_hours,
        course_type: formData.course_type,
        level: formData.level,
        description: formData.description.trim(),
        prerequisites: formData.prerequisites || [],
        corequisites: formData.corequisites || [],
        learning_outcomes: formData.learning_outcomes.trim(),
        is_active: formData.is_active,
      };

      console.log('Sending course data:', cleanFormData);

      const newCourse = await createCourse('/courses/courses/', 'POST', cleanFormData);
      
      console.log('Created course:', newCourse);
      setCourses([...courses, newCourse]);
      setShowCreateModal(false);
      resetForm();
      setError(null);
      setSuccessMessage('Course created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Course creation error:', err);
      setError('Failed to create course - Network error');
    }
  };

  const handleEdit = async () => {
    if (!selectedCourse) return;

    try {
      const response = await fetch(`/api/v1/courses/courses/${selectedCourse.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedCourse = await response.json();
        setCourses(courses.map(course => 
          course.id === selectedCourse.id ? updatedCourse : course
        ));
        setShowEditModal(false);
        setSelectedCourse(null);
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to update course');
      }
    } catch (err) {
      setError('Failed to update course');
    }
  };

  const handleDelete = async () => {
    if (!selectedCourse) return;

    try {
      const response = await fetch(`/api/v1/courses/courses/${selectedCourse.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setCourses(courses.filter(course => course.id !== selectedCourse.id));
        setShowDeleteModal(false);
        setSelectedCourse(null);
      } else {
        setError('Failed to delete course');
      }
    } catch (err) {
      setError('Failed to delete course');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      department: 0,
      credit_hours: 3,
      course_type: 'CORE',
      level: 'UNDERGRADUATE',
      description: '',
      prerequisites: [],
      corequisites: [],
      learning_outcomes: '',
      is_active: true,
    });
  };

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      department: course.department,
      credit_hours: course.credit_hours,
      course_type: course.course_type,
      level: course.level,
      description: course.description,
      prerequisites: course.prerequisites,
      corequisites: course.corequisites,
      learning_outcomes: course.learning_outcomes,
      is_active: course.is_active,
    });
    setShowEditModal(true);
  };

  const openViewModal = (course: Course) => {
    setSelectedCourse(course);
    setShowViewModal(true);
  };

  const openDeleteModal = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const exportCourses = () => {
    const csvContent = [
      ['Name', 'Code', 'Department', 'Credit Hours', 'Type', 'Level', 'Description', 'Active', 'Offerings'],
      ...courses.map(course => [
        course.name,
        course.code,
        course.department_name,
        course.credit_hours.toString(),
        course.course_type,
        course.level,
        course.description,
        course.is_active ? 'Yes' : 'No',
        course.offering_count.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'courses.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCourseTypeColor = (courseType: string) => {
    const colors = {
      'CORE': 'bg-blue-100 text-blue-800',
      'ELECTIVE': 'bg-green-100 text-green-800',
      'LAB': 'bg-purple-100 text-purple-800',
      'PROJECT': 'bg-orange-100 text-orange-800',
      'THESIS': 'bg-red-100 text-red-800',
    };
    return colors[courseType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'UNDERGRADUATE': 'bg-blue-100 text-blue-800',
      'GRADUATE': 'bg-green-100 text-green-800',
      'POSTGRADUATE': 'bg-purple-100 text-purple-800',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  if (error && !courses.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading courses</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage courses and course offerings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportCourses}
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
            Add Course
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
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {course.code}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={course.is_active ? "default" : "secondary"}>
                  {course.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4" />
                  <span>{course.department_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{course.credit_hours} credit hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{course.offering_count} offerings</span>
                </div>
                <div className="flex gap-2">
                  <Badge className={getCourseTypeColor(course.course_type)}>
                    {course.course_type}
                  </Badge>
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openViewModal(course)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(course)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteModal(course)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first course.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          )}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Course</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Course Code *</Label>
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

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="credit_hours">Credit Hours *</Label>
                  <Input
                    id="credit_hours"
                    type="number"
                    min="1"
                    max="6"
                    value={formData.credit_hours}
                    onChange={(e) => setFormData({...formData, credit_hours: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course_type">Course Type *</Label>
                  <Select
                    value={formData.course_type}
                    onValueChange={(value: any) => setFormData({...formData, course_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CORE">Core</SelectItem>
                      <SelectItem value="ELECTIVE">Elective</SelectItem>
                      <SelectItem value="LAB">Laboratory</SelectItem>
                      <SelectItem value="PROJECT">Project</SelectItem>
                      <SelectItem value="THESIS">Thesis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value: any) => setFormData({...formData, level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNDERGRADUATE">Undergraduate</SelectItem>
                      <SelectItem value="GRADUATE">Graduate</SelectItem>
                      <SelectItem value="POSTGRADUATE">Postgraduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <Label htmlFor="learning_outcomes">Learning Outcomes *</Label>
                <Textarea
                  id="learning_outcomes"
                  value={formData.learning_outcomes}
                  onChange={(e) => setFormData({...formData, learning_outcomes: e.target.value})}
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
                    'Create Course'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Course</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Course Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-code">Course Code *</Label>
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-credit_hours">Credit Hours *</Label>
                  <Input
                    id="edit-credit_hours"
                    type="number"
                    min="1"
                    max="6"
                    value={formData.credit_hours}
                    onChange={(e) => setFormData({...formData, credit_hours: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-course_type">Course Type *</Label>
                  <Select
                    value={formData.course_type}
                    onValueChange={(value: any) => setFormData({...formData, course_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CORE">Core</SelectItem>
                      <SelectItem value="ELECTIVE">Elective</SelectItem>
                      <SelectItem value="LAB">Laboratory</SelectItem>
                      <SelectItem value="PROJECT">Project</SelectItem>
                      <SelectItem value="THESIS">Thesis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-level">Level *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value: any) => setFormData({...formData, level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNDERGRADUATE">Undergraduate</SelectItem>
                      <SelectItem value="GRADUATE">Graduate</SelectItem>
                      <SelectItem value="POSTGRADUATE">Postgraduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <Label htmlFor="edit-learning_outcomes">Learning Outcomes *</Label>
                <Textarea
                  id="edit-learning_outcomes"
                  value={formData.learning_outcomes}
                  onChange={(e) => setFormData({...formData, learning_outcomes: e.target.value})}
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
                    setSelectedCourse(null);
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
                    'Update Course'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Course Modal */}
      {showViewModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Course Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <p className="text-lg font-semibold">{selectedCourse.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Code</Label>
                  <p className="text-lg font-semibold">{selectedCourse.code}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Department</Label>
                  <p className="text-gray-900">{selectedCourse.department_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Credit Hours</Label>
                  <p className="text-gray-900">{selectedCourse.credit_hours}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <Badge className={getCourseTypeColor(selectedCourse.course_type)}>
                    {selectedCourse.course_type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Level</Label>
                  <Badge className={getLevelColor(selectedCourse.level)}>
                    {selectedCourse.level}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-gray-900">{selectedCourse.description}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Learning Outcomes</Label>
                <p className="text-gray-900">{selectedCourse.learning_outcomes}</p>
              </div>

              {selectedCourse.prerequisites_names && selectedCourse.prerequisites_names.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Prerequisites</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCourse.prerequisites_names.map((prereq, index) => (
                      <Badge key={index} variant="outline">{prereq}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedCourse.corequisites_names && selectedCourse.corequisites_names.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Corequisites</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCourse.corequisites_names.map((coreq, index) => (
                      <Badge key={index} variant="outline">{coreq}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge 
                    variant={selectedCourse.is_active ? "default" : "secondary"}
                    className={selectedCourse.is_active ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}
                  >
                    {selectedCourse.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Offerings</Label>
                  <p className="text-gray-900">{selectedCourse.offering_count} offerings</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p className="text-gray-900">{new Date(selectedCourse.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                  <p className="text-gray-900">{new Date(selectedCourse.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCourse(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Course</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the course "{selectedCourse.name}"? 
              This action cannot be undone and will affect all associated offerings and enrollments.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCourse(null);
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
