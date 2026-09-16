import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services/student.service';
import { lecturerService } from '@/services/lecturer.service';
import { courseService } from '@/services/course.service';
import { attendanceService } from '@/services/attendance.service';
import { recognitionService } from '@/services/recognition.service';
import { useUiStore } from '@/store/uiStore';
import api from '@/services/api';
import type { ApiResponse } from '@/types';

// ── Students ──────────────────────────────────────────────────────────────────
export const useStudents = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['students', params], queryFn: () => studentService.getAll(params) });

export const useStudent = (id: number) =>
  useQuery({ queryKey: ['students', id], queryFn: () => studentService.getById(id), enabled: !!id });

export const useCreateStudent = () => {
  const qc = useQueryClient();
  const toast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: studentService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast('Student created', 'success'); },
    onError: (e: any) => toast(e.response?.data?.message || 'Failed to create student', 'error'),
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  const toast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => studentService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast('Student updated', 'success'); },
    onError: (e: any) => toast(e.response?.data?.message || 'Failed to update student', 'error'),
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  const toast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: studentService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast('Student deleted', 'success'); },
    onError: (e: any) => toast(e.response?.data?.message || 'Failed to delete student', 'error'),
  });
};

// ── Lecturers ─────────────────────────────────────────────────────────────────
export const useLecturers = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['lecturers', params], queryFn: () => lecturerService.getAll(params) });

export const useCreateLecturer = () => {
  const qc = useQueryClient();
  const toast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: lecturerService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lecturers'] }); toast('Lecturer created', 'success'); },
    onError: (e: any) => toast(e.response?.data?.message || 'Failed to create lecturer', 'error'),
  });
};

export const useDeleteLecturer = () => {
  const qc = useQueryClient();
  const toast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: lecturerService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lecturers'] }); toast('Lecturer deleted', 'success'); },
    onError: (e: any) => toast(e.response?.data?.message || 'Failed to delete lecturer', 'error'),
  });
};

// ── Courses ───────────────────────────────────────────────────────────────────
export const useCourses = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['courses', params], queryFn: () => courseService.getAll(params) });

export const useCreateCourse = () => {
  const qc = useQueryClient();
  const toast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: courseService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast('Course created', 'success'); },
    onError: (e: any) => toast(e.response?.data?.message || 'Failed to create course', 'error'),
  });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  const toast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: courseService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast('Course deleted', 'success'); },
    onError: (e: any) => toast(e.response?.data?.message || 'Failed to delete course', 'error'),
  });
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const useAttendance = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['attendance', params], queryFn: () => attendanceService.getAll(params) });

export const useAttendanceSummary = (courseId: number) =>
  useQuery({ queryKey: ['attendance-summary', courseId], queryFn: () => attendanceService.getSummary(courseId), enabled: !!courseId });

export const useMyAttendance = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['my-attendance', params], queryFn: () => studentService.getMyAttendance(params) });

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const useDashboard = () =>
  useQuery({ queryKey: ['dashboard'], queryFn: async () => {
    const res = await api.get<ApiResponse<any>>('/dashboard');
    return res.data.data!;
  }});

// ── Reports ───────────────────────────────────────────────────────────────────
export const useAttendanceReport = (courseId: number, params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['report-attendance', courseId, params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any>>(`/reports/attendance/${courseId}`, { params });
      return res.data.data!;
    },
    enabled: !!courseId,
  });

// ── Recognition ───────────────────────────────────────────────────────────────
export const useEnrollFace = () => {
  const toast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ student_id, image }: { student_id: number; image: string }) =>
      recognitionService.enroll(student_id, image),
    onSuccess: () => toast('Face enrolled successfully', 'success'),
    onError: (e: any) => toast(e.response?.data?.message || 'Enrollment failed', 'error'),
  });
};

export const useRecognizeFace = () =>
  useMutation({
    mutationFn: ({ image, course_id }: { image: string; course_id: number }) =>
      recognitionService.recognize(image, course_id),
  });
