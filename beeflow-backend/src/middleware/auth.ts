import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/authService';
import { ApiError } from '../utils/ApiError';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'No token provided');
    }

    const user = await AuthService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const hasRole = req.user.roles.some((role: string) => roles.includes(role));
    if (!hasRole) {
      throw new ApiError(403, 'Not authorized');
    }

    next();
  };
}; 