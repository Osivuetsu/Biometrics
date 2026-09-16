import { create } from 'zustand';
import type { RecognitionResult } from '@/types';

interface AttendanceState {
  selectedCourseId: number | null;
  lastRecognitionResult: RecognitionResult | null;
  isRecognizing: boolean;
  setSelectedCourse: (id: number | null) => void;
  setRecognitionResult: (result: RecognitionResult | null) => void;
  setIsRecognizing: (val: boolean) => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  selectedCourseId: null,
  lastRecognitionResult: null,
  isRecognizing: false,

  setSelectedCourse: (id) => set({ selectedCourseId: id }),
  setRecognitionResult: (result) => set({ lastRecognitionResult: result }),
  setIsRecognizing: (val) => set({ isRecognizing: val }),
}));
