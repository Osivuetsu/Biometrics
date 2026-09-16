import prisma from '../../../config/db';
import { hashPassword, comparePassword } from '../../../shared/utils/bcrypt';
import { signToken } from '../../../shared/utils/jwt';
import { AppError } from '../../../shared/middleware/errorHandler';
import { Role } from '../../../shared/constants/roles';

interface RegisterInput {
  username: string;
  password: string;
  role: Role;
}

interface LoginInput {
  username: string;
  password: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { username: input.username },
    });

    if (existing) {
      throw new AppError('Username already exists', 409);
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        username: input.username,
        password: hashedPassword,
        role: input.role,
      },
      select: {
        user_id: true,
        username: true,
        role: true,
        created_at: true,
      },
    });

    const token = signToken({
      userId: user.user_id,
      username: user.username,
      role: user.role as Role,
    });

    return { user, token };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { username: input.username },
    });

    if (!user) {
      throw new AppError('Invalid username or password', 401);
    }

    const passwordMatch = await comparePassword(input.password, user.password);

    if (!passwordMatch) {
      throw new AppError('Invalid username or password', 401);
    }

    const token = signToken({
      userId: user.user_id,
      username: user.username,
      role: user.role as Role,
    });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        username: true,
        role: true,
        created_at: true,
        student: {
          select: {
            student_id: true,
            matric_no: true,
            name: true,
            department: true,
            level: true,
          },
        },
        lecturer: {
          select: {
            lecturer_id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const passwordMatch = await comparePassword(currentPassword, user.password);
    if (!passwordMatch) throw new AppError('Current password is incorrect', 401);

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { user_id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }
}
