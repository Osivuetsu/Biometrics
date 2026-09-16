// import api from './api';
// import type { Course, ApiResponse } from '@/types';

// export const courseService = {
//   getAll: async (params?: Record<string, unknown>) => {
//     const res = await api.get<ApiResponse<Course[]>>('/courses', { params });
//     return { data: res.data.data!, meta: res.data.meta! };
//   },

//   getById: async (id: number): Promise<Course> => {
//     const res = await api.get<ApiResponse<Course>>(`/courses/${id}`);
//     return res.data.data!;
//   },

//   create: async (data: Record<string, unknown>): Promise<Course> => {
//     const res = await api.post<ApiResponse<Course>>('/courses', data);
//     return res.data.data!;
//   },

//   update: async (id: number, data: Partial<Course>): Promise<Course> => {
//     const res = await api.patch<ApiResponse<Course>>(`/courses/${id}`, data);
//     return res.data.data!;
//   },

//   delete: async (id: number): Promise<void> => {
//     await api.delete(`/courses/${id}`);
//   },
// };


import api from './api';
import type { Course, ApiResponse } from '@/types';

export const courseService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get<ApiResponse<Course[]>>('/courses', { params });
    return { data: res.data.data!, meta: res.data.meta! };
  },

  getMyCourses: async () => {
    const res = await api.get<ApiResponse<Course[]>>('/courses/my-courses');
    return res.data.data!;
  },

  getById: async (id: number): Promise<Course> => {
    const res = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return res.data.data!;
  },

  create: async (data: Record<string, unknown>): Promise<Course> => {
    const res = await api.post<ApiResponse<Course>>('/courses', data);
    return res.data.data!;
  },

  update: async (id: number, data: Partial<Course>): Promise<Course> => {
    const res = await api.patch<ApiResponse<Course>>(`/courses/${id}`, data);
    return res.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/courses/${id}`);
  },
};
