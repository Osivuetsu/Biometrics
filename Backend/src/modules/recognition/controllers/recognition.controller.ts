import { Response, NextFunction } from 'express';
import { RecognitionService } from '../services/recognition.service';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { sendSuccess } from '../../../shared/utils/response';

const recognitionService = new RecognitionService();

export class RecognitionController {

  async wakeEngine(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await recognitionService.wakeEngine();
      sendSuccess(res, 'Biometric engine is ready');
    } catch (error) {
      next(error);
    }
  }

  async enrollFace(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { student_id, image } = req.body;
      const result = await recognitionService.enrollFace(student_id, image);
      sendSuccess(res, result.message, result, 201);
    } catch (error) { next(error); }
  }

  async enrollFaceMulti(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { student_id, images } = req.body;
      const result = await recognitionService.enrollFaceMulti(student_id, images);
      sendSuccess(res, `Face enrolled from ${result.images_used} images`, result, 201);
    } catch (error) { next(error); }
  }

  async recognizeFace(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { image, course_id } = req.body;
      const result = await recognitionService.recognizeFace(image, course_id);
      sendSuccess(res, result.matched ? 'Student recognized' : 'No match found', result);
    } catch (error) { next(error); }
  }

  async recognizeFaceConfirmed(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { images, course_id } = req.body;
      const result = await recognitionService.recognizeFaceConfirmed(images, course_id);
      sendSuccess(res, result.confirmed ? 'Identity confirmed' : result.message || 'Not confirmed', result);
    } catch (error) { next(error); }
  }

  async recognizeFaceMulti(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { image, course_id } = req.body;
      const result = await recognitionService.recognizeFaceMulti(image, course_id);
      sendSuccess(res, `Detected ${result.faces_detected} face(s), matched ${result.matched_count}`, result);
    } catch (error) { next(error); }
  }

  async verifyFace(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { student_id, image } = req.body;
      const result = await recognitionService.verifyFace(student_id, image);
      sendSuccess(res, 'Verification complete', result);
    } catch (error) { next(error); }
  }

  async deleteEmbedding(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await recognitionService.deleteEmbedding(parseInt(req.params.studentId));
      sendSuccess(res, result.message);
    } catch (error) { next(error); }
  }
}
