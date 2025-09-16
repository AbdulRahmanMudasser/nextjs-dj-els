// Admin Panel Types

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  activeCourses: number;
  totalDepartments: number;
  totalPrograms: number;
  totalEnrollments: number;
  pendingApprovals: number;
  systemHealth: SystemHealth;
  userBreakdown: UserBreakdown;
  recentActivity: ActivityItem[];
  quickStats: QuickStat[];
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  databaseStatus: 'connected' | 'disconnected' | 'error';
  serverLoad: number;
  memoryUsage: number;
  diskUsage: number;
  lastBackup: string;
  activeConnections: number;
}

export interface UserBreakdown {
  students: number;
  faculty: number;
  admins: number;
  parents: number;
  librarians: number;
  others: number;
}

export interface ActivityItem {
  id: string;
  type: 'user_registration' | 'course_creation' | 'enrollment' | 'system_event' | 'login' | 'logout';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

export interface QuickStat {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  description: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login?: string;
  profile_picture?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  department?: string;
  program?: string;
  student_id?: string;
  employee_id?: string;
}

export interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  department?: string;
  program?: string;
  student_id?: string;
  employee_id?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  head_of_department?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  description?: string;
  department: string;
  duration_years: number;
  credits_required: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  program: string;
  credits: number;
  instructor?: string;
  semester: string;
  academic_year: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Semester {
  id: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  academic_year: string;
  is_current: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student: string;
  course: string;
  semester: string;
  enrollment_date: string;
  status: 'enrolled' | 'dropped' | 'completed' | 'failed';
  grade?: string;
  credits_earned?: number;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemLog {
  id: string;
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  module: string;
  user?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  size: number;
  status: 'completed' | 'failed' | 'in_progress';
  created_at: string;
  expires_at?: string;
  download_url?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'academic' | 'system' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target_audience: string[];
  is_published: boolean;
  published_at?: string;
  expires_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'password_reset' | 'enrollment' | 'announcement' | 'custom';
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: 'user' | 'academic' | 'financial' | 'system' | 'custom';
  parameters: Record<string, any>;
  generated_by: string;
  generated_at: string;
  status: 'generating' | 'completed' | 'failed';
  file_url?: string;
  file_size?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  type: 'user' | 'course' | 'department' | 'program' | 'enrollment';
  title: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  pagination?: {
    page: number;
    page_size: number;
    total_pages: number;
    total_count: number;
  };
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  filters?: Record<string, any>;
}

export interface BulkOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_items: number;
  processed_items: number;
  failed_items: number;
  errors?: string[];
  created_at: string;
  completed_at?: string;
}
