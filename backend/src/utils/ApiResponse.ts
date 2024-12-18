import { Response } from 'express';

export interface ApiResponseData<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
}

export class ApiResponse {
  static success<T>(res: Response, data: T, meta?: ApiResponseData<T>['meta']): Response {
    const response: ApiResponseData<T> = {
      success: true,
      data,
      meta
    };
    return res.json(response);
  }

  static error(
    res: Response,
    code: number,
    message: string,
    details?: any
  ): Response {
    const response: ApiResponseData<null> = {
      success: false,
      error: {
        code,
        message,
        details
      }
    };
    return res.status(code).json(response);
  }

  static list<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): Response {
    const response: ApiResponseData<T[]> = {
      success: true,
      data,
      meta: {
        page,
        limit,
        total
      }
    };
    return res.json(response);
  }

  static created<T>(res: Response, data: T): Response {
    const response: ApiResponseData<T> = {
      success: true,
      data
    };
    return res.status(201).json(response);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static badRequest(res: Response, message: string, details?: any): Response {
    return this.error(res, 400, message, details);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, 401, message);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, 403, message);
  }

  static notFound(res: Response, message: string = 'Not found'): Response {
    return this.error(res, 404, message);
  }

  static internalError(
    res: Response,
    message: string = 'Internal server error',
    details?: any
  ): Response {
    return this.error(res, 500, message, details);
  }
} 