import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import mongoose from 'mongoose';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  // Log error
  console.error(err);

  // Handle known errors
  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.statusCode, err.message, err.details);
  }

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    return ApiResponse.badRequest(res, 'Validation error', details);
  }

  // Handle Mongoose cast errors (invalid IDs)
  if (err instanceof mongoose.Error.CastError) {
    return ApiResponse.badRequest(res, `Invalid ${err.path}: ${err.value}`);
  }

  // Handle duplicate key errors
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return ApiResponse.badRequest(res, `${field} already exists`);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token expired');
  }

  // Handle other errors
  return ApiResponse.internalError(
    res,
    'An unexpected error occurred',
    process.env.NODE_ENV === 'development' ? err : undefined
  );
}

// Handle 404 errors for undefined routes
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  return ApiResponse.notFound(res, `Route ${req.method} ${req.path} not found`);
}

// Handle async errors
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
} 