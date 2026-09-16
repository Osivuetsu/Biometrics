// import { Response, NextFunction } from 'express';
// import { CourseService } from '../services/course.service';
// import { AuthRequest } from '../../../shared/middleware/auth.middleware';
// import { sendSuccess } from '../../../shared/utils/response';

// const courseService = new CourseService();

// export class CourseController {
//   async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
//     try {
//       const result = await courseService.getAll(req);
//       sendSuccess(res, 'Courses retrieved', result.courses, 200, result.meta);
//     } catch (error) { next(error); }
//   }

//   async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
//     try {
//       const course = await courseService.getById(parseInt(req.params.id));
//       sendSuccess(res, 'Course retrieved', course);
//     } catch (error) { next(error); }
//   }

//   async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
//     try {
//       const course = await courseService.create(req.body);
//       sendSuccess(res, 'Course created successfully', course, 201);
//     } catch (error) { next(error); }
//   }

//   async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
//     try {
//       const course = await courseService.update(parseInt(req.params.id), req.body);
//       sendSuccess(res, 'Course updated successfully', course);
//     } catch (error) { next(error); }
//   }

//   async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
//     try {
//       const result = await courseService.delete(parseInt(req.params.id));
//       sendSuccess(res, result.message);
//     } catch (error) { next(error); }
//   }
// }


import { Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { sendSuccess } from '../../../shared/utils/response';

const courseService = new CourseService();

export class CourseController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await courseService.getAll(req);
      sendSuccess(res, 'Courses retrieved', result.courses, 200, result.meta);
    } catch (error) { next(error); }
  }

  async getEnrolled(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const courses = await courseService.getEnrolledCourses(req.user!.userId);
      sendSuccess(res, 'Enrolled courses retrieved', courses);
    } catch (error) { next(error); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.getById(parseInt(req.params.id));
      sendSuccess(res, 'Course retrieved', course);
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.create(req.body);
      sendSuccess(res, 'Course created successfully', course, 201);
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.update(parseInt(req.params.id), req.body);
      sendSuccess(res, 'Course updated successfully', course);
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await courseService.delete(parseInt(req.params.id));
      sendSuccess(res, result.message);
    } catch (error) { next(error); }
  }
}

