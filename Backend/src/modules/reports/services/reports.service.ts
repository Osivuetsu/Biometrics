import prisma from '../../../config/db';
import { AppError } from '../../../shared/middleware/errorHandler';

export class ReportsService {
  async getAttendanceReport(courseId: number, dateFrom?: Date, dateTo?: Date) {
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
      include: { lecturer: { select: { name: true } } },
    });
    if (!course) throw new AppError('Course not found', 404);

    const dateFilter = (dateFrom || dateTo) ? {
      timestamp: {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      },
    } : {};

    const enrollments = await prisma.enrollment.findMany({
      where: { course_id: courseId },
      include: {
        student: {
          include: {
            attendance: {
              where: { course_id: courseId, ...dateFilter },
              orderBy: { timestamp: 'desc' },
            },
          },
        },
      },
    });

    const totalClasses = await prisma.attendance.groupBy({
      by: ['course_id'],
      where: { course_id: courseId, ...dateFilter },
      _count: { attendance_id: true },
    });

    const report = enrollments.map(({ student }) => {
      const verified = student.attendance.filter(
        (a) => a.verification_status === 'VERIFIED'
      ).length;
      const total = student.attendance.length;
      const percentage = total > 0 ? ((verified / total) * 100).toFixed(1) : '0';

      return {
        student_id: student.student_id,
        matric_no: student.matric_no,
        name: student.name,
        department: student.department,
        total_records: total,
        verified_attendance: verified,
        attendance_percentage: `${percentage}%`,
      };
    });

    return {
      course: {
        course_id: course.course_id,
        course_code: course.course_code,
        title: course.title,
        lecturer: course.lecturer.name,
      },
      total_enrolled: enrollments.length,
      report,
    };
  }

  async getDepartmentReport(department: string) {
    const students = await prisma.student.findMany({
      where: { department },
      include: {
        attendance: {
          where: { verification_status: 'VERIFIED' },
        },
        enrollments: true,
      },
    });

    if (!students.length) throw new AppError('No students found for this department', 404);

    return {
      department,
      total_students: students.length,
      students: students.map((s) => ({
        student_id: s.student_id,
        matric_no: s.matric_no,
        name: s.name,
        level: s.level,
        total_courses: s.enrollments.length,
        total_attendance: s.attendance.length,
      })),
    };
  }

  async getLowAttendanceReport(courseId: number, threshold: number = 75) {
    const report = await this.getAttendanceReport(courseId);
    const lowAttendance = report.report.filter(
      (s) => parseFloat(s.attendance_percentage) < threshold
    );
    return { course: report.course, threshold: `${threshold}%`, students: lowAttendance };
  }
}
