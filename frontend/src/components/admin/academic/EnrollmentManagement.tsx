'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useApi } from '@/hooks/useApi';
import { useApiMutation } from '@/hooks/useApi';

interface Enrollment {
  id: number;
  student: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  course_offering: {
    id: number;
    course: {
      id: number;
      name: string;
      code: string;
    };
    semester: {
      id: number;
      name: string;
      year: number;
    };
  };
  enrollment_date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'WITHDRAWN';
  grade: string | null;
  credits: number;
  created_at: string;
  updated_at: string;
}

interface EnrollmentForm {
  student: number | undefined;
  course_offering: number | undefined;
  semester: number | undefined;
  enrollment_date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'WITHDRAWN';
  grade: string;
  credits: number;
}

interface Student {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface CourseOffering {
  id: number;
  course: {
    id: number;
    name: string;
    code: string;
  };
  semester: {
    id: number;
    name: string;
    year: number;
  };
  instructor: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
}

interface Semester {
  id: number;
  name: string;
  year: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courseOfferings, setCourseOfferings] = useState<CourseOffering[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [formData, setFormData] = useState<EnrollmentForm>({
    student: undefined,
    course_offering: undefined,
    semester: undefined,
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    grade: '',
    credits: 3,
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data, loading, error: fetchError } = useApi<Enrollment[]>('/courses/enrollments/');
  const { data: studentsData } = useApi<Student[]>('/users/profiles/?role=STUDENT');
  const { data: courseOfferingsData } = useApi<CourseOffering[]>('/courses/course-offerings/');
  const { data: semestersData } = useApi<Semester[]>('/academics/semesters/');
  const { mutate: createEnrollment, loading: createLoading } = useApiMutation<Enrollment, EnrollmentForm>();
  const { mutate: updateEnrollment, loading: updateLoading } = useApiMutation<Enrollment, EnrollmentForm>();
  const { mutate: deleteEnrollment, loading: deleteLoading } = useApiMutation<void>();

  useEffect(() => {
    console.log('Enrollments useEffect - data:', data, 'type:', typeof data, 'isArray:', Array.isArray(data));
    if (data) {
      console.log('Enrollments data received:', data);
      setEnrollments(Array.isArray(data) ? data : []);
    } else {
      console.log('No data received, setting empty array');
      setEnrollments([]);
    }
  }, [data]);

  useEffect(() => {
    if (fetchError) {
      console.error('Error fetching enrollments:', fetchError);
      setError(`Failed to load enrollments: ${fetchError.message || 'Unknown error'}`);
    }
  }, [fetchError]);

  useEffect(() => {
    if (studentsData) {
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    }
  }, [studentsData]);

  useEffect(() => {
    if (courseOfferingsData) {
      setCourseOfferings(Array.isArray(courseOfferingsData) ? courseOfferingsData : []);
    }
  }, [courseOfferingsData]);

  useEffect(() => {
    if (semestersData) {
      setSemesters(Array.isArray(semestersData) ? semestersData : []);
    }
  }, [semestersData]);

  const resetForm = () => {
    setFormData({
      student: undefined,
      course_offering: undefined,
      semester: undefined,
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      grade: '',
      credits: 3,
    });
    setError(null);
  };

  const handleCreate = async () => {
    try {
      const cleanFormData = {
        ...formData,
        student: formData.student!,
        course_offering: formData.course_offering!,
        grade: formData.grade || null,
      };

      const newEnrollment = await createEnrollment('/courses/enrollments/', 'POST', cleanFormData);
      setEnrollments([...(enrollments || []), newEnrollment]);
      setShowCreateModal(false);
      resetForm();
      setSuccessMessage('Enrollment created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Enrollment creation error:', err);
      if (err instanceof Error) {
        setError(`Failed to create enrollment: ${err.message}`);
      } else {
        setError('Failed to create enrollment - Network error');
      }
    }
  };

  const handleEdit = async () => {
    if (!selectedEnrollment) return;
    try {
      const cleanFormData = {
        ...formData,
        student: formData.student!,
        course_offering: formData.course_offering!,
        grade: formData.grade || null,
      };

      const updatedEnrollment = await updateEnrollment(`/courses/enrollments/${selectedEnrollment.id}/`, 'PUT', cleanFormData);
      setEnrollments((enrollments || []).map(e => e.id === selectedEnrollment.id ? updatedEnrollment : e));
      setShowEditModal(false);
      setSelectedEnrollment(null);
      resetForm();
      setSuccessMessage('Enrollment updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Enrollment update error:', err);
      if (err instanceof Error) {
        setError(`Failed to update enrollment: ${err.message}`);
      } else {
        setError('Failed to update enrollment - Network error');
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedEnrollment) return;
    try {
      await deleteEnrollment(`/courses/enrollments/${selectedEnrollment.id}/`, 'DELETE');
      setEnrollments((enrollments || []).filter(e => e.id !== selectedEnrollment.id));
      setShowDeleteModal(false);
      setSelectedEnrollment(null);
      setSuccessMessage('Enrollment deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Enrollment deletion error:', err);
      if (err instanceof Error) {
        setError(`Failed to delete enrollment: ${err.message}`);
      } else {
        setError('Failed to delete enrollment - Network error');
      }
    }
  };

  const openEditModal = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setFormData({
      student: enrollment.student.id,
      course_offering: enrollment.course_offering.id,
      semester: enrollment.course_offering.semester.id,
      enrollment_date: enrollment.enrollment_date,
      status: enrollment.status,
      grade: enrollment.grade || '',
      credits: enrollment.credits,
    });
    setShowEditModal(true);
  };

  const openViewModal = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowViewModal(true);
  };

  const openDeleteModal = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowDeleteModal(true);
  };

