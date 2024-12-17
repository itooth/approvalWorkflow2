import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { WorkflowService } from '../services/workflow/workflowService';
import { WorkflowGroupService } from '../services/workflow/workflowGroupService';
import { createTestWorkflow, createComplexWorkflow, createTestWorkflowGroup } from './helpers/workflow.helper';
import { ApiError } from '../utils/ApiError';
import { IWorkflow, NodeType } from '../models/Workflow';
import { IWorkflowGroup } from '../models/WorkflowGroup';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Workflow System Tests', () => {
  const userId = new Types.ObjectId().toString();
  let groupId: string;

  describe('Workflow Group Tests', () => {
    test('should create a workflow group', async () => {
      const groupData = createTestWorkflowGroup();
      const group = (await WorkflowGroupService.create(groupData, userId)) as IWorkflowGroup & { _id: Types.ObjectId };
      
      expect(group.name).toBe(groupData.name);
      expect(group.code).toBe(groupData.code);
      expect(group.createdBy.toString()).toBe(userId);
      
      groupId = group._id.toString();
    });

    test('should get workflow group by id', async () => {
      const group = (await WorkflowGroupService.getById(groupId)) as IWorkflowGroup & { _id: Types.ObjectId };
      expect(group._id.toString()).toBe(groupId);
    });

    test('should update workflow group', async () => {
      const updateData = { name: 'Updated Group' };
      const group = await WorkflowGroupService.update(groupId, updateData, userId);
      expect(group.name).toBe(updateData.name);
    });

    test('should list workflow groups', async () => {
      const groups = await WorkflowGroupService.getAll();
      expect(groups.length).toBeGreaterThan(0);
    });
  });

  describe('Workflow Tests', () => {
    let workflowId: string;

    test('should create a simple workflow', async () => {
      const workflowData = createTestWorkflow(groupId);
      const workflow = (await WorkflowService.create(workflowData, userId)) as IWorkflow & { _id: Types.ObjectId };
      
      expect(workflow.name).toBe(workflowData.name);
      expect(workflow.code).toBe(workflowData.code);
      expect(workflow.groupId.toString()).toBe(groupId);
      expect(workflow.createdBy.toString()).toBe(userId);
      
      workflowId = workflow._id.toString();
    });

    test('should create a complex workflow', async () => {
      const workflowData = createComplexWorkflow(groupId);
      const workflow = (await WorkflowService.create(workflowData, userId)) as IWorkflow;
      
      expect(workflow.name).toBe(workflowData.name);
      expect(workflow.nodeConfig?.childNode?.type).toBe(workflowData.nodeConfig.childNode.type);
    });

    test('should get workflow by id', async () => {
      const workflow = (await WorkflowService.getById(workflowId)) as IWorkflow & { _id: Types.ObjectId };
      expect(workflow._id.toString()).toBe(workflowId);
    });

    test('should update workflow', async () => {
      const updateData = { name: 'Updated Workflow' };
      const workflow = await WorkflowService.update(workflowId, updateData, userId);
      expect(workflow.name).toBe(updateData.name);
    });

    test('should list workflows', async () => {
      const workflows = await WorkflowService.getAll();
      expect(workflows.length).toBeGreaterThan(0);
    });

    test('should list workflows by group', async () => {
      const workflows = await WorkflowService.getByGroup(groupId);
      expect(workflows.length).toBeGreaterThan(0);
      expect((workflows[0].groupId as any)._id.toString()).toBe(groupId);
    });
  });

  describe('Workflow Validation Tests', () => {
    test('should reject workflow without initiator node', async () => {
      const invalidWorkflow = {
        ...createTestWorkflow(groupId),
        nodeConfig: {
          name: 'Invalid',
          type: NodeType.APPROVAL, // Not an initiator
          childNode: undefined
        }
      };

      await expect(WorkflowService.create(invalidWorkflow, userId))
        .rejects
        .toThrow('Root node must be an initiator node');
    });

    test('should reject approval node without assignees', async () => {
      const invalidWorkflow = {
        ...createTestWorkflow(groupId),
        nodeConfig: {
          name: 'Start',
          type: NodeType.INITIATOR,
          childNode: {
            name: 'Invalid Approval',
            type: NodeType.APPROVAL,
            assignees: [] // Empty assignees
          }
        }
      };

      await expect(WorkflowService.create(invalidWorkflow, userId))
        .rejects
        .toThrow('Approval node must have assignees');
    });

    test('should reject copy node without cc recipients', async () => {
      const invalidWorkflow = {
        ...createTestWorkflow(groupId),
        nodeConfig: {
          name: 'Start',
          type: NodeType.INITIATOR,
          childNode: {
            name: 'Invalid Copy',
            type: NodeType.COPY,
            ccs: [] // Empty ccs
          }
        }
      };

      await expect(WorkflowService.create(invalidWorkflow, userId))
        .rejects
        .toThrow('Copy node must have cc recipients');
    });

    test('should reject condition node without condition groups', async () => {
      const invalidWorkflow = {
        ...createTestWorkflow(groupId),
        nodeConfig: {
          name: 'Start',
          type: NodeType.INITIATOR,
          childNode: {
            name: 'Invalid Condition',
            type: NodeType.CONDITION,
            conditionGroups: [] // Empty condition groups
          }
        }
      };

      await expect(WorkflowService.create(invalidWorkflow, userId))
        .rejects
        .toThrow('Condition node must have condition groups');
    });

    test('should reject router node with duplicate priority levels', async () => {
      const invalidWorkflow = {
        ...createTestWorkflow(groupId),
        nodeConfig: {
          name: 'Start',
          type: NodeType.INITIATOR,
          childNode: {
            name: 'Router',
            type: NodeType.ROUTER,
            conditionNodes: [
              {
                name: 'Condition 1',
                type: NodeType.CONDITION,
                priorityLevel: 1,
                conditionGroups: [{ id: '1', conditions: [] }]
              },
              {
                name: 'Condition 2',
                type: NodeType.CONDITION,
                priorityLevel: 1, // Duplicate priority
                conditionGroups: [{ id: '2', conditions: [] }]
              }
            ]
          }
        }
      };

      await expect(WorkflowService.create(invalidWorkflow, userId))
        .rejects
        .toThrow('Condition nodes must have unique priority levels');
    });
  });
}); 