// import prisma from '../../../config/db';
// import { AppError } from '../../../shared/middleware/errorHandler';
// import { getPagination, buildMeta } from '../../../shared/utils/pagination';
// import { Request } from 'express';

// export class EnrollmentService {
//   async getAll(req: Request) {
//     const { page, limit, skip } = getPagination(req);
//     const courseId = req.query.course_id ? parseInt(req.query.course_id as string) : undefined;
//     const studentId = req.query.student_id ? parseInt(req.query.student_id as string) : undefined;

//     const where = {
//       ...(courseId && { course_id: courseId }),
//       ...(studentId && { student_id: studentId }),
//     };

//     const [enrollments, total] = await Promise.all([
//       prisma.enrollment.findMany({
//         where,
//         skip,
//         take: limit,
//         include: {
//           student: { select: { matric_no: true, name: true } },
//           course: { select: { course_code: true, title: true } },
//         },
//       }),
//       prisma.enrollment.count({ where }),
//     ]);

//     return { enrollments, meta: buildMeta(total, page, limit) };
//   }

//   async enroll(studentId: number, courseId: number) {
//     const student = await prisma.student.findUnique({ where: { student_id: studentId } });
//     if (!student) throw new AppError('Student not found', 404);

//     const course = await prisma.course.findUnique({ where: { course_id: courseId } });
//     if (!course) throw new AppError('Course not found', 404);

//     const existing = await prisma.enrollment.findUnique({
//       where: { student_id_course_id: { student_id: studentId, course_id: courseId } },
//     });
//     if (existing) throw new AppError('Student is already enrolled in this course', 409);

//     return prisma.enrollment.create({
//       data: { student_id: studentId, course_id: courseId },
//       include: {
//         student: { select: { matric_no: true, name: true } },
//         course: { select: { course_code: true, title: true } },
//       },
//     });
//   }

//   async bulkEnroll(studentIds: number[], courseId: number) {
//     const course = await prisma.course.findUnique({ where: { course_id: courseId } });
//     if (!course) throw new AppError('Course not found', 404);

//     const results = await Promise.allSettled(
//       studentIds.map((id) => this.enroll(id, courseId))
//     );

//     const succeeded = results.filter((r) => r.status === 'fulfilled').length;
//     const failed = results.filter((r) => r.status === 'rejected').length;

//     return { succeeded, failed, total: studentIds.length };
//   }

//   async unenroll(enrollmentId: number) {
//     const enrollment = await prisma.enrollment.findUnique({
//       where: { enrollment_id: enrollmentId },
//     });
//     if (!enrollment) throw new AppError('Enrollment not found', 404);

//     await prisma.enrollment.delete({ where: { enrollment_id: enrollmentId } });
//     return { message: 'Student unenrolled successfully' };
//   }
// }


import prisma from '../../../config/db';
import { AppError } from '../../../shared/middleware/errorHandler';
import { getPagination, buildMeta } from '../../../shared/utils/pagination';
import { Request } from 'express';

export class EnrollmentService {
  async getAll(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const courseId = req.query.course_id ? parseInt(req.query.course_id as string) : undefined;
    const studentId = req.query.student_id ? parseInt(req.query.student_id as string) : undefined;

    const where = {
      ...(courseId && { course_id: courseId }),
      ...(studentId && { student_id: studentId }),
    };

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: { select: { matric_no: true, name: true } },
          course: { select: { course_code: true, title: true } },
        },
      }),
      prisma.enrollment.count({ where }),
    ]);

    return { enrollments, meta: buildMeta(total, page, limit) };
  }

  async enroll(studentId: number, courseId: number) {
    const student = await prisma.student.findUnique({ where: { student_id: studentId } });
    if (!student) throw new AppError('Student not found', 404);

    const course = await prisma.course.findUnique({ where: { course_id: courseId } });
    if (!course) throw new AppError('Course not found', 404);

    const existing = await prisma.enrollment.findUnique({
      where: { student_id_course_id: { student_id: studentId, course_id: courseId } },
    });
    if (existing) throw new AppError('Already enrolled in this course', 409);

    return prisma.enrollment.create({
      data: { student_id: studentId, course_id: courseId },
      include: {
        student: { select: { matric_no: true, name: true } },
        course: { select: { course_code: true, title: true } },
      },
    });
  }

  // Student self-enrolls using their user_id
  async selfEnroll(userId: number, courseId: number) {
    const student = await prisma.student.findUnique({ where: { user_id: userId } });
    if (!student) throw new AppError('Student profile not found', 404);
    return this.enroll(student.student_id, courseId);
  }

  // Student self-unenrolls using their user_id
  async selfUnenroll(userId: number, courseId: number) {
    const student = await prisma.student.findUnique({ where: { user_id: userId } });
    if (!student) throw new AppError('Student profile not found', 404);

    const enrollment = await prisma.enrollment.findUnique({
      where: { student_id_course_id: { student_id: student.student_id, course_id: courseId } },
    });
    if (!enrollment) throw new AppError('You are not enrolled in this course', 404);

    await prisma.enrollment.delete({ where: { enrollment_id: enrollment.enrollment_id } });
    return { message: 'Unenrolled successfully' };
  }

  // Get all courses with enrollment status for a student
  async getAvailableCourses(userId: number) {
    const student = await prisma.student.findUnique({ where: { user_id: userId } });
    if (!student) throw new AppError('Student profile not found', 404);

    const [courses, enrollments] = await Promise.all([
      prisma.course.findMany({
        include: {
          lecturer: { select: { name: true, email: true } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { course_code: 'asc' },
      }),
      prisma.enrollment.findMany({
        where: { student_id: student.student_id },
        select: { course_id: true },
      }),
    ]);

    const enrolledIds = new Set(enrollments.map((e) => e.course_id));

    return courses.map((c) => ({
      ...c,
      is_enrolled: enrolledIds.has(c.course_id),
    }));
  }

  async bulkEnroll(studentIds: number[], courseId: number) {
    const course = await prisma.course.findUnique({ where: { course_id: courseId } });
    if (!course) throw new AppError('Course not found', 404);

    const results = await Promise.allSettled(
      studentIds.map((id) => this.enroll(id, courseId))
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { succeeded, failed, total: studentIds.length };
  }

  async unenroll(enrollmentId: number) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { enrollment_id: enrollmentId },
    });
    if (!enrollment) throw new AppError('Enrollment not found', 404);

    await prisma.enrollment.delete({ where: { enrollment_id: enrollmentId } });
    return { message: 'Student unenrolled successfully' };
  }
}