  const exportEnrollments = () => {
    const csvContent = [
      ['Student', 'Course', 'Semester', 'Enrollment Date', 'Status', 'Grade', 'Credits'],
      ...(enrollments || []).map(enrollment => [
        `${enrollment.student.first_name} ${enrollment.student.last_name}`,
        `${enrollment.course_offering.course.name} (${enrollment.course_offering.course.code})`,
        `${enrollment.course_offering.semester.name} ${enrollment.course_offering.semester.year}`,
        enrollment.enrollment_date,
        enrollment.status,
        enrollment.grade || 'N/A',
        enrollment.credits.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enrollments.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredEnrollments = (enrollments || []).filter(enrollment =>
    `${enrollment.student.first_name} ${enrollment.student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.course_offering.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.course_offering.course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter course offerings based on selected semester
  const filteredCourseOfferings = formData.semester 
    ? courseOfferings.filter(offering => offering.semester.id === formData.semester)
    : courseOfferings;

  // Handle semester change - reset course offering if it doesn't match the new semester
  const handleSemesterChange = (semesterId: number) => {
    const newSemester = semesters.find(s => s.id === semesterId);
    if (newSemester && formData.course_offering) {
      const currentOffering = courseOfferings.find(o => o.id === formData.course_offering);
      if (currentOffering && currentOffering.semester.id !== semesterId) {
        // Reset course offering if it doesn't match the new semester
        setFormData({...formData, semester: semesterId, course_offering: undefined});
      } else {
        setFormData({...formData, semester: semesterId});
      }
    } else {
      setFormData({...formData, semester: semesterId});
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DROPPED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'WITHDRAWN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Enrollment Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage student enrollments in courses
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportEnrollments}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Enrollment
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search enrollments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Enrollments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(filteredEnrollments) && filteredEnrollments.map((enrollment) => (
          <Card key={enrollment.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {enrollment.student.first_name} {enrollment.student.last_name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {enrollment.course_offering.course.name} ({enrollment.course_offering.course.code})
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(enrollment.status)}>
                  {enrollment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <p><strong>Semester:</strong> {enrollment.course_offering.semester.name} {enrollment.course_offering.semester.year}</p>
                <p><strong>Enrolled:</strong> {new Date(enrollment.enrollment_date).toLocaleDateString()}</p>
                <p><strong>Credits:</strong> {enrollment.credits}</p>
                {enrollment.grade && <p><strong>Grade:</strong> {enrollment.grade}</p>}
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openViewModal(enrollment)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(enrollment)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteModal(enrollment)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEnrollments.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No enrollments found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first enrollment to get started'}
          </p>
        </div>
      )}

      {/* Create Enrollment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Enrollment</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <Select value={formData.student?.toString() || ''} onValueChange={(value) => setFormData({...formData, student: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.first_name} {student.last_name} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course_offering">Course Offering</Label>
                  <Select value={formData.course_offering?.toString() || ''} onValueChange={(value) => setFormData({...formData, course_offering: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course offering" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCourseOfferings.map((offering) => (
                        <SelectItem key={offering.id} value={offering.id.toString()}>
                          {offering.course.name} ({offering.course.code}) - {offering.semester.name} {offering.semester.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={formData.semester?.toString() || ''} onValueChange={(value) => handleSemesterChange(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id.toString()}>
                          {semester.name} {semester.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enrollment_date">Enrollment Date</Label>
                  <Input
                    id="enrollment_date"
                    type="date"
                    value={formData.enrollment_date}
                    onChange={(e) => setFormData({...formData, enrollment_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="DROPPED">Dropped</SelectItem>
                      <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    max="6"
                    value={formData.credits}
                    onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value) || 3})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade (Optional)</Label>
                <Input
                  id="grade"
                  placeholder="Enter grade (e.g., A, B+, 85)"
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                />
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
                    'Create Enrollment'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Enrollment Modal */}
      {showViewModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Enrollment Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Student</Label>
                  <p className="text-lg font-semibold">
                    {selectedEnrollment.student.first_name} {selectedEnrollment.student.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{selectedEnrollment.student.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Course</Label>
                  <p className="text-lg font-semibold">
                    {selectedEnrollment.course_offering.course.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedEnrollment.course_offering.course.code}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Semester</Label>
                  <p className="text-gray-900">
                    {selectedEnrollment.course_offering.semester.name} {selectedEnrollment.course_offering.semester.year}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Enrollment Date</Label>
                  <p className="text-gray-900">
                    {new Date(selectedEnrollment.enrollment_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusColor(selectedEnrollment.status)}>
                    {selectedEnrollment.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Credits</Label>
                  <p className="text-gray-900">{selectedEnrollment.credits}</p>
                </div>
              </div>

              {selectedEnrollment.grade && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Grade</Label>
                  <p className="text-gray-900">{selectedEnrollment.grade}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p className="text-gray-900">
                    {new Date(selectedEnrollment.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                  <p className="text-gray-900">
                    {new Date(selectedEnrollment.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedEnrollment(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Enrollment Modal */}
      {showEditModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Enrollment</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-student">Student</Label>
                  <Select value={formData.student?.toString() || ''} onValueChange={(value) => setFormData({...formData, student: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.first_name} {student.last_name} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-course_offering">Course Offering</Label>
                  <Select value={formData.course_offering?.toString() || ''} onValueChange={(value) => setFormData({...formData, course_offering: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course offering" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCourseOfferings.map((offering) => (
                        <SelectItem key={offering.id} value={offering.id.toString()}>
                          {offering.course.name} ({offering.course.code}) - {offering.semester.name} {offering.semester.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-semester">Semester</Label>
                  <Select value={formData.semester?.toString() || ''} onValueChange={(value) => handleSemesterChange(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id.toString()}>
                          {semester.name} {semester.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-enrollment_date">Enrollment Date</Label>
                  <Input
                    id="edit-enrollment_date"
                    type="date"
                    value={formData.enrollment_date}
                    onChange={(e) => setFormData({...formData, enrollment_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="DROPPED">Dropped</SelectItem>
                      <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-credits">Credits</Label>
                  <Input
                    id="edit-credits"
                    type="number"
                    min="1"
                    max="6"
                    value={formData.credits}
                    onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value) || 3})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-grade">Grade (Optional)</Label>
                <Input
                  id="edit-grade"
                  placeholder="Enter grade (e.g., A, B+, 85)"
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEnrollment(null);
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
                    'Update Enrollment'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Enrollment</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this enrollment? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedEnrollment(null);
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
