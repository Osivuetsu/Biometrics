import { body, param, query } from 'express-validator';

export const markAttendanceValidator = [
  body('student_id').isInt().withMessage('Student ID must be an integer'),
  body('course_id').isInt().withMessage('Course ID must be an integer'),
  body('distance_score').optional().isFloat({ min: 0 }).withMessage('Distance score must be a positive number'),
  body('verification_status')
    .optional()
    .isIn(['VERIFIED', 'FAILED', 'PENDING'])
    .withMessage('Invalid verification status'),
];

export const attendanceQueryValidator = [
  query('course_id').optional().isInt(),
  query('student_id').optional().isInt(),
  query('date_from').optional().isISO8601(),
  query('date_to').optional().isISO8601(),
];

export const attendanceIdValidator = [
  param('id').isInt().withMessage('Attendance ID must be an integer'),
];
