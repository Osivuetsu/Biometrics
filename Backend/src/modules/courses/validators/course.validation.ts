import { body, param } from 'express-validator';

export const createCourseValidator = [
  body('course_code').trim().notEmpty().withMessage('Course code is required'),
  body('title').trim().notEmpty().withMessage('Course title is required'),
  body('lecturer_id').isInt().withMessage('Lecturer ID must be an integer'),
];

export const updateCourseValidator = [
  param('id').isInt().withMessage('Course ID must be an integer'),
  body('title').optional().trim().notEmpty(),
  body('lecturer_id').optional().isInt(),
];

export const courseIdValidator = [
  param('id').isInt().withMessage('Course ID must be an integer'),
];
