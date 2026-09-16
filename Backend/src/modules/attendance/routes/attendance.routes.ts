import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { authorize } from '../../../shared/middleware/role.middleware';
import { validate } from '../../../shared/middleware/validation.middleware';
import { markAttendanceValidator, attendanceIdValidator, attendanceQueryValidator } from '../validators/attendance.validation';
import { Role } from '../../../shared/constants/roles';

const router = Router();
const attendanceController = new AttendanceController();

router.use(authenticate);

router.get('/', authorize(Role.ADMIN, Role.LECTURER), attendanceQueryValidator, validate, attendanceController.getAll.bind(attendanceController));
router.post('/', authorize(Role.ADMIN, Role.LECTURER), markAttendanceValidator, validate, attendanceController.mark.bind(attendanceController));
router.get('/summary/:courseId', authorize(Role.ADMIN, Role.LECTURER), attendanceController.getSummary.bind(attendanceController));
router.get('/:id', authorize(Role.ADMIN, Role.LECTURER), attendanceIdValidator, validate, attendanceController.getById.bind(attendanceController));
router.delete('/:id', authorize(Role.ADMIN), attendanceIdValidator, validate, attendanceController.delete.bind(attendanceController));

export default router;
