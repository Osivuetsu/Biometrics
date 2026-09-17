import axios from 'axios';
import prisma from '../../../config/db';
import { AppError } from '../../../shared/middleware/errorHandler';
import { env } from '../../../config/env';
import { logger } from '../../../config/logger';

const biometricClient = axios.create({
  baseURL: env.BIOMETRIC_ENGINE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export class RecognitionService {

  /**
   * Wake the Render biometric service before making a biometric request.
   * Render free services can sleep when inactive.
   */
  private async wakeBiometricEngine() {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await biometricClient.get('/', {
          timeout: 60000,
        });

        logger.info('Biometric engine is ready');
        return;
      } catch (error) {
        logger.warn(
          `Biometric engine wake-up attempt ${attempt}/${maxAttempts} failed`
        );

        if (attempt === maxAttempts) {
          throw new AppError(
            'Biometric engine is currently unavailable. Please try again in a moment.',
            503
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  async enrollFace(studentId: number, imageBase64: string) {
    const student = await prisma.student.findUnique({
      where: { student_id: studentId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    try {
      await this.wakeBiometricEngine();

      const response = await biometricClient.post('/api/enroll', {
        student_id: studentId,
        image: imageBase64,
      });

      const { embedding_id } = response.data.data;

      logger.info(`Face enrolled for student ${studentId}`);

      return {
        message: 'Face enrolled successfully',
        embedding_id,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        throw new AppError(
          error.response?.data?.message || 'Face enrollment failed',
          502
        );
      }

      throw error;
    }
  }

  async enrollFaceMulti(studentId: number, images: string[]) {
    const student = await prisma.student.findUnique({
      where: { student_id: studentId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    try {
      await this.wakeBiometricEngine();

      const response = await biometricClient.post('/api/enroll/multi', {
        student_id: studentId,
        images,
      });

      return response.data.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        throw new AppError(
          error.response?.data?.message || 'Face enrollment failed',
          502
        );
      }

      throw error;
    }
  }

  async recognizeFace(imageBase64: string, courseId: number) {
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    try {
      await this.wakeBiometricEngine();

      const response = await biometricClient.post('/api/recognize', {
        image: imageBase64,
        course_id: courseId,
      });

      const result = response.data.data;

      if (!result.matched) {
        return {
          matched: false,
          message: result.message,
        };
      }

      return await this._markAttendance(result, courseId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        throw new AppError(
          error.response?.data?.message || 'Face recognition failed',
          502
        );
      }

      throw error;
    }
  }

  async recognizeFaceConfirmed(images: string[], courseId: number) {
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    try {
      await this.wakeBiometricEngine();

      const response = await biometricClient.post(
        '/api/recognize/confirmed',
        {
          images,
          course_id: courseId,
        }
      );

      const result = response.data.data;

      if (!result.matched || !result.confirmed) {
        return result;
      }

      return await this._markAttendance(result, courseId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        throw new AppError(
          error.response?.data?.message || 'Face recognition failed',
          502
        );
      }

      throw error;
    }
  }

  async recognizeFaceMulti(imageBase64: string, courseId: number) {
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    try {
      await this.wakeBiometricEngine();

      const response = await biometricClient.post(
        '/api/recognize/multi',
        {
          image: imageBase64,
          course_id: courseId,
        }
      );

      const {
        faces_detected,
        matched_count,
        unmatched_count,
        matches,
      } = response.data.data;

      if (!matches || matches.length === 0) {
        return {
          faces_detected,
          matched_count: 0,
          unmatched_count,
          results: [],
        };
      }

      const { AttendanceService } = await import(
        '../../attendance/services/attendance.service'
      );

      const attendanceService = new AttendanceService();

      const results = await Promise.all(
        matches.map(async (match: any) => {
          try {
            const attendance = await attendanceService.mark({
              student_id: match.student_id,
              course_id: courseId,
              distance_score: match.distance_score,
              verification_status: 'VERIFIED',
            });

            return {
              ...match,
              already_marked: false,
              attendance,
            };
          } catch (err: any) {
            if (err.message === 'Attendance already marked for today') {
              return {
                ...match,
                already_marked: true,
              };
            }

            return {
              ...match,
              error: err.message,
            };
          }
        })
      );

      return {
        faces_detected,
        matched_count,
        unmatched_count,
        results,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        throw new AppError(
          error.response?.data?.message || 'Face recognition failed',
          502
        );
      }

      throw error;
    }
  }

  private async _markAttendance(result: any, courseId: number) {
    const { AttendanceService } = await import(
      '../../attendance/services/attendance.service'
    );

    const attendanceService = new AttendanceService();

    try {
      const attendance = await attendanceService.mark({
        student_id: result.student_id,
        course_id: courseId,
        distance_score: result.distance_score,
        verification_status: 'VERIFIED',
      });

      logger.info(
        `Recognized student ${result.student_id} for course ${courseId}`
      );

      return {
        ...result,
        already_marked: false,
        attendance,
      };
    } catch (err: any) {
      if (err.message === 'Attendance already marked for today') {
        return {
          ...result,
          already_marked: true,
        };
      }

      throw err;
    }
  }

  async verifyFace(studentId: number, imageBase64: string) {
    const student = await prisma.student.findUnique({
      where: { student_id: studentId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const hasEmbedding = await prisma.faceEmbedding.findFirst({
      where: { student_id: studentId },
    });

    if (!hasEmbedding) {
      throw new AppError(
        'No face enrolled for this student',
        400
      );
    }

    try {
      await this.wakeBiometricEngine();

      const response = await biometricClient.post('/api/verify', {
        student_id: studentId,
        image: imageBase64,
      });

      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        throw new AppError(
          error.response?.data?.message || 'Face verification failed',
          502
        );
      }

      throw error;
    }
  }

  async deleteEmbedding(studentId: number) {
    const embeddings = await prisma.faceEmbedding.findMany({
      where: { student_id: studentId },
    });

    if (!embeddings.length) {
      throw new AppError(
        'No embeddings found for this student',
        404
      );
    }

    try {
      await this.wakeBiometricEngine();

      await biometricClient.delete(
        `/api/embeddings/${studentId}`
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      // The database embeddings will still be removed below.
      // The biometric engine may not have a matching record.
      logger.warn(
        `Could not delete biometric engine embeddings for student ${studentId}`
      );
    }

    await prisma.faceEmbedding.deleteMany({
      where: { student_id: studentId },
    });

    return {
      message: 'Face embeddings deleted successfully',
    };
  }
}
