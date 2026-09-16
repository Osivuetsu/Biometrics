import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { authorize } from '../../../shared/middleware/role.middleware';
import { validate } from '../../../shared/middleware/validation.middleware';
import {
  createStudentValidator,
  updateStudentValidator,
  studentIdValidator,
} from '../validators/student.validation';
import { Role } from '../../../shared/constants/roles';

const router = Router();
const studentController = new StudentController();

router.use(authenticate);

router.get('/', authorize(Role.ADMIN, Role.LECTURER), studentController.getAll.bind(studentController));
router.get('/my-attendance', authorize(Role.STUDENT), studentController.getAttendance.bind(studentController));
router.get('/:id', authorize(Role.ADMIN, Role.LECTURER), studentIdValidator, validate, studentController.getById.bind(studentController));
router.get('/:id/attendance', authorize(Role.ADMIN, Role.LECTURER), studentIdValidator, validate, studentController.getAttendance.bind(studentController));
router.post('/', authorize(Role.ADMIN), createStudentValidator, validate, studentController.create.bind(studentController));
router.patch('/:id', authorize(Role.ADMIN), updateStudentValidator, validate, studentController.update.bind(studentController));
router.delete('/:id', authorize(Role.ADMIN), studentIdValidator, validate, studentController.delete.bind(studentController));

export default router;
