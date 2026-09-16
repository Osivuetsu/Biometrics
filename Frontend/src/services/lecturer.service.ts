import api from './api';
import type { Lecturer, ApiResponse } from '@/types';

export const lecturerService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get<ApiResponse<Lecturer[]>>('/lecturers', { params });
    return { data: res.data.data!, meta: res.data.meta! };
  },

  getById: async (id: number): Promise<Lecturer> => {
    const res = await api.get<ApiResponse<Lecturer>>(`/lecturers/${id}`);
    return res.data.data!;
  },

  create: async (data: Record<string, unknown>): Promise<Lecturer> => {
    const res = await api.post<ApiResponse<Lecturer>>('/lecturers', data);
    return res.data.data!;
  },

  update: async (id: number, data: Partial<Lecturer>): Promise<Lecturer> => {
    const res = await api.patch<ApiResponse<Lecturer>>(`/lecturers/${id}`, data);
    return res.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/lecturers/${id}`);
  },
};
