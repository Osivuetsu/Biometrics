import api from './api';
import type { AuthResponse, User, ApiResponse } from '@/types';

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', { username, password });
    return res.data.data!;
  },

  getProfile: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/profile');
    return res.data.data!;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.patch('/auth/change-password', { currentPassword, newPassword });
  },
};
