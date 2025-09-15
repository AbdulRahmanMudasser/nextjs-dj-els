// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
}

export interface UserProfile {
  id: number;
  user: User;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT' | 'LIBRARIAN';
  employee_id?: string;
  student_id?: string;
  phone_number: string;
  date_of_birth?: string;
  address: string;
  emergency_contact: string;
  profile_picture?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_ip?: string;
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
  full_name: string;
}

export interface StudentProfile {
  id: number;
  user_profile: UserProfile;
  admission_year: number;
  graduation_year?: number;
  gpa: number;
  parent_contact?: number;
  library_card_number?: string;
  is_alumni: boolean;
}

export interface FacultyProfile {
  id: number;
  user_profile: UserProfile;
  department: string;
  designation: 'PROFESSOR' | 'ASSOCIATE_PROFESSOR' | 'ASSISTANT_PROFESSOR' | 'LECTURER' | 'INSTRUCTOR' | 'VISITING_PROFESSOR';
  qualification: string;
  experience_years: number;
  office_location?: string;
  office_hours?: string;
  research_interests?: string;
  is_department_head: boolean;
}

export interface ParentProfile {
  id: number;
  user_profile: UserProfile;
  occupation?: string;
  workplace?: string;
  relationship_to_student: string;
}

export interface LibrarianProfile {
  id: number;
  user_profile: UserProfile;
  library_section?: string;
  employee_number?: string;
  specialization?: string;
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
  detail?: string;
  error?: string;
  [key: string]: any;
}

// Authentication Types
export interface LoginForm {
  email_or_username: string;
  password: string;
  remember_me: boolean;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT' | 'LIBRARIAN';
  phone_number?: string;
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
  
  // Role-specific fields
  employee_id?: string;
  student_id?: string;
  admission_year?: number;
  department?: string;
  designation?: string;
  qualification?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user_id: number;
  username: string;
  role?: string;
}

export interface UserPermissions {
  role: string;
  can_manage_users: boolean;
  can_manage_courses: boolean;
  can_grade_students: boolean;
  can_view_grades: boolean;
  can_communicate: boolean;
  can_access_admin: boolean;
  can_manage_library: boolean;
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
