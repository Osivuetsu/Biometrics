import { Response, NextFunction } from 'express';
import { LecturerService } from '../services/lecturer.service';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { sendSuccess } from '../../../shared/utils/response';

const lecturerService = new LecturerService();

export class LecturerController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await lecturerService.getAll(req);
      sendSuccess(res, 'Lecturers retrieved', result.lecturers, 200, result.meta);
    } catch (error) { next(error); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const lecturer = await lecturerService.getById(parseInt(req.params.id));
      sendSuccess(res, 'Lecturer retrieved', lecturer);
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const lecturer = await lecturerService.create(req.body);
      sendSuccess(res, 'Lecturer created successfully', lecturer, 201);
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const lecturer = await lecturerService.update(parseInt(req.params.id), req.body);
      sendSuccess(res, 'Lecturer updated successfully', lecturer);
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await lecturerService.delete(parseInt(req.params.id));
      sendSuccess(res, result.message);
    } catch (error) { next(error); }
  }
}
