import prisma from '../../../config/db';
import { Role } from '../../../shared/constants/roles';

export class DashboardService {
  async getAdminDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      totalLecturers,
      totalCourses,
      totalEnrollments,
      todayAttendance,
      recentAttendance,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.lecturer.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.attendance.count({ where: { timestamp: { gte: today } } }),
      prisma.attendance.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          student: { select: { name: true, matric_no: true } },
          course: { select: { course_code: true, title: true } },
        },
      }),
    ]);

    return {
      stats: { totalStudents, totalLecturers, totalCourses, totalEnrollments, todayAttendance },
      recentAttendance,
    };
  }

  async getLecturerDashboard(lecturerId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lecturer = await prisma.lecturer.findUnique({
      where: { user_id: lecturerId },
      include: {
        courses: {
          include: {
            _count: { select: { enrollments: true } },
            attendance: {
              where: { timestamp: { gte: today } },
              select: { attendance_id: true },
            },
          },
        },
      },
    });

    if (!lecturer) return { courses: [], stats: {} };

    const totalStudents = await prisma.enrollment.count({
      where: { course_id: { in: lecturer.courses.map((c) => c.course_id) } },
    });

    return {
      lecturer: { name: lecturer.name, email: lecturer.email },
      stats: {
        totalCourses: lecturer.courses.length,
        totalStudents,
        todayAttendance: lecturer.courses.reduce(
          (sum, c) => sum + c.attendance.length, 0
        ),
      },
      courses: lecturer.courses.map((c) => ({
        course_id: c.course_id,
        course_code: c.course_code,
        title: c.title,
        enrolled: c._count.enrollments,
        today_attendance: c.attendance.length,
      })),
    };
  }

  async getStudentDashboard(userId: number) {
    const student = await prisma.student.findUnique({
      where: { user_id: userId },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                lecturer: { select: { name: true } },
              },
            },
          },
        },
        attendance: {
          where: { verification_status: 'VERIFIED' },
          orderBy: { timestamp: 'desc' },
          take: 5,
          include: {
            course: { select: { course_code: true, title: true } },
          },
        },
      },
    });

    if (!student) return {};

    return {
      student: {
        name: student.name,
        matric_no: student.matric_no,
        department: student.department,
        level: student.level,
      },
      stats: {
        totalCourses: student.enrollments.length,
        totalAttendance: student.attendance.length,
      },
      courses: student.enrollments.map((e) => ({
        course_id: e.course.course_id,
        course_code: e.course.course_code,
        title: e.course.title,
        lecturer: e.course.lecturer.name,
      })),
      recentAttendance: student.attendance,
    };
  }
}
