import api from './api';
import type { Student, Attendance, ApiResponse, PaginationMeta } from '@/types';

interface StudentsResponse { students: Student[]; meta: PaginationMeta; }

export const studentService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get<ApiResponse<Student[]>>('/students', { params });
    return { data: res.data.data!, meta: res.data.meta! };
  },

  getById: async (id: number): Promise<Student> => {
    const res = await api.get<ApiResponse<Student>>(`/students/${id}`);
    return res.data.data!;
  },

  create: async (data: Record<string, unknown>): Promise<Student> => {
    const res = await api.post<ApiResponse<Student>>('/students', data);
    return res.data.data!;
  },

  update: async (id: number, data: Partial<Student>): Promise<Student> => {
    const res = await api.patch<ApiResponse<Student>>(`/students/${id}`, data);
    return res.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/students/${id}`);
  },

  getAttendance: async (id: number, params?: Record<string, unknown>) => {
    const res = await api.get<ApiResponse<Attendance[]>>(`/students/${id}/attendance`, { params });
    return { data: res.data.data!, meta: res.data.meta! };
  },

  getMyAttendance: async (params?: Record<string, unknown>) => {
    const res = await api.get<ApiResponse<Attendance[]>>('/students/my-attendance', { params });
    return { data: res.data.data!, meta: res.data.meta! };
  },
};
