// import { Response, NextFunction } from 'express';
// import { EnrollmentService } from '../services/enrollment.service';
// import { AuthRequest } from '../../../shared/middleware/auth.middleware';
// import { sendSuccess } from '../../../shared/utils/response';

// const enrollmentService = new EnrollmentService();

// export class EnrollmentController {
//   async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
//     try {
//       const result = await enrollmentService.getAll(req);
//       sendSuccess(res, 'Enrollments retrieved', result.enrollments, 200, result.meta);
//     } catch (error) { next(error); }
//   }

//   async enroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
//     try {
//       const { student_id, course_id } = req.body;
//       const enrollment = await enrollmentService.enroll(student_id, course_id);
//       sendSuccess(res, 'Student enrolled successfully', enrollment, 201);
//     } catch (error) { next(error); }
//   }

//   async bulkEnroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
//     try {
//       const { student_ids, course_id } = req.body;
//       const result = await enrollmentService.bulkEnroll(student_ids, course_id);
//       sendSuccess(res, `Bulk enrollment: ${result.succeeded} succeeded, ${result.failed} failed`, result);
//     } catch (error) { next(error); }
//   }

//   async unenroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
//     try {
//       const result = await enrollmentService.unenroll(parseInt(req.params.id));
//       sendSuccess(res, result.message);
//     } catch (error) { next(error); }
//   }
// }


import { Response, NextFunction } from 'express';
import { EnrollmentService } from '../services/enrollment.service';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { sendSuccess } from '../../../shared/utils/response';

const enrollmentService = new EnrollmentService();

export class EnrollmentController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await enrollmentService.getAll(req);
      sendSuccess(res, 'Enrollments retrieved', result.enrollments, 200, result.meta);
    } catch (error) { next(error); }
  }

  async enroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { student_id, course_id } = req.body;
      const enrollment = await enrollmentService.enroll(student_id, course_id);
      sendSuccess(res, 'Student enrolled successfully', enrollment, 201);
    } catch (error) { next(error); }
  }

  async bulkEnroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { student_ids, course_id } = req.body;
      const result = await enrollmentService.bulkEnroll(student_ids, course_id);
      sendSuccess(res, `Bulk enrollment: ${result.succeeded} succeeded, ${result.failed} failed`, result);
    } catch (error) { next(error); }
  }

  async unenroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await enrollmentService.unenroll(parseInt(req.params.id));
      sendSuccess(res, result.message);
    } catch (error) { next(error); }
  }

  // Student self-enrollment
  async selfEnroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { course_id } = req.body;
      const enrollment = await enrollmentService.selfEnroll(req.user!.userId, course_id);
      sendSuccess(res, 'Enrolled successfully', enrollment, 201);
    } catch (error) { next(error); }
  }

  async selfUnenroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { course_id } = req.params;
      const result = await enrollmentService.selfUnenroll(req.user!.userId, parseInt(course_id));
      sendSuccess(res, result.message);
    } catch (error) { next(error); }
  }

  async getAvailableCourses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const courses = await enrollmentService.getAvailableCourses(req.user!.userId);
      sendSuccess(res, 'Available courses retrieved', courses);
    } catch (error) { next(error); }
  }
}
