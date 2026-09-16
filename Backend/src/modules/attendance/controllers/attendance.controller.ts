import { Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { sendSuccess } from '../../../shared/utils/response';

const attendanceService = new AttendanceService();

export class AttendanceController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await attendanceService.getAll(req);
      sendSuccess(res, 'Attendance records retrieved', result.records, 200, result.meta);
    } catch (error) { next(error); }
  }

  async mark(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await attendanceService.mark(req.body);
      sendSuccess(res, 'Attendance marked successfully', record, 201);
    } catch (error) { next(error); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await attendanceService.getById(parseInt(req.params.id));
      sendSuccess(res, 'Attendance record retrieved', record);
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await attendanceService.delete(parseInt(req.params.id));
      sendSuccess(res, result.message);
    } catch (error) { next(error); }
  }

  async getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await attendanceService.getSummary(parseInt(req.params.courseId));
      sendSuccess(res, 'Attendance summary retrieved', summary);
    } catch (error) { next(error); }
  }
}
