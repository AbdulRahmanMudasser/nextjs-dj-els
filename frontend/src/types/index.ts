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

// Academic Structure Types
export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  head_of_department?: number;
  head_of_department_name?: string;
  established_date: string;
  contact_email: string;
  contact_phone: string;
  location: string;
  is_active: boolean;
  program_count: number;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: number;
  name: string;
  code: string;
  department: number;
  department_name: string;
  department_code: string;
  degree_type: 'BACHELOR' | 'MASTER' | 'PHD' | 'CERTIFICATE' | 'DIPLOMA';
  duration_years: number;
  total_credit_hours: number;
  description: string;
  admission_requirements: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Semester {
  id: number;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  is_current: boolean;
  is_active: boolean;
  course_offering_count: number;
  enrollment_count: number;
  created_at: string;
  updated_at: string;
}

// Course Types
export interface Course {
  id: number;
  name: string;
  code: string;
  department: number;
  department_name: string;
  department_code: string;
  credit_hours: number;
  course_type: 'CORE' | 'ELECTIVE' | 'LAB' | 'PROJECT' | 'THESIS';
  level: 'UNDERGRADUATE' | 'GRADUATE' | 'POSTGRADUATE';
  description: string;
  prerequisites: number[];
  prerequisites_names: string[];
  corequisites: number[];
  corequisites_names: string[];
  syllabus_file?: string;
  learning_outcomes: string;
  is_active: boolean;
  offering_count: number;
  created_at: string;
  updated_at: string;
}

export interface CourseOffering {
  id: number;
  course: number;
  course_name: string;
  course_code: string;
  semester: number;
  semester_name: string;
  semester_code: string;
  section: string;
  instructor: number;
  instructor_name: string;
  max_enrollment: number;
  current_enrollment: number;
  enrollment_percentage: number;
  class_schedule: Record<string, any>;
  room_number: string;
  meeting_pattern: string;
  start_time: string;
  end_time: string;
  enrollment_open: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: number;
  student: number;
  student_name: string;
  student_id: string;
  course_offering: number;
  course_offering_name: string;
  enrollment_date: string;
  status: 'ENROLLED' | 'DROPPED' | 'COMPLETED' | 'WITHDRAWN' | 'AUDIT';
  grade?: string;
  grade_points?: number;
  attendance_percentage: number;
  is_audit: boolean;
  drop_date?: string;
  completion_date?: string;
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
  course_offering: number;
  course_offering_name: string;
  course_name: string;
  semester_name: string;
  title: string;
  description: string;
  assignment_type: 'HOMEWORK' | 'QUIZ' | 'EXAM' | 'PROJECT' | 'LAB' | 'PRESENTATION' | 'REPORT';
  total_points: number;
  due_date: string;
  late_submission_allowed: boolean;
  late_penalty_percentage: number;
  max_attempts: number;
  is_group_assignment: boolean;
  max_group_size?: number;
  instructions: string;
  attachments: string[];
  rubric: Record<string, any>;
  auto_grade: boolean;
  published: boolean;
  instructor_name: string;
  submissions: Submission[];
  submission_count: number;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: number;
  assignment: number;
  assignment_title: string;
  student: number;
  student_name: string;
  student_id: string;
  submission_date: string;
  content?: string;
  files: string[];
  is_late: boolean;
  attempt_number: number;
  plagiarism_score?: number;
  plagiarism_report?: Record<string, any>;
  grade?: number;
  graded_by?: number;
  graded_at?: string;
  feedback?: string;
  is_group_submission: boolean;
  group_members: number[];
}

// Communication Types
export interface DiscussionForum {
  id: number;
  course_offering?: number;
  course_offering_name?: string;
  title: string;
  description: string;
  is_general: boolean;
  is_private: boolean;
  allowed_roles: string[];
  created_by: number;
  created_by_name: string;
  thread_count: number;
  created_at: string;
  updated_at: string;
}

export interface DiscussionThread {
  id: number;
  forum: number;
  forum_title: string;
  title: string;
  content: string;
  author: number;
  author_name: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  last_activity: string;
  reply_count: number;
  created_at: string;
  updated_at: string;
}

export interface DiscussionReply {
  id: number;
  thread: number;
  thread_title: string;
  parent_reply?: number;
  parent_author_name?: string;
  content: string;
  author: number;
  author_name: string;
  is_solution: boolean;
  upvotes: number;
  downvotes: number;
  child_replies_count: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  recipient: number;
  title: string;
  message: string;
  notification_type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  category: 'ASSIGNMENT' | 'GRADE' | 'ENROLLMENT' | 'SYSTEM' | 'MESSAGE' | 'FORUM' | 'COURSE';
  read: boolean;
  read_at?: string;
  action_url?: string;
  sender?: number;
  sender_name?: string;
  related_object_type?: string;
  related_object_id?: number;
  expires_at?: string;
  created_at: string;
}

export interface PrivateMessage {
  id: number;
  sender: number;
  sender_name: string;
  recipient: number;
  recipient_name: string;
  subject: string;
  content: string;
  attachments: string[];
  is_read: boolean;
  read_at?: string;
  parent_message?: number;
  parent_subject?: string;
  is_deleted_by_sender: boolean;
  is_deleted_by_recipient: boolean;
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
  name: string;
  code: string;
  department: number;
  credit_hours: number;
  course_type: string;
  level: string;
  description: string;
  prerequisites: number[];
  corequisites: number[];
  learning_outcomes: string;
}

export interface CourseOfferingForm {
  course: number;
  semester: number;
  section: string;
  instructor: number;
  max_enrollment: number;
  class_schedule: Record<string, any>;
  room_number: string;
  meeting_pattern: string;
  start_time: string;
  end_time: string;
}

export interface AssignmentForm {
  course_offering: number;
  title: string;
  description: string;
  assignment_type: string;
  total_points: number;
  due_date: string;
  late_submission_allowed: boolean;
  late_penalty_percentage: number;
  max_attempts: number;
  is_group_assignment: boolean;
  max_group_size?: number;
  instructions: string;
  attachments: string[];
  rubric: Record<string, any>;
  auto_grade: boolean;
  published: boolean;
}

export interface SubmissionForm {
  assignment: number;
  content?: string;
  files: string[];
  is_group_submission: boolean;
  group_members: number[];
}
