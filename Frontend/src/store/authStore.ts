import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  getRole: () => Role | null;
  getDashboardPath: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      getRole: () => get().user?.role ?? null,

      getDashboardPath: () => {
        const role = get().user?.role;
        if (role === 'ADMIN') return '/admin/dashboard';
        if (role === 'LECTURER') return '/lecturer/dashboard';
        if (role === 'STUDENT') return '/student/dashboard';
        return '/login';
      },
    }),
    { name: 'auth-storage' }
  )
);
