import { Request, Response } from 'express';
import { FormService } from '../../services/form/formService';
import { ApiError } from '../../utils/ApiError';

export class FormController {
  static async create(req: Request, res: Response) {
    try {
      const form = await FormService.create(req.body, req.user.id);
      res.status(201).json(form);
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
      const form = await FormService.update(req.params.id, req.body, req.user.id);
      res.json(form);
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
      await FormService.delete(req.params.id);
      res.status(204).send();
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
      const form = await FormService.getById(req.params.id);
      res.json(form);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getByWorkflow(req: Request, res: Response) {
    try {
      const forms = await FormService.getByWorkflow(req.params.workflowId);
      res.json(forms);
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
      const forms = await FormService.getAll(req.query);
      res.json(forms);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 