// import { Router } from 'express';
// import { CourseController } from '../controllers/course.controller';
// import { authenticate } from '../../../shared/middleware/auth.middleware';
// import { authorize } from '../../../shared/middleware/role.middleware';
// import { validate } from '../../../shared/middleware/validation.middleware';
// import { createCourseValidator, updateCourseValidator, courseIdValidator } from '../validators/course.validation';
// import { Role } from '../../../shared/constants/roles';

// const router = Router();
// const courseController = new CourseController();

// router.use(authenticate);

// router.get('/', authorize(Role.ADMIN, Role.LECTURER, Role.STUDENT), courseController.getAll.bind(courseController));
// router.get('/:id', authorize(Role.ADMIN, Role.LECTURER, Role.STUDENT), courseIdValidator, validate, courseController.getById.bind(courseController));
// router.post('/', authorize(Role.ADMIN), createCourseValidator, validate, courseController.create.bind(courseController));
// router.patch('/:id', authorize(Role.ADMIN), updateCourseValidator, validate, courseController.update.bind(courseController));
// router.delete('/:id', authorize(Role.ADMIN), courseIdValidator, validate, courseController.delete.bind(courseController));

// export default router;


import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { authorize } from '../../../shared/middleware/role.middleware';
import { validate } from '../../../shared/middleware/validation.middleware';
import { createCourseValidator, updateCourseValidator, courseIdValidator } from '../validators/course.validation';
import { Role } from '../../../shared/constants/roles';

const router = Router();
const courseController = new CourseController();

router.use(authenticate);

// Student gets only their enrolled courses
router.get('/my-courses', authorize(Role.STUDENT), courseController.getEnrolled.bind(courseController));

// Admin and Lecturer see all courses
router.get('/', authorize(Role.ADMIN, Role.LECTURER), courseController.getAll.bind(courseController));
router.get('/:id', authorize(Role.ADMIN, Role.LECTURER, Role.STUDENT), courseIdValidator, validate, courseController.getById.bind(courseController));
router.post('/', authorize(Role.ADMIN), createCourseValidator, validate, courseController.create.bind(courseController));
router.patch('/:id', authorize(Role.ADMIN), updateCourseValidator, validate, courseController.update.bind(courseController));
router.delete('/:id', authorize(Role.ADMIN), courseIdValidator, validate, courseController.delete.bind(courseController));

export default router;
