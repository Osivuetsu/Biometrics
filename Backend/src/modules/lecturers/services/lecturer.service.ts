import prisma from '../../../config/db';
import { hashPassword } from '../../../shared/utils/bcrypt';
import { AppError } from '../../../shared/middleware/errorHandler';
import { getPagination, buildMeta } from '../../../shared/utils/pagination';
import { Request } from 'express';

interface CreateLecturerInput {
  username: string;
  password: string;
  name: string;
  email: string;
}

interface UpdateLecturerInput {
  name?: string;
  email?: string;
}

export class LecturerService {
  async getAll(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const search = req.query.search as string | undefined;

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    const [lecturers, total] = await Promise.all([
      prisma.lecturer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lecturer_id: 'asc' },
        include: {
          user: { select: { username: true } },
          courses: { select: { course_code: true, title: true } },
        },
      }),
      prisma.lecturer.count({ where }),
    ]);

    return { lecturers, meta: buildMeta(total, page, limit) };
  }

  async getById(id: number) {
    const lecturer = await prisma.lecturer.findUnique({
      where: { lecturer_id: id },
      include: {
        user: { select: { username: true } },
        courses: true,
      },
    });
    if (!lecturer) throw new AppError('Lecturer not found', 404);
    return lecturer;
  }

  async create(input: CreateLecturerInput) {
    const hashedPassword = await hashPassword(input.password);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: input.username,
          password: hashedPassword,
          role: 'LECTURER',
        },
      });

      return tx.lecturer.create({
        data: {
          user_id: user.user_id,
          name: input.name,
          email: input.email,
        },
        include: {
          user: { select: { username: true, role: true } },
        },
      });
    });
  }

  async update(id: number, input: UpdateLecturerInput) {
    await this.getById(id);
    return prisma.lecturer.update({
      where: { lecturer_id: id },
      data: input,
    });
  }

  async delete(id: number) {
    const lecturer = await this.getById(id);
    await prisma.user.delete({ where: { user_id: lecturer.user_id } });
    return { message: 'Lecturer deleted successfully' };
  }
}
