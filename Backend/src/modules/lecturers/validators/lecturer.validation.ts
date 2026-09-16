import { body, param } from 'express-validator';

export const createLecturerValidator = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const updateLecturerValidator = [
  param('id').isInt().withMessage('Lecturer ID must be an integer'),
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
];

export const lecturerIdValidator = [
  param('id').isInt().withMessage('Lecturer ID must be an integer'),
];
