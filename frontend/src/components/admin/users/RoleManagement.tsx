'use client';

import React, { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useApiMutation } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { 
  Shield, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  X
} from 'lucide-react';

interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  user_count: number;
  is_system_role: boolean;
  created_at: string;
}

interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
  category: string;
}

export default function RoleManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{id: number, name: string} | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    code: '',
    description: '',
    permissions: [] as string[]
  });
  
  const { mutate: deleteRole } = useApiMutation();
  const { mutate: createRole } = useApiMutation();
  const { mutate: updateRole } = useApiMutation();
  
  // Fetch roles data
  const { data: rolesData, loading: rolesLoading, error: rolesError, refetch: refetchRoles } = useApi<Role[]>('/admin/roles/');
  
  // Fetch permissions data
  const { data: permissionsData, loading: permissionsLoading } = useApi<Permission[]>('/admin/permissions/');

  if (rolesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (rolesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading roles
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {rolesError}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for now - will be replaced with real API data
  const roles: Role[] = [
    {
      id: 1,
      name: 'Administrator',
      code: 'ADMIN',
      description: 'Full system access with all permissions',
      permissions: ['can_access_admin_panel', 'can_create_users', 'can_manage_roles', 'can_view_reports'],
      user_count: 2,
      is_system_role: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Faculty Member',
      code: 'FACULTY',
      description: 'Can manage courses and students',
      permissions: ['can_create_courses', 'can_grade_assignments', 'can_view_students'],
      user_count: 15,
      is_system_role: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      name: 'Student',
      code: 'STUDENT',
      description: 'Can enroll in courses and submit assignments',
      permissions: ['can_enroll_courses', 'can_submit_assignments', 'can_view_grades'],
      user_count: 150,
      is_system_role: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 4,
      name: 'Department Head',
      code: 'DEPT_HEAD',
      description: 'Can manage faculty and courses in their department',
      permissions: ['can_manage_faculty', 'can_approve_courses', 'can_view_department_reports'],
      user_count: 5,
      is_system_role: false,
      created_at: '2024-01-15T10:30:00Z'
    }
  ];

  const permissions: Permission[] = [
    { id: 1, name: 'Access Admin Panel', code: 'can_access_admin_panel', description: 'Access to admin dashboard', category: 'System' },
    { id: 2, name: 'Create Users', code: 'can_create_users', description: 'Create new user accounts', category: 'User Management' },
    { id: 3, name: 'Manage Roles', code: 'can_manage_roles', description: 'Create and modify roles', category: 'User Management' },
    { id: 4, name: 'View Reports', code: 'can_view_reports', description: 'Access system reports', category: 'Reports' },
    { id: 5, name: 'Create Courses', code: 'can_create_courses', description: 'Create new courses', category: 'Academic' },
    { id: 6, name: 'Grade Assignments', code: 'can_grade_assignments', description: 'Grade student assignments', category: 'Academic' },
    { id: 7, name: 'View Students', code: 'can_view_students', description: 'View student information', category: 'Academic' },
    { id: 8, name: 'Enroll in Courses', code: 'can_enroll_courses', description: 'Enroll in available courses', category: 'Academic' },
    { id: 9, name: 'Submit Assignments', code: 'can_submit_assignments', description: 'Submit course assignments', category: 'Academic' },
    { id: 10, name: 'View Grades', code: 'can_view_grades', description: 'View personal grades', category: 'Academic' }
  ];

  const getRoleColor = (code: string) => {
    const colorMap: Record<string, string> = {
      'ADMIN': 'bg-red-100 text-red-800',
      'FACULTY': 'bg-blue-100 text-blue-800',
      'STUDENT': 'bg-green-100 text-green-800',
      'DEPT_HEAD': 'bg-purple-100 text-purple-800',
      'PARENT': 'bg-yellow-100 text-yellow-800',
      'LIBRARIAN': 'bg-indigo-100 text-indigo-800',
    };
    return colorMap[code] || 'bg-gray-100 text-gray-800';
  };

  const handleDeleteRole = (roleId: number, roleName: string) => {
    setRoleToDelete({ id: roleId, name: roleName });
    setShowDeleteModal(true);
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(`/admin/roles/${roleToDelete.id}/`, 'DELETE');
      await refetchRoles();
    } catch (error) {
      console.error('Failed to delete role:', error);
      alert('Failed to delete role. Please try again.');
    } finally {
      setRoleToDelete(null);
    }
  };

  const handleCreateRole = async () => {
    try {
      await createRole('/admin/roles/', 'POST', newRole);
      setShowCreateForm(false);
      setNewRole({ name: '', code: '', description: '', permissions: [] });
      await refetchRoles();
    } catch (error) {
      console.error('Failed to create role:', error);
      alert('Failed to create role. Please try again.');
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      await updateRole(`/admin/roles/${editingRole.id}/`, 'PUT', editingRole);
      setEditingRole(null);
      await refetchRoles();
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update role. Please try again.');
    }
  };

  const handleViewRole = (role: Role) => {
    setViewingRole(role);
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || role.permissions.some(perm => 
      permissions.find(p => p.code === perm)?.category === selectedCategory
    );
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(permissions.map(p => p.category)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user roles and permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">System Roles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roles.filter(r => r.is_system_role).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Custom Roles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roles.filter(r => !r.is_system_role).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roles.reduce((sum, role) => sum + role.user_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles ({filteredRoles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{role.name}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{role.user_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permissions.find(p => p.code === permission)?.name || permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getRoleColor(role.code)}>
                        {role.is_system_role ? 'System' : 'Custom'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(role.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingRole(role)}
                          title="Edit Role"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewRole(role)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!role.is_system_role && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            title="Delete Role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Role Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setNewRole({ name: '', code: '', description: '', permissions: [] });
        }}
        title="Create New Role"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <Input
              value={newRole.name}
              onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter role name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Code</label>
            <Input
              value={newRole.code}
              onChange={(e) => setNewRole(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="Enter role code (e.g., CUSTOM_ROLE)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Input
              value={newRole.description}
              onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter role description"
              required
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowCreateForm(false);
              setNewRole({ name: '', code: '', description: '', permissions: [] });
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateRole}>
            Create Role
          </Button>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={!!editingRole}
        onClose={() => setEditingRole(null)}
        title="Edit Role"
        size="md"
      >
        {editingRole && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <Input
                value={editingRole.name}
                onChange={(e) => setEditingRole(prev => prev ? { ...prev, name: e.target.value } : null)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Code</label>
              <Input
                value={editingRole.code}
                onChange={(e) => setEditingRole(prev => prev ? { ...prev, code: e.target.value.toUpperCase() } : null)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Input
                value={editingRole.description}
                onChange={(e) => setEditingRole(prev => prev ? { ...prev, description: e.target.value } : null)}
                required
              />
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setEditingRole(null)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateRole}>
            Update Role
          </Button>
        </div>
      </Modal>

      {/* View Role Modal */}
      <Modal
        isOpen={!!viewingRole}
        onClose={() => setViewingRole(null)}
        title="Role Details"
        size="lg"
      >
        {viewingRole && (
          <div className="space-y-6">
            {/* Role Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <p className="text-sm text-gray-900">{viewingRole.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Code</label>
                <p className="text-sm text-gray-900">{viewingRole.code}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900">{viewingRole.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <Badge className={getRoleColor(viewingRole.code)}>
                  {viewingRole.is_system_role ? 'System Role' : 'Custom Role'}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Users</label>
                <p className="text-sm text-gray-900">{viewingRole.user_count} users</p>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {viewingRole.permissions.map((permission) => {
                  const perm = permissions.find(p => p.code === permission);
                  return (
                    <div key={permission} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {perm?.name || permission}
                        </p>
                        {perm?.description && (
                          <p className="text-xs text-gray-500">{perm.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setViewingRole(null)}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRoleToDelete(null);
        }}
        onConfirm={confirmDeleteRole}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${roleToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
