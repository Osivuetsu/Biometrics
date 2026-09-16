import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layouts
import AppLayout from '@/components/layouts/AppLayout';
import AuthLayout from '@/components/layouts/AuthLayout';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';

// Auth
import LoginPage from '@/pages/auth/Login';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import StudentManagement from '@/pages/admin/StudentManagement';
import LecturerManagement from '@/pages/admin/LecturerManagement';
import CourseManagement from '@/pages/admin/CourseManagement';
import FaceEnrollment from '@/pages/admin/FaceEnrollment';
import AdminAttendanceRecords from '@/pages/admin/AttendanceRecords';
import AdminReports from '@/pages/admin/Reports';

// Lecturer pages
import LecturerDashboard from '@/pages/lecturer/Dashboard';
import MyCourses from '@/pages/lecturer/MyCourses';
import CourseStudents from '@/pages/lecturer/CourseStudents';
import TakeAttendance from '@/pages/lecturer/TakeAttendance';
import LecturerReports from '@/pages/lecturer/Reports';

// Student pages
import StudentDashboard from '@/pages/student/Dashboard';
import StudentMyCourses from '@/pages/student/MyCourses';
import AttendanceHistory from '@/pages/student/AttendanceHistory';
import Profile from '@/pages/student/Profile';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'students', element: <StudentManagement /> },
          { path: 'lecturers', element: <LecturerManagement /> },
          { path: 'courses', element: <CourseManagement /> },
          { path: 'face-enrollment', element: <FaceEnrollment /> },
          { path: 'attendance', element: <AdminAttendanceRecords /> },
          { path: 'reports', element: <AdminReports /> },
        ],
      },
    ],
  },
  {
    path: '/lecturer',
    element: <ProtectedRoute allowedRoles={['LECTURER']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <LecturerDashboard /> },
          { path: 'courses', element: <MyCourses /> },
          { path: 'courses/:courseId/students', element: <CourseStudents /> },
          { path: 'take-attendance', element: <TakeAttendance /> },
          { path: 'reports', element: <LecturerReports /> },
        ],
      },
    ],
  },
  {
    path: '/student',
    element: <ProtectedRoute allowedRoles={['STUDENT']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <StudentDashboard /> },
          { path: 'courses', element: <StudentMyCourses /> },
          { path: 'attendance', element: <AttendanceHistory /> },
          { path: 'profile', element: <Profile /> },
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
