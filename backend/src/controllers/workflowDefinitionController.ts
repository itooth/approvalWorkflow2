import { Response } from 'express';
import { WorkflowDefinition } from '../models/WorkflowDefinition';
import { successResponse, errorResponse, messageResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class WorkflowDefinitionController {
  // Group management
  async listGroups(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const groups = await WorkflowDefinition.aggregate([
        { $group: { _id: "$workFlowDef.groupId", name: { $first: "$workFlowDef.groupName" } } }
      ]);
      res.json(successResponse(groups));
    } catch (error) {
      res.status(500).json(errorResponse('Error fetching groups'));
    }
  }

  async listGroupsWithFlowDefinition(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const groups = await WorkflowDefinition.aggregate([
        {
          $group: {
            _id: "$workFlowDef.groupId",
            name: { $first: "$workFlowDef.groupName" },
            definitions: { $push: { id: "$_id", name: "$workFlowDef.name" } }
          }
        }
      ]);
      res.json(successResponse(groups));
    } catch (error) {
      res.status(500).json(errorResponse('Error fetching groups with definitions'));
    }
  }

  async listGroupsWithEnabledFlowDefinition(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const groups = await WorkflowDefinition.aggregate([
        { $match: { "workFlowDef.enabled": true } },
        {
          $group: {
            _id: "$workFlowDef.groupId",
            name: { $first: "$workFlowDef.groupName" },
            definitions: { $push: { id: "$_id", name: "$workFlowDef.name" } }
          }
        }
      ]);
      res.json(successResponse(groups));
    } catch (error) {
      res.status(500).json(errorResponse('Error fetching enabled groups'));
    }
  }

  async saveOrUpdateGroup(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const { id, name } = req.body;
      if (id) {
        await WorkflowDefinition.updateMany(
          { "workFlowDef.groupId": id },
          { $set: { "workFlowDef.groupName": name } }
        );
      }
      res.json(messageResponse('Group saved successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('Error saving group'));
    }
  }

  async deleteGroup(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const { id } = req.query;
      await WorkflowDefinition.deleteMany({ "workFlowDef.groupId": id });
      res.json(messageResponse('Group deleted successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('Error deleting group'));
    }
  }

  // Flow definition management
  async listFlowDefinitions(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const definitions = await WorkflowDefinition.find({}, { workFlowDef: 1 });
      res.json(successResponse(definitions));
    } catch (error) {
      res.status(500).json(errorResponse('Error fetching definitions'));
    }
  }

  async getFlowConfig(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const { id } = req.query;
      const definition = await WorkflowDefinition.findById(id);
      if (!definition) {
        return res.status(404).json(errorResponse('Definition not found'));
      }
      res.json(successResponse({
        flowDefId: definition._id,
        flowDefJson: JSON.stringify({
          nodeConfig: definition.nodeConfig,
          flowWidgets: definition.flowWidgets,
          workFlowDef: definition.workFlowDef,
          flowPermission: definition.flowPermission
        })
      }));
    } catch (error) {
      res.status(500).json(errorResponse('Error fetching flow config'));
    }
  }

  async saveOrUpdate(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const flowData = req.body;
      if (flowData.workFlowDef.id) {
        await WorkflowDefinition.findByIdAndUpdate(
          flowData.workFlowDef.id,
          flowData
        );
      } else {
        await WorkflowDefinition.create(flowData);
      }
      res.json(messageResponse('Flow definition saved successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('Error saving flow definition'));
    }
  }

  async copy(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const { id } = req.body;
      const original = await WorkflowDefinition.findById(id);
      if (!original) {
        return res.status(404).json(errorResponse('Original definition not found'));
      }
      const copy = new WorkflowDefinition({
        ...original.toObject(),
        _id: undefined,
        workFlowDef: {
          ...original.workFlowDef,
          name: `${original.workFlowDef.name} (Copy)`
        }
      });
      await copy.save();
      res.json(messageResponse('Flow definition copied successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('Error copying flow definition'));
    }
  }

  async removeById(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const { id } = req.query;
      await WorkflowDefinition.findByIdAndDelete(id);
      res.json(messageResponse('Flow definition deleted successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('Error deleting flow definition'));
    }
  }

  async freezeById(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const { id } = req.query;
      await WorkflowDefinition.findByIdAndUpdate(id, {
        'workFlowDef.enabled': false
      });
      res.json(messageResponse('Flow definition frozen successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('Error freezing flow definition'));
    }
  }

  async enableById(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const { id } = req.query;
      await WorkflowDefinition.findByIdAndUpdate(id, {
        'workFlowDef.enabled': true
      });
      res.json(messageResponse('Flow definition enabled successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('Error enabling flow definition'));
    }
  }

  async getFlowFormWidget(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const { id } = req.query;
      const definition = await WorkflowDefinition.findById(id);
      if (!definition) {
        return res.status(404).json(errorResponse('Definition not found'));
      }
      res.json(successResponse(definition.flowWidgets));
    } catch (error) {
      res.status(500).json(errorResponse('Error fetching form widgets'));
    }
  }
} 