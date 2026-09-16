import api from './api';
import type { Attendance, ApiResponse } from '@/types';

export const attendanceService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get<ApiResponse<Attendance[]>>('/attendance', { params });
    return { data: res.data.data!, meta: res.data.meta! };
  },

  getSummary: async (courseId: number) => {
    const res = await api.get<ApiResponse<unknown[]>>(`/attendance/summary/${courseId}`);
    return res.data.data!;
  },

  mark: async (data: { student_id: number; course_id: number; distance_score?: number }) => {
    const res = await api.post<ApiResponse<Attendance>>('/attendance', data);
    return res.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/attendance/${id}`);
  },
};
