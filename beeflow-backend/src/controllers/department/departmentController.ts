import { Request, Response } from 'express';
import { DepartmentService } from '../../services/department/departmentService';
import { ApiError } from '../../utils/ApiError';

export class DepartmentController {
  static async create(req: Request, res: Response) {
    try {
      const department = await DepartmentService.create(req.body);
      res.status(201).json(department);
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
      const department = await DepartmentService.getById(req.params.id);
      res.json(department);
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
      const department = await DepartmentService.update(req.params.id, req.body);
      res.json(department);
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
      await DepartmentService.delete(req.params.id);
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
      const departments = await DepartmentService.getAll(req.query);
      res.json(departments);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getHierarchy(req: Request, res: Response) {
    try {
      const hierarchy = await DepartmentService.getHierarchy();
      res.json(hierarchy);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 