import { Response, NextFunction } from 'express';
import { ReportsService } from '../services/reports.service';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { sendSuccess } from '../../../shared/utils/response';

const reportsService = new ReportsService();

export class ReportsController {
  async getAttendanceReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = parseInt(req.params.courseId);
      const dateFrom = req.query.date_from ? new Date(req.query.date_from as string) : undefined;
      const dateTo = req.query.date_to ? new Date(req.query.date_to as string) : undefined;
      const report = await reportsService.getAttendanceReport(courseId, dateFrom, dateTo);
      sendSuccess(res, 'Attendance report generated', report);
    } catch (error) { next(error); }
  }

  async getDepartmentReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await reportsService.getDepartmentReport(req.params.department);
      sendSuccess(res, 'Department report generated', report);
    } catch (error) { next(error); }
  }

  async getLowAttendanceReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = parseInt(req.params.courseId);
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 75;
      const report = await reportsService.getLowAttendanceReport(courseId, threshold);
      sendSuccess(res, 'Low attendance report generated', report);
    } catch (error) { next(error); }
  }
}
