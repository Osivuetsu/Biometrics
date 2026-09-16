import { body, param } from 'express-validator';

export const enrollValidator = [
  body('student_id').isInt().withMessage('Student ID must be an integer'),
  body('course_id').isInt().withMessage('Course ID must be an integer'),
];

export const enrollmentIdValidator = [
  param('id').isInt().withMessage('Enrollment ID must be an integer'),
];

export const bulkEnrollValidator = [
  body('student_ids').isArray({ min: 1 }).withMessage('student_ids must be a non-empty array'),
  body('student_ids.*').isInt().withMessage('Each student ID must be an integer'),
  body('course_id').isInt().withMessage('Course ID must be an integer'),
];
