// import { Router } from 'express';
// import { EnrollmentController } from '../controllers/enrollment.controller';
// import { authenticate } from '../../../shared/middleware/auth.middleware';
// import { authorize } from '../../../shared/middleware/role.middleware';
// import { validate } from '../../../shared/middleware/validation.middleware';
// import { enrollValidator, enrollmentIdValidator, bulkEnrollValidator } from '../validators/enrollment.validation';
// import { Role } from '../../../shared/constants/roles';

// const router = Router();
// const enrollmentController = new EnrollmentController();

// router.use(authenticate);

// router.get('/', authorize(Role.ADMIN, Role.LECTURER), enrollmentController.getAll.bind(enrollmentController));
// router.post('/', authorize(Role.ADMIN), enrollValidator, validate, enrollmentController.enroll.bind(enrollmentController));
// router.post('/bulk', authorize(Role.ADMIN), bulkEnrollValidator, validate, enrollmentController.bulkEnroll.bind(enrollmentController));
// router.delete('/:id', authorize(Role.ADMIN), enrollmentIdValidator, validate, enrollmentController.unenroll.bind(enrollmentController));

// export default router;



import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { authorize } from '../../../shared/middleware/role.middleware';
import { validate } from '../../../shared/middleware/validation.middleware';
import { enrollValidator, enrollmentIdValidator, bulkEnrollValidator } from '../validators/enrollment.validation';
import { body, param } from 'express-validator';
import { Role } from '../../../shared/constants/roles';

const router = Router();
const enrollmentController = new EnrollmentController();

router.use(authenticate);

// Student self-enrollment routes
router.get('/available', authorize(Role.STUDENT), enrollmentController.getAvailableCourses.bind(enrollmentController));
router.post('/self', authorize(Role.STUDENT), [body('course_id').isInt()], validate, enrollmentController.selfEnroll.bind(enrollmentController));
router.delete('/self/:course_id', authorize(Role.STUDENT), [param('course_id').isInt()], validate, enrollmentController.selfUnenroll.bind(enrollmentController));

// Admin enrollment routes
router.get('/', authorize(Role.ADMIN, Role.LECTURER), enrollmentController.getAll.bind(enrollmentController));
router.post('/', authorize(Role.ADMIN), enrollValidator, validate, enrollmentController.enroll.bind(enrollmentController));
router.post('/bulk', authorize(Role.ADMIN), bulkEnrollValidator, validate, enrollmentController.bulkEnroll.bind(enrollmentController));
router.delete('/:id', authorize(Role.ADMIN), enrollmentIdValidator, validate, enrollmentController.unenroll.bind(enrollmentController));

export default router;
