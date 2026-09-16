import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { authorize } from '../../../shared/middleware/role.middleware';
import { Role } from '../../../shared/constants/roles';

const router = Router();
const reportsController = new ReportsController();

router.use(authenticate);
router.use(authorize(Role.ADMIN, Role.LECTURER));

router.get('/attendance/:courseId', reportsController.getAttendanceReport.bind(reportsController));
router.get('/department/:department', reportsController.getDepartmentReport.bind(reportsController));
router.get('/low-attendance/:courseId', reportsController.getLowAttendanceReport.bind(reportsController));

export default router;
