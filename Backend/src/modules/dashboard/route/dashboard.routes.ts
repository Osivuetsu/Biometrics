import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate);
router.get('/', dashboardController.getDashboard.bind(dashboardController));

export default router;
