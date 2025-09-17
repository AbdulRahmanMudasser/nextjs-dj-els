'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Send, Edit, Trash2, Eye, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks/useApi';
import { useApiMutation } from '@/hooks/useApi';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: string[];
  scheduledFor: string | null;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  sentAt: string | null;
  createdBy: string;
  createdAt: string;
  readCount: number;
  totalRecipients: number;
}

interface AnnouncementForm {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: string[];
  scheduledFor: string;
  sendImmediately: boolean;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState<AnnouncementForm>({
    title: '',
    content: '',
    type: 'info',
    priority: 'medium',
    targetAudience: [],
    scheduledFor: '',
    sendImmediately: true
  });

  const { data: announcementsData, loading } = useApi<Announcement[]>('/admin/communications/announcements/');
  const { mutate: createAnnouncement, loading: createLoading } = useApiMutation<Announcement, AnnouncementForm>();
  const { mutate: updateAnnouncement, loading: updateLoading } = useApiMutation<Announcement, AnnouncementForm>();
  const { mutate: deleteAnnouncement, loading: deleteLoading } = useApiMutation<void>();
  const { mutate: sendAnnouncement, loading: sendLoading } = useApiMutation<void>();

  const targetAudienceOptions = [
    { value: 'all_users', label: 'All Users' },
    { value: 'students', label: 'Students' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'staff', label: 'Staff' },
    { value: 'admins', label: 'Administrators' },
    { value: 'departments', label: 'Specific Departments' },
    { value: 'programs', label: 'Specific Programs' }
  ];

  useEffect(() => {
    if (announcementsData) {
      setAnnouncements(announcementsData);
    }
  }, [announcementsData]);

  const handleCreate = async () => {
    try {
      const newAnnouncement = await createAnnouncement('/admin/communications/announcements/', 'POST', formData);
      setAnnouncements([...announcements, newAnnouncement]);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAnnouncement) return;
    try {
      const updatedAnnouncement = await updateAnnouncement(`/admin/communications/announcements/${selectedAnnouncement.id}/`, 'PUT', formData);
      setAnnouncements(announcements.map(a => a.id === selectedAnnouncement.id ? updatedAnnouncement : a));
      setShowEditModal(false);
      setSelectedAnnouncement(null);
      resetForm();
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    try {
      await deleteAnnouncement(`/admin/communications/announcements/${selectedAnnouncement.id}/`, 'DELETE');
      setAnnouncements(announcements.filter(a => a.id !== selectedAnnouncement.id));
      setShowDeleteModal(false);
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handleSend = async (announcement: Announcement) => {
    try {
      await sendAnnouncement(`/admin/communications/announcements/${announcement.id}/send/`, 'POST');
      setAnnouncements(announcements.map(a => 
        a.id === announcement.id 
          ? { ...a, status: 'sent', sentAt: new Date().toISOString() }
          : a
      ));
    } catch (error) {
      console.error('Error sending announcement:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      priority: 'medium',
      targetAudience: [],
      scheduledFor: '',
      sendImmediately: true
    });
  };

  const openEditModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
      scheduledFor: announcement.scheduledFor || '',
      sendImmediately: !announcement.scheduledFor
    });
    setShowEditModal(true);
  };

  const openViewModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowViewModal(true);
  };

  const openDeleteModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDeleteModal(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || announcement.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage system-wide announcements
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge className={getTypeColor(announcement.type)}>
                    {announcement.type}
                  </Badge>
                  <Badge className={getPriorityColor(announcement.priority)}>
                    {announcement.priority}
                  </Badge>
                </div>
                <Badge className={getStatusColor(announcement.status)}>
                  {announcement.status}
                </Badge>
              </div>
              <CardTitle className="text-lg">{announcement.title}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {announcement.content}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <p><strong>Target:</strong> {announcement.targetAudience.join(', ')}</p>
                <p><strong>Created:</strong> {new Date(announcement.createdAt).toLocaleDateString()}</p>
                {announcement.sentAt && (
                  <p><strong>Sent:</strong> {new Date(announcement.sentAt).toLocaleDateString()}</p>
                )}
                {announcement.status === 'sent' && (
                  <p><strong>Read:</strong> {announcement.readCount}/{announcement.totalRecipients}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openViewModal(announcement)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {announcement.status === 'draft' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(announcement)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {announcement.status === 'draft' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSend(announcement)}
                    disabled={sendLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteModal(announcement)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No announcements found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first announcement to get started'}
          </p>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Announcement</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Enter announcement content"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <div className="grid grid-cols-2 gap-2">
                  {targetAudienceOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={formData.targetAudience.includes(option.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              targetAudience: [...formData.targetAudience, option.value]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              targetAudience: formData.targetAudience.filter(a => a !== option.value)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={option.value} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendImmediately"
                    checked={formData.sendImmediately}
                    onCheckedChange={(checked) => setFormData({...formData, sendImmediately: !!checked})}
                  />
                  <Label htmlFor="sendImmediately">Send immediately</Label>
                </div>
              </div>

              {!formData.sendImmediately && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledFor">Schedule For</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({...formData, scheduledFor: e.target.value})}
                    required={!formData.sendImmediately}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? 'Creating...' : 'Create Announcement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Announcement Modal */}
      {showViewModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Announcement Details</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={getTypeColor(selectedAnnouncement.type)}>
                  {selectedAnnouncement.type}
                </Badge>
                <Badge className={getPriorityColor(selectedAnnouncement.priority)}>
                  {selectedAnnouncement.priority}
                </Badge>
                <Badge className={getStatusColor(selectedAnnouncement.status)}>
                  {selectedAnnouncement.status}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">{selectedAnnouncement.title}</h3>
                <p className="text-gray-700 mt-2">{selectedAnnouncement.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-500">Target Audience</Label>
                  <p className="font-medium">{selectedAnnouncement.targetAudience.join(', ')}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Created By</Label>
                  <p className="font-medium">{selectedAnnouncement.createdBy}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Created At</Label>
                  <p className="font-medium">{new Date(selectedAnnouncement.createdAt).toLocaleString()}</p>
                </div>
                {selectedAnnouncement.sentAt && (
                  <div>
                    <Label className="text-gray-500">Sent At</Label>
                    <p className="font-medium">{new Date(selectedAnnouncement.sentAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedAnnouncement.status === 'sent' && (
                  <>
                    <div>
                      <Label className="text-gray-500">Total Recipients</Label>
                      <p className="font-medium">{selectedAnnouncement.totalRecipients}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Read Count</Label>
                      <p className="font-medium">{selectedAnnouncement.readCount}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAnnouncement(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Announcement</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the announcement "{selectedAnnouncement.title}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAnnouncement(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


