import api from './api';
import type { RecognitionResult, ApiResponse } from '@/types';

export const recognitionService = {
  enroll: async (student_id: number, image: string) => {
    const res = await api.post<ApiResponse<{ embedding_id: number }>>('/recognition/enroll', {
      student_id,
      image,
    });
    return res.data.data!;
  },

  recognize: async (image: string, course_id: number): Promise<RecognitionResult> => {
    const res = await api.post<ApiResponse<RecognitionResult>>('/recognition/recognize', {
      image,
      course_id,
    });
    return res.data.data!;
  },

  verify: async (student_id: number, image: string) => {
    const res = await api.post<ApiResponse<RecognitionResult>>('/recognition/verify', {
      student_id,
      image,
    });
    return res.data.data!;
  },

  deleteEmbedding: async (student_id: number): Promise<void> => {
    await api.delete(`/recognition/embeddings/${student_id}`);
  },
};
