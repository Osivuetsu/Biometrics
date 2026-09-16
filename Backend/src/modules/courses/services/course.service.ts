// import prisma from '../../../config/db';
// import { AppError } from '../../../shared/middleware/errorHandler';
// import { getPagination, buildMeta } from '../../../shared/utils/pagination';
// import { Request } from 'express';

// interface CreateCourseInput {
//   course_code: string;
//   title: string;
//   lecturer_id: number;
// }

// interface UpdateCourseInput {
//   title?: string;
//   lecturer_id?: number;
// }

// export class CourseService {
//   async getAll(req: Request) {
//     const { page, limit, skip } = getPagination(req);
//     const search = req.query.search as string | undefined;
//     const lecturerId = req.query.lecturer_id ? parseInt(req.query.lecturer_id as string) : undefined;

//     const where = {
//       ...(lecturerId && { lecturer_id: lecturerId }),
//       ...(search && {
//         OR: [
//           { title: { contains: search } },
//           { course_code: { contains: search } },
//         ],
//       }),
//     };

//     const [courses, total] = await Promise.all([
//       prisma.course.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { course_id: 'asc' },
//         include: {
//           lecturer: { select: { name: true, email: true } },
//           _count: { select: { enrollments: true } },
//         },
//       }),
//       prisma.course.count({ where }),
//     ]);

//     return { courses, meta: buildMeta(total, page, limit) };
//   }

//   async getById(id: number) {
//     const course = await prisma.course.findUnique({
//       where: { course_id: id },
//       include: {
//         lecturer: { select: { name: true, email: true } },
//         enrollments: {
//           include: {
//             student: { select: { matric_no: true, name: true, department: true } },
//           },
//         },
//       },
//     });
//     if (!course) throw new AppError('Course not found', 404);
//     return course;
//   }

//   async create(input: CreateCourseInput) {
//     const lecturer = await prisma.lecturer.findUnique({ where: { lecturer_id: input.lecturer_id } });
//     if (!lecturer) throw new AppError('Lecturer not found', 404);

//     return prisma.course.create({
//       data: input,
//       include: { lecturer: { select: { name: true } } },
//     });
//   }

//   async update(id: number, input: UpdateCourseInput) {
//     await this.getById(id);
//     if (input.lecturer_id) {
//       const lecturer = await prisma.lecturer.findUnique({ where: { lecturer_id: input.lecturer_id } });
//       if (!lecturer) throw new AppError('Lecturer not found', 404);
//     }
//     return prisma.course.update({
//       where: { course_id: id },
//       data: input,
//       include: { lecturer: { select: { name: true } } },
//     });
//   }

//   async delete(id: number) {
//     await this.getById(id);
//     await prisma.course.delete({ where: { course_id: id } });
//     return { message: 'Course deleted successfully' };
//   }
// }

import prisma from '../../../config/db';
import { AppError } from '../../../shared/middleware/errorHandler';
import { getPagination, buildMeta } from '../../../shared/utils/pagination';
import { Request } from 'express';

interface CreateCourseInput {
  course_code: string;
  title: string;
  lecturer_id: number;
}

interface UpdateCourseInput {
  title?: string;
  lecturer_id?: number;
}

export class CourseService {
  async getAll(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const search = req.query.search as string | undefined;
    const lecturerId = req.query.lecturer_id ? parseInt(req.query.lecturer_id as string) : undefined;

    const where = {
      ...(lecturerId && { lecturer_id: lecturerId }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { course_code: { contains: search } },
        ],
      }),
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { course_id: 'asc' },
        include: {
          lecturer: { select: { name: true, email: true } },
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    return { courses, meta: buildMeta(total, page, limit) };
  }

  // Only courses a specific student is enrolled in
  async getEnrolledCourses(userId: number) {
    const student = await prisma.student.findUnique({
      where: { user_id: userId },
      select: { student_id: true },
    });

    if (!student) throw new AppError('Student not found', 404);

    const enrollments = await prisma.enrollment.findMany({
      where: { student_id: student.student_id },
      include: {
        course: {
          include: {
            lecturer: { select: { name: true, email: true } },
            _count: { select: { enrollments: true } },
          },
        },
      },
    });

    return enrollments.map((e) => e.course);
  }

  async getById(id: number) {
    const course = await prisma.course.findUnique({
      where: { course_id: id },
      include: {
        lecturer: { select: { name: true, email: true } },
        enrollments: {
          include: {
            student: { select: { matric_no: true, name: true, department: true } },
          },
        },
      },
    });
    if (!course) throw new AppError('Course not found', 404);
    return course;
  }

  async create(input: CreateCourseInput) {
    const lecturer = await prisma.lecturer.findUnique({ where: { lecturer_id: input.lecturer_id } });
    if (!lecturer) throw new AppError('Lecturer not found', 404);

    return prisma.course.create({
      data: input,
      include: { lecturer: { select: { name: true } } },
    });
  }

  async update(id: number, input: UpdateCourseInput) {
    await this.getById(id);
    if (input.lecturer_id) {
      const lecturer = await prisma.lecturer.findUnique({ where: { lecturer_id: input.lecturer_id } });
      if (!lecturer) throw new AppError('Lecturer not found', 404);
    }
    return prisma.course.update({
      where: { course_id: id },
      data: input,
      include: { lecturer: { select: { name: true } } },
    });
  }

  async delete(id: number) {
    await this.getById(id);
    await prisma.course.delete({ where: { course_id: id } });
    return { message: 'Course deleted successfully' };
  }
}

