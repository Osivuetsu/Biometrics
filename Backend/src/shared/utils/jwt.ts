import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { Role } from '../constants/roles';

export interface JwtPayload {
  userId: number;
  username: string;
  role: Role;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
