import { Request, Response } from 'express';
import { UserService } from '../../services/user/userService';
import { ApiError } from '../../utils/ApiError';

export class UserController {
  static async getById(req: Request, res: Response) {
    try {
      const user = await UserService.getById(req.params.id);
      res.json(user);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const user = await UserService.update(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async assignToDepartment(req: Request, res: Response) {
    try {
      const { userId, departmentId } = req.body;
      const user = await UserService.assignToDepartment(userId, departmentId);
      res.json(user);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async removeFromDepartment(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const user = await UserService.removeFromDepartment(userId);
      res.json(user);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getUsersByDepartment(req: Request, res: Response) {
    try {
      const users = await UserService.getUsersByDepartment(req.params.departmentId);
      res.json(users);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getUsersInDepartmentHierarchy(req: Request, res: Response) {
    try {
      const users = await UserService.getUsersInDepartmentHierarchy(req.params.departmentId);
      res.json(users);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const users = await UserService.getAll(req.query);
      res.json(users);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 