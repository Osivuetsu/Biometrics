import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { sendSuccess } from '../../../shared/utils/response';
import { Role } from '../../../shared/constants/roles';

const dashboardService = new DashboardService();

export class DashboardController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, userId } = req.user!;
      let data;

      if (role === Role.ADMIN) {
        data = await dashboardService.getAdminDashboard();
      } else if (role === Role.LECTURER) {
        data = await dashboardService.getLecturerDashboard(userId);
      } else {
        data = await dashboardService.getStudentDashboard(userId);
      }

      sendSuccess(res, 'Dashboard data retrieved', data);
    } catch (error) {
      next(error);
    }
  }
}
