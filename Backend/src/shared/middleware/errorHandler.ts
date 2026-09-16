import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger';
import { sendError } from '../utils/response';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack });

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Prisma unique constraint violation
  if ((err as { code?: string }).code === 'P2002') {
    sendError(res, 'A record with this value already exists', 409);
    return;
  }

  // Prisma record not found
  if ((err as { code?: string }).code === 'P2025') {
    sendError(res, 'Record not found', 404);
    return;
  }

  sendError(res, 'Internal server error', 500);
};

export const notFound = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};
