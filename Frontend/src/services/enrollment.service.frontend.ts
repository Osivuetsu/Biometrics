import api from './api';
import type { ApiResponse } from '@/types';

export const enrollmentService = {
  // Student
  getAvailableCourses: async () => {
    const res = await api.get<ApiResponse<any[]>>('/enrollments/available');
    return res.data.data!;
  },

  selfEnroll: async (course_id: number) => {
    const res = await api.post<ApiResponse<unknown>>('/enrollments/self', { course_id });
    return res.data;
  },

  selfUnenroll: async (course_id: number) => {
    const res = await api.delete<ApiResponse<unknown>>(`/enrollments/self/${course_id}`);
    return res.data;
  },

  // Admin
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get<ApiResponse<unknown[]>>('/enrollments', { params });
    return { data: res.data.data!, meta: res.data.meta! };
  },

  enroll: async (student_id: number, course_id: number) => {
    const res = await api.post<ApiResponse<unknown>>('/enrollments', { student_id, course_id });
    return res.data;
  },

  bulkEnroll: async (student_ids: number[], course_id: number) => {
    const res = await api.post<ApiResponse<unknown>>('/enrollments/bulk', { student_ids, course_id });
    return res.data;
  },

  unenroll: async (enrollment_id: number) => {
    await api.delete(`/enrollments/${enrollment_id}`);
  },
};
