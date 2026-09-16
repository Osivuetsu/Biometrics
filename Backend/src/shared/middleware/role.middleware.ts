import { Response, NextFunction } from 'express';
import { Role } from '../constants/roles';
import { sendError } from '../utils/response';
import { AuthRequest } from './auth.middleware';

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'Forbidden: insufficient permissions', 403);
      return;
    }

    next();
  };
};
