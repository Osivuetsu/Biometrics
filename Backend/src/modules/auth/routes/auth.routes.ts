import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { validate } from '../../../shared/middleware/validation.middleware';
import {
  loginValidator,
  registerValidator,
  changePasswordValidator,
} from '../validators/auth.validation';

const router = Router();
const authController = new AuthController();

router.post('/register', registerValidator, validate, authController.register.bind(authController));
router.post('/login', loginValidator, validate, authController.login.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));
router.patch('/change-password', authenticate, changePasswordValidator, validate, authController.changePassword.bind(authController));

export default router;
