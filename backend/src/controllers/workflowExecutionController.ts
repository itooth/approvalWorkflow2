import { Request, Response } from 'express';
import { WorkflowDefinition } from '../models/WorkflowDefinition';
import { successResponse, errorResponse, messageResponse } from '../utils/response';

export class WorkflowExecutionController {
  // Workflow instance management
  async viewProcessChart(req: Request, res: Response) {
    try {
      const { flowDefId } = req.body;
      const definition = await WorkflowDefinition.findById(flowDefId);
      if (!definition) {
        return res.status(404).json(errorResponse('Workflow definition not found'));
      }
      res.json(successResponse({
        nodeConfig: definition.nodeConfig
      }));
    } catch (error) {
      res.status(500).json(errorResponse('Error viewing process chart'));
    }
  }

  async flowStart(req: Request, res: Response) {
    try {
      const { flowDefId, formData } = req.body;
      const definition = await WorkflowDefinition.findById(flowDefId);
      if (!definition) {
        return res.status(404).json(errorResponse('Workflow definition not found'));
      }
      // For MVP, we'll just create a simple workflow instance
      const instance = {
        id: Date.now().toString(),
        flowDefId,
        formData,
        status: 'RUNNING',
        createdBy: req.user?.id,
        createdAt: new Date()
      };
      res.json(successResponse(instance));
    } catch (error) {
      res.status(500).json(errorResponse('Error starting workflow'));
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.query;
      // For MVP, return mock data
      const instance = {
        id,
        status: 'RUNNING',
        currentNode: 'APPROVAL_1',
        formData: {}
      };
      res.json(successResponse(instance));
    } catch (error) {
      res.status(500).json(errorResponse('Error fetching workflow instance'));
    }
  }

  async getForm(req: Request, res: Response) {
    try {
      const { flowDefId } = req.query;
      const definition = await WorkflowDefinition.findById(flowDefId);
      if (!definition) {
        return res.status(404).json(errorResponse('Workflow definition not found'));
      }
      res.json(successResponse({
        flowWidgets: definition.flowWidgets
      }));
    } catch (error) {
      res.status(500).json(errorResponse('Error fetching form'));
    }
  }

  async getDetail(req: Request, res: Response) {
    try {
      const { id } = req.query;
      // For MVP, return mock data
      const detail = {
        id,
        status: 'RUNNING',
        currentNode: 'APPROVAL_1',
        formData: {},
        history: []
      };
      res.json(successResponse(detail));
    } catch (error) {
      res.status(500).json(errorResponse('Error fetching workflow details'));
    }
  }

  // Task management
  async listTasks(req: Request, res: Response) {
    try {
      const { page = 1, size = 10 } = req.body;
      // For MVP, return mock data
      const tasks = Array(size).fill(null).map((_, i) => ({
        id: i + 1,
        title: `Task ${i + 1}`,
        status: 'PENDING',
        createdAt: new Date()
      }));
      res.json(successResponse({
        list: tasks,
        total: 100,
        page,
        size
      }));
    } catch (error) {
      res.status(500).json(errorResponse('Error listing tasks'));
    }
  }

  async listMineFlowInsts(req: Request, res: Response) {
    try {
      const { page = 1, size = 10 } = req.body;
      // For MVP, return mock data
      const instances = Array(size).fill(null).map((_, i) => ({
        id: i + 1,
        title: `Workflow ${i + 1}`,
        status: 'RUNNING',
        createdAt: new Date()
      }));
      res.json(successResponse({
        list: instances,
        total: 100,
        page,
        size
      }));
    } catch (error) {
      res.status(500).json(errorResponse('Error listing workflow instances'));
    }
  }

  async listMineFlowInstCcs(req: Request, res: Response) {
    try {
      const { page = 1, size = 10 } = req.body;
      // For MVP, return mock data
      const ccs = Array(size).fill(null).map((_, i) => ({
        id: i + 1,
        title: `CC ${i + 1}`,
        status: 'PENDING',
        createdAt: new Date()
      }));
      res.json(successResponse({
        list: ccs,
        total: 100,
        page,
        size
      }));
    } catch (error) {
      res.status(500).json(errorResponse('Error listing CC records'));
    }
  }

  async listMineAuditRecords(req: Request, res: Response) {
    try {
      const { page = 1, size = 10 } = req.body;
      // For MVP, return mock data
      const records = Array(size).fill(null).map((_, i) => ({
        id: i + 1,
        title: `Audit ${i + 1}`,
        action: 'APPROVE',
        createdAt: new Date()
      }));
      res.json(successResponse({
        list: records,
        total: 100,
        page,
        size
      }));
    } catch (error) {
      res.status(500).json(errorResponse('Error listing audit records'));
    }
  }

  async listFlowInsts(req: Request, res: Response) {
    try {
      const { page = 1, size = 10 } = req.body;
      // For MVP, return mock data
      const instances = Array(size).fill(null).map((_, i) => ({
        id: i + 1,
        title: `Instance ${i + 1}`,
        status: 'RUNNING',
        createdAt: new Date()
      }));
      res.json(successResponse({
        list: instances,
        total: 100,
        page,
        size
      }));
    } catch (error) {
      res.status(500).json(errorResponse('Error listing flow instances'));
    }
  }

  // Task actions
  async approve(req: Request, res: Response) {
    try {
      const { taskId, comment } = req.body;
      // For MVP, just return success
      res.json(messageResponse('Task approved successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('Error approving task'));
    }
  }

  async reject(req: Request, res: Response) {
    try {
      const { taskId, comment } = req.body;
      // For MVP, just return success
      res.json(messageResponse('Task rejected successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('Error rejecting task'));
    }
  }

  async transact(req: Request, res: Response) {
    try {
      const { taskId, data } = req.body;
      // For MVP, just return success
      res.json(messageResponse('Task processed successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('Error processing task'));
    }
  }
} 