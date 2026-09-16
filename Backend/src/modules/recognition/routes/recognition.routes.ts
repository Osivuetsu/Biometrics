import { Router } from 'express';
import { RecognitionController } from '../controllers/recognition.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { authorize } from '../../../shared/middleware/role.middleware';
import { body, param } from 'express-validator';
import { validate } from '../../../shared/middleware/validation.middleware';
import { Role } from '../../../shared/constants/roles';

const router = Router();
const c = new RecognitionController();
const imageValidator = [body('image').notEmpty().withMessage('Image (base64) is required')];
const imagesValidator = [body('images').isArray({ min: 1 }).withMessage('images array is required')];

router.use(authenticate);

router.post('/enroll', authorize(Role.ADMIN), [...imageValidator, body('student_id').isInt()], validate, c.enrollFace.bind(c));
router.post('/enroll/multi', authorize(Role.ADMIN), [...imagesValidator, body('student_id').isInt()], validate, c.enrollFaceMulti.bind(c));
router.post('/recognize', authorize(Role.ADMIN, Role.LECTURER), [...imageValidator, body('course_id').isInt()], validate, c.recognizeFace.bind(c));
router.post('/recognize/confirmed', authorize(Role.ADMIN, Role.LECTURER), [...imagesValidator, body('course_id').isInt()], validate, c.recognizeFaceConfirmed.bind(c));
router.post('/recognize/multi', authorize(Role.ADMIN, Role.LECTURER), [...imageValidator, body('course_id').isInt()], validate, c.recognizeFaceMulti.bind(c));
router.post('/verify', authorize(Role.ADMIN, Role.LECTURER), [...imageValidator, body('student_id').isInt()], validate, c.verifyFace.bind(c));
router.delete('/embeddings/:studentId', authorize(Role.ADMIN), [param('studentId').isInt()], validate, c.deleteEmbedding.bind(c));

export default router;
