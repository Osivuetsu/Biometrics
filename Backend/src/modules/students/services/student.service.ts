import prisma from '../../../config/db';
import { hashPassword } from '../../../shared/utils/bcrypt';
import { AppError } from '../../../shared/middleware/errorHandler';
import { getPagination, buildMeta } from '../../../shared/utils/pagination';
import { Request } from 'express';

interface CreateStudentInput {
  username: string;
  password: string;
  matric_no: string;
  name: string;
  department: string;
  level: number;
}

interface UpdateStudentInput {
  name?: string;
  department?: string;
  level?: number;
}

export class StudentService {
  async getAll(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const search = req.query.search as string | undefined;

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { matric_no: { contains: search } },
            { department: { contains: search } },
          ],
        }
      : {};

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { student_id: 'asc' },
        include: {
          user: { select: { username: true, role: true } },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return { students, meta: buildMeta(total, page, limit) };
  }

  async getById(id: number) {
    const student = await prisma.student.findUnique({
      where: { student_id: id },
      include: {
        user: { select: { username: true, role: true, created_at: true } },
        enrollments: {
          include: {
            course: { select: { course_code: true, title: true } },
          },
        },
      },
    });

    if (!student) throw new AppError('Student not found', 404);
    return student;
  }

  async create(input: CreateStudentInput) {
    const hashedPassword = await hashPassword(input.password);

    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: input.username,
          password: hashedPassword,
          role: 'STUDENT',
        },
      });

      return tx.student.create({
        data: {
          user_id: user.user_id,
          matric_no: input.matric_no,
          name: input.name,
          department: input.department,
          level: input.level,
        },
        include: {
          user: { select: { username: true, role: true } },
        },
      });
    });

    return student;
  }

  async update(id: number, input: UpdateStudentInput) {
    await this.getById(id);

    return prisma.student.update({
      where: { student_id: id },
      data: input,
      include: {
        user: { select: { username: true, role: true } },
      },
    });
  }

  async delete(id: number) {
    await this.getById(id);
    // Deleting user cascades to student due to prisma schema
    const student = await prisma.student.findUnique({ where: { student_id: id } });
    await prisma.user.delete({ where: { user_id: student!.user_id } });
    return { message: 'Student deleted successfully' };
  }

  async getAttendance(studentId: number, req: Request) {
    await this.getById(studentId);
    const { page, limit, skip } = getPagination(req);
    const courseId = req.query.course_id ? parseInt(req.query.course_id as string) : undefined;

    const where = {
      student_id: studentId,
      ...(courseId && { course_id: courseId }),
    };

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          course: { select: { course_code: true, title: true } },
        },
      }),
      prisma.attendance.count({ where }),
    ]);

    return { records, meta: buildMeta(total, page, limit) };
  }
}
