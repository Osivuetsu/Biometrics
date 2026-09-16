import { Router } from 'express';
import { LecturerController } from '../controllers/lecturer.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { authorize } from '../../../shared/middleware/role.middleware';
import { validate } from '../../../shared/middleware/validation.middleware';
import { createLecturerValidator, updateLecturerValidator, lecturerIdValidator } from '../validators/lecturer.validation';
import { Role } from '../../../shared/constants/roles';

const router = Router();
const lecturerController = new LecturerController();

router.use(authenticate);

router.get('/', authorize(Role.ADMIN), lecturerController.getAll.bind(lecturerController));
router.get('/:id', authorize(Role.ADMIN), lecturerIdValidator, validate, lecturerController.getById.bind(lecturerController));
router.post('/', authorize(Role.ADMIN), createLecturerValidator, validate, lecturerController.create.bind(lecturerController));
router.patch('/:id', authorize(Role.ADMIN), updateLecturerValidator, validate, lecturerController.update.bind(lecturerController));
router.delete('/:id', authorize(Role.ADMIN), lecturerIdValidator, validate, lecturerController.delete.bind(lecturerController));

export default router;
