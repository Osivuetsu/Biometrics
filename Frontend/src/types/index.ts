export type Role = 'ADMIN' | 'LECTURER' | 'STUDENT';
export type VerificationStatus = 'VERIFIED' | 'FAILED' | 'PENDING';

export interface User {
  user_id: number;
  username: string;
  role: Role;
  created_at: string;
  student?: Student;
  lecturer?: Lecturer;
}

export interface Student {
  student_id: number;
  matric_no: string;
  name: string;
  department: string;
  level: number;
  user?: { username: string; role: Role };
  enrollments?: Enrollment[];
}

export interface Lecturer {
  lecturer_id: number;
  name: string;
  email: string;
  user?: { username: string };
  courses?: Course[];
}

export interface Course {
  course_id: number;
  course_code: string;
  title: string;
  lecturer_id: number;
  lecturer?: { name: string; email: string };
  _count?: { enrollments: number };
}

export interface Enrollment {
  enrollment_id: number;
  student_id: number;
  course_id: number;
  student?: Pick<Student, 'matric_no' | 'name'>;
  course?: Pick<Course, 'course_code' | 'title'>;
}

export interface Attendance {
  attendance_id: number;
  student_id: number;
  course_id: number;
  timestamp: string;
  distance_score: number | null;
  verification_status: VerificationStatus;
  student?: Pick<Student, 'matric_no' | 'name'>;
  course?: Pick<Course, 'course_code' | 'title'>;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: unknown;
}

export interface RecognitionResult {
  matched: boolean;
  student_id?: number;
  name?: string;
  matric_no?: string;
  distance_score?: number;
  already_marked?: boolean;
  attendance?: Attendance;
  message?: string;
}

export interface DashboardStats {
  totalStudents?: number;
  totalLecturers?: number;
  totalCourses?: number;
  totalEnrollments?: number;
  todayAttendance?: number;
}
