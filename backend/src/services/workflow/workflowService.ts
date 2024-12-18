import { Workflow, IWorkflow, NodeType, INode, AssigneeType } from '../../models/Workflow';
import { WorkflowGroup } from '../../models/WorkflowGroup';
import { ApiError } from '../../utils/ApiError';
import mongoose from 'mongoose';

export class WorkflowService {
  static async create(workflowData: Partial<IWorkflow>, userId: string) {
    // Validate workflow group exists
    const group = await WorkflowGroup.findById(workflowData.groupId);
    if (!group) {
      throw new ApiError(404, 'Workflow group not found');
    }

    // Validate node configuration
    if (!workflowData.nodeConfig) {
      throw new ApiError(400, 'Node configuration is required');
    }
    this.validateNodeConfig(workflowData.nodeConfig);

    // Set created/updated by
    workflowData.createdBy = userId;
    workflowData.updatedBy = userId;

    const workflow = new Workflow(workflowData);
    await workflow.save();
    return workflow;
  }

  static async update(id: string, updateData: Partial<IWorkflow>, userId: string) {
    // If updating group, validate it exists
    if (updateData.groupId) {
      const group = await WorkflowGroup.findById(updateData.groupId);
      if (!group) {
        throw new ApiError(404, 'Workflow group not found');
      }
    }

    // If updating node config, validate it
    if (updateData.nodeConfig) {
      this.validateNodeConfig(updateData.nodeConfig);
    }

    // Set updated by
    updateData.updatedBy = userId;

    const workflow = await Workflow.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!workflow) {
      throw new ApiError(404, 'Workflow not found');
    }
    return workflow;
  }

  static async delete(id: string) {
    const workflow = await Workflow.findByIdAndDelete(id);
    if (!workflow) {
      throw new ApiError(404, 'Workflow not found');
    }
    return workflow;
  }

  static async getById(id: string) {
    const workflow = await Workflow.findById(id)
      .populate('groupId', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!workflow) {
      throw new ApiError(404, 'Workflow not found');
    }
    return workflow;
  }

  static async getAll(query: any = {}) {
    const workflows = await Workflow.find({ ...query, active: true })
      .populate('groupId', 'name')
      .sort({ createdAt: -1 });
    return workflows;
  }

  static async getByGroup(groupId: string) {
    const workflows = await Workflow.find({ groupId, active: true })
      .populate('groupId', 'name')
      .sort({ createdAt: -1 });
    return workflows;
  }

  private static validateNodeConfig(nodeConfig: INode) {
    if (!nodeConfig) {
      throw new ApiError(400, 'Node configuration is required');
    }

    // Validate initiator node
    if (nodeConfig.type !== NodeType.INITIATOR) {
      throw new ApiError(400, 'Root node must be an initiator node');
    }

    // Recursively validate node structure
    this.validateNode(nodeConfig);
  }

  private static validateNode(node: INode) {
    // Validate required fields
    if (!node.name || !node.type || !Object.values(NodeType).includes(node.type)) {
      throw new ApiError(400, 'Node name and type are required');
    }

    // Validate node type specific requirements
    switch (node.type) {
      case NodeType.APPROVAL:
        if (!node.assignees || node.assignees.length === 0) {
          throw new ApiError(400, 'Approval node must have assignees');
        }
        // Validate assignee types
        node.assignees.forEach(assignee => {
          if (!Object.values(AssigneeType).includes(assignee.assigneeType)) {
            throw new ApiError(400, 'Invalid assignee type');
          }
          // Validate layer and layerType for superior/leader types
          if ([AssigneeType.DEPARTMENT_LEADER, AssigneeType.SUPERIOR].includes(assignee.assigneeType)) {
            if (typeof assignee.layer !== 'number' || typeof assignee.layerType !== 'number') {
              throw new ApiError(400, 'Layer and layerType are required for superior/leader assignees');
            }
          }
          // Validate assignees array for specific users type
          if (assignee.assigneeType === AssigneeType.SPECIFIC_USERS) {
            if (!assignee.assignees || assignee.assignees.length === 0) {
              throw new ApiError(400, 'Specific users assignee type must have assignees list');
            }
          }
        });
        break;

      case NodeType.COPY:
        if (!node.ccs || node.ccs.length === 0) {
          throw new ApiError(400, 'Copy node must have cc recipients');
        }
        // Validate cc types
        node.ccs.forEach(cc => {
          if (!Object.values(AssigneeType).includes(cc.assigneeType)) {
            throw new ApiError(400, 'Invalid cc recipient type');
          }
        });
        break;

      case NodeType.CONDITION:
        if (!node.conditionGroups || node.conditionGroups.length === 0) {
          throw new ApiError(400, 'Condition node must have condition groups');
        }
        // Validate condition groups
        node.conditionGroups.forEach(group => {
          if (!group.conditions || group.conditions.length === 0) {
            throw new ApiError(400, 'Condition group must have conditions');
          }
        });
        break;

      case NodeType.ROUTER:
        if (!node.conditionNodes || node.conditionNodes.length === 0) {
          throw new ApiError(400, 'Router node must have condition nodes');
        }
        // Validate priority levels
        const priorities = node.conditionNodes.map(n => n.priorityLevel);
        if (new Set(priorities).size !== priorities.length) {
          throw new ApiError(400, 'Condition nodes must have unique priority levels');
        }
        break;
    }

    // Recursively validate child nodes
    if (node.childNode) {
      this.validateNode(node.childNode);
    }
    if (node.conditionNodes) {
      node.conditionNodes.forEach(childNode => this.validateNode(childNode));
    }
  }
} 