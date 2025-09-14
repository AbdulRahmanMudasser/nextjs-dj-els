// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface UserProfile {
  id: number;
  user: User;
  role: 'student' | 'instructor' | 'admin';
  bio: string;
  avatar?: string;
  phone: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

// Course Types
export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: number;
  instructor_name: string;
  students: number[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  modules: CourseModule[];
  student_count: number;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: number;
  title: string;
  description: string;
  order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Assignment Types
export interface Assignment {
  id: number;
  title: string;
  description: string;
  course: number;
  course_title: string;
  assignment_type: 'homework' | 'quiz' | 'exam' | 'project';
  due_date: string;
  max_points: number;
  is_published: boolean;
  submissions: AssignmentSubmission[];
  submission_count: number;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: number;
  assignment: number;
  student: number;
  student_name: string;
  content: string;
  file_upload?: string;
  submitted_at: string;
  grade?: number;
  feedback: string;
  is_graded: boolean;
}

// Communication Types
export interface Message {
  id: number;
  sender: number;
  sender_name: string;
  recipient: number;
  recipient_name: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user: number;
  notification_type: 'assignment_due' | 'grade_posted' | 'course_update' | 'message_received';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface ApiError {
  detail: string;
  [key: string]: any;
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

export interface CourseForm {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}

export interface AssignmentForm {
  title: string;
  description: string;
  assignment_type: string;
  due_date: string;
  max_points: number;
}
