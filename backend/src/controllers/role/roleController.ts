import { Request, Response } from 'express';
import { RoleService } from '../../services/role/roleService';
import { ApiError } from '../../utils/ApiError';

export class RoleController {
  static async create(req: Request, res: Response) {
    try {
      const role = await RoleService.create(req.body);
      res.status(201).json(role);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const role = await RoleService.getById(req.params.id);
      res.json(role);
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
      const role = await RoleService.update(req.params.id, req.body);
      res.json(role);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await RoleService.delete(req.params.id);
      res.status(204).send();
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
      const roles = await RoleService.getAll(req.query);
      res.json(roles);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async assignToUser(req: Request, res: Response) {
    try {
      const { userId, roleIds } = req.body;
      const user = await RoleService.assignToUser(userId, roleIds);
      res.json(user);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async removeFromUser(req: Request, res: Response) {
    try {
      const { userId, roleIds } = req.body;
      const user = await RoleService.removeFromUser(userId, roleIds);
      res.json(user);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 