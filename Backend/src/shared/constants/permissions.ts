import { Role } from './roles';

export const Permissions = {
  // Student permissions
  VIEW_OWN_ATTENDANCE: [Role.STUDENT, Role.ADMIN],
  VIEW_OWN_ENROLLMENTS: [Role.STUDENT, Role.ADMIN],

  // Lecturer permissions
  MARK_ATTENDANCE: [Role.LECTURER, Role.ADMIN],
  VIEW_COURSE_ATTENDANCE: [Role.LECTURER, Role.ADMIN],
  VIEW_COURSE_STUDENTS: [Role.LECTURER, Role.ADMIN],

  // Admin permissions
  MANAGE_STUDENTS: [Role.ADMIN],
  MANAGE_LECTURERS: [Role.ADMIN],
  MANAGE_COURSES: [Role.ADMIN],
  MANAGE_ENROLLMENTS: [Role.ADMIN],
  VIEW_REPORTS: [Role.ADMIN, Role.LECTURER],
  MANAGE_USERS: [Role.ADMIN],

  // Shared
  VIEW_DASHBOARD: [Role.ADMIN, Role.LECTURER, Role.STUDENT],
};
