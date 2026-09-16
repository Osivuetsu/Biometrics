import { Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { sendSuccess } from '../../../shared/utils/response';

const studentService = new StudentService();

export class StudentController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await studentService.getAll(req);
      sendSuccess(res, 'Students retrieved', result.students, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.getById(parseInt(req.params.id));
      sendSuccess(res, 'Student retrieved', student);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.create(req.body);
      sendSuccess(res, 'Student created successfully', student, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.update(parseInt(req.params.id), req.body);
      sendSuccess(res, 'Student updated successfully', student);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await studentService.delete(parseInt(req.params.id));
      sendSuccess(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId =
        req.user?.role === 'STUDENT'
          ? (await import('../../../config/db').then((m) =>
              m.default.student.findUnique({
                where: { user_id: req.user!.userId },
                select: { student_id: true },
              })
            ).then((s) => s?.student_id!))
          : parseInt(req.params.id);

      const result = await studentService.getAttendance(studentId, req);
      sendSuccess(res, 'Attendance records retrieved', result.records, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
}
