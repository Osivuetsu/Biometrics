import prisma from '../../../config/db';
import { AppError } from '../../../shared/middleware/errorHandler';
import { getPagination, buildMeta } from '../../../shared/utils/pagination';
import { Request } from 'express';
import { VerificationStatus } from '@prisma/client';

interface MarkAttendanceInput {
  student_id: number;
  course_id: number;
  distance_score?: number;
  verification_status?: VerificationStatus;
}

export class AttendanceService {
  async getAll(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const courseId = req.query.course_id ? parseInt(req.query.course_id as string) : undefined;
    const studentId = req.query.student_id ? parseInt(req.query.student_id as string) : undefined;
    const dateFrom = req.query.date_from ? new Date(req.query.date_from as string) : undefined;
    const dateTo = req.query.date_to ? new Date(req.query.date_to as string) : undefined;

    const where = {
      ...(courseId && { course_id: courseId }),
      ...(studentId && { student_id: studentId }),
      ...(dateFrom || dateTo ? {
        timestamp: {
          ...(dateFrom && { gte: dateFrom }),
          ...(dateTo && { lte: dateTo }),
        },
      } : {}),
    };

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          student: { select: { matric_no: true, name: true } },
          course: { select: { course_code: true, title: true } },
        },
      }),
      prisma.attendance.count({ where }),
    ]);

    return { records, meta: buildMeta(total, page, limit) };
  }

  async mark(input: MarkAttendanceInput) {
    // Verify student is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        student_id_course_id: {
          student_id: input.student_id,
          course_id: input.course_id,
        },
      },
    });
    if (!enrollment) throw new AppError('Student is not enrolled in this course', 400);

    // Check for duplicate attendance on the same day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await prisma.attendance.findFirst({
      where: {
        student_id: input.student_id,
        course_id: input.course_id,
        timestamp: { gte: today, lt: tomorrow },
      },
    });

    if (existing) throw new AppError('Attendance already marked for today', 409);

    return prisma.attendance.create({
      data: {
        student_id: input.student_id,
        course_id: input.course_id,
        distance_score: input.distance_score,
        verification_status: input.verification_status || 'VERIFIED',
      },
      include: {
        student: { select: { matric_no: true, name: true } },
        course: { select: { course_code: true, title: true } },
      },
    });
  }

  async getById(id: number) {
    const record = await prisma.attendance.findUnique({
      where: { attendance_id: id },
      include: {
        student: { select: { matric_no: true, name: true } },
        course: { select: { course_code: true, title: true } },
      },
    });
    if (!record) throw new AppError('Attendance record not found', 404);
    return record;
  }

  async delete(id: number) {
    await this.getById(id);
    await prisma.attendance.delete({ where: { attendance_id: id } });
    return { message: 'Attendance record deleted' };
  }

  async getSummary(courseId: number) {
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                attendance: {
                  where: { course_id: courseId },
                },
              },
            },
          },
        },
      },
    });

    if (!course) throw new AppError('Course not found', 404);

    return course.enrollments.map(({ student }) => ({
      student_id: student.student_id,
      matric_no: student.matric_no,
      name: student.name,
      total_classes: student.attendance.length,
      verified: student.attendance.filter((a) => a.verification_status === 'VERIFIED').length,
    }));
  }
}
