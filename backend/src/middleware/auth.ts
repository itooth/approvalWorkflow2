import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const auth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Please authenticate'
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Please authenticate'
    });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
      return;
    }

    const hasRole = req.user.roles.some((role: string) => roles.includes(role));
    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
      return;
    }

    next();
  };
}; 