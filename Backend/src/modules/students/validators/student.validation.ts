import { body, param } from 'express-validator';

export const createStudentValidator = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('matric_no').trim().notEmpty().withMessage('Matric number is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('level')
    .isInt({ min: 100, max: 900 })
    .withMessage('Level must be a valid year (e.g. 100, 200...)'),
];

export const updateStudentValidator = [
  param('id').isInt().withMessage('Student ID must be an integer'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('level')
    .optional()
    .isInt({ min: 100, max: 900 })
    .withMessage('Level must be valid'),
];

export const studentIdValidator = [
  param('id').isInt().withMessage('Student ID must be an integer'),
];
