import { Request, Response } from 'express';
import { WorkflowService } from '../../services/workflow/workflowService';
import { WorkflowGroupService } from '../../services/workflow/workflowGroupService';
import { ApiError } from '../../utils/ApiError';

export class WorkflowController {
  // Workflow endpoints
  static async createWorkflow(req: Request, res: Response) {
    try {
      const workflow = await WorkflowService.create(req.body, req.user.id);
      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async updateWorkflow(req: Request, res: Response) {
    try {
      const workflow = await WorkflowService.update(req.params.id, req.body, req.user.id);
      res.json(workflow);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async deleteWorkflow(req: Request, res: Response) {
    try {
      await WorkflowService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getWorkflow(req: Request, res: Response) {
    try {
      const workflow = await WorkflowService.getById(req.params.id);
      res.json(workflow);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getAllWorkflows(req: Request, res: Response) {
    try {
      const workflows = await WorkflowService.getAll(req.query);
      res.json(workflows);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getWorkflowsByGroup(req: Request, res: Response) {
    try {
      const workflows = await WorkflowService.getByGroup(req.params.groupId);
      res.json(workflows);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  // Workflow Group endpoints
  static async createGroup(req: Request, res: Response) {
    try {
      const group = await WorkflowGroupService.create(req.body, req.user.id);
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async updateGroup(req: Request, res: Response) {
    try {
      const group = await WorkflowGroupService.update(req.params.id, req.body, req.user.id);
      res.json(group);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async deleteGroup(req: Request, res: Response) {
    try {
      await WorkflowGroupService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getGroup(req: Request, res: Response) {
    try {
      const group = await WorkflowGroupService.getById(req.params.id);
      res.json(group);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getAllGroups(req: Request, res: Response) {
    try {
      const groups = await WorkflowGroupService.getAll(req.query);
      res.json(groups);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async reorderGroups(req: Request, res: Response) {
    try {
      await WorkflowGroupService.reorder(req.body.groupIds);
      res.status(204).send();
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 