import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { WorkflowService } from '../services/workflow/workflowService';
import { WorkflowGroupService } from '../services/workflow/workflowGroupService';
import { WorkflowExecutionService } from '../services/workflow/workflowExecutionService';
import { createTestWorkflow, createTestWorkflowGroup, createComplexWorkflow } from './helpers/workflow.helper';
import { createTestFormData, createTestWorkflowInstance, createTestTask, createComplexWorkflowInstance, createComplexTask } from './helpers/execution.helper';
import { ApiError } from '../utils/ApiError';
import { IWorkflow } from '../models/Workflow';
import { IWorkflowGroup } from '../models/WorkflowGroup';
import { IWorkflowInstance, InstanceStatus } from '../models/WorkflowInstance';
import { ITask, TaskStatus, TaskType } from '../models/Task';

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

describe('Workflow Execution Tests', () => {
  const userId = new Types.ObjectId().toString();
  let assigneeId: string;
  let workflowId: string;
  let workflowInstanceId: string;
  let taskId: string;

  beforeAll(async () => {
    // Create workflow group and workflow first
    const groupData = createTestWorkflowGroup();
    const group = (await WorkflowGroupService.create(groupData, userId)) as IWorkflowGroup & { _id: Types.ObjectId };
    const workflowData = createTestWorkflow(group._id.toString());
    const workflow = (await WorkflowService.create(workflowData, userId)) as IWorkflow & { _id: Types.ObjectId };
    workflowId = workflow._id.toString();
    // Get the assignee ID from the workflow
    assigneeId = workflow.nodeConfig.childNode?.assignees?.[0].rid || '';
  });

  describe('Basic Workflow Execution', () => {
    test('should start a workflow instance', async () => {
      const formData = createTestFormData();
      const instance = (await WorkflowExecutionService.startWorkflow(workflowId, formData, userId)) as IWorkflowInstance & { _id: Types.ObjectId };
      
      expect(instance.workflowId.toString()).toBe(workflowId);
      expect(instance.status).toBe(InstanceStatus.RUNNING);
      expect(instance.initiatorId.toString()).toBe(userId);
      expect(instance.formData).toMatchObject(formData);
      
      workflowInstanceId = instance._id.toString();
    });

    test('should create initial task', async () => {
      // Wait a bit for task creation
      await new Promise(resolve => setTimeout(resolve, 100));
      const tasks = await WorkflowExecutionService.getTasks(workflowInstanceId);
      expect(tasks.length).toBe(1);
      
      const task = tasks[0] as ITask & { _id: Types.ObjectId };
      expect(task.workflowInstanceId.toString()).toBe(workflowInstanceId);
      expect(task.type).toBe(TaskType.APPROVAL);
      expect(task.status).toBe(TaskStatus.PENDING);
      expect(task.assignees[0].userId.toString()).toBe(assigneeId);
      
      taskId = task._id.toString();
    });

    test('should approve task', async () => {
      const task = await WorkflowExecutionService.approveTask(taskId, 'Approved', assigneeId);
      expect(task.status).toBe(TaskStatus.APPROVED);
      expect(task.assignees[0].status).toBe(TaskStatus.APPROVED);
      expect(task.assignees[0].comment).toBe('Approved');
    });

    test('should complete workflow instance', async () => {
      // Wait a bit for the async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      const instance = await WorkflowExecutionService.getInstanceById(workflowInstanceId);
      expect(instance.status).toBe(InstanceStatus.COMPLETED);
    });
  });

  describe('Complex Workflow Execution', () => {
    let complexInstanceId: string;
    let vpTaskId: string;
    let managerAssigneeId: string;
    let vpAssigneeId: string;

    beforeAll(async () => {
      // Create a new workflow for complex tests
      const groupData = createTestWorkflowGroup();
      const group = (await WorkflowGroupService.create(groupData, userId)) as IWorkflowGroup & { _id: Types.ObjectId };
      const workflowData = createComplexWorkflow(group._id.toString());
      const workflow = (await WorkflowService.create(workflowData, userId)) as IWorkflow & { _id: Types.ObjectId };
      workflowId = workflow._id.toString();
      // Get assignee IDs
      managerAssigneeId = workflow.nodeConfig.childNode?.assignees?.[0].rid || '';
      vpAssigneeId = workflow.nodeConfig.childNode?.childNode?.assignees?.[0].rid || '';
    });

    test('should start complex workflow with multiple approvals', async () => {
      const formData = createComplexWorkflowInstance(workflowId, userId).formData;
      const instance = (await WorkflowExecutionService.startWorkflow(
        workflowId,
        formData,
        userId,
        { 
          priority: 1,
          variables: {
            totalAmount: 5000,
            requiresVP: true
          }
        }
      )) as IWorkflowInstance & { _id: Types.ObjectId };
      
      expect(instance.priority).toBe(1);
      expect(instance.variables).toMatchObject({
        totalAmount: 5000,
        requiresVP: true
      });
      
      complexInstanceId = instance._id.toString();
    });

    test('should create VP approval task after manager approval', async () => {
      // First approve manager task
      const managerTasks = await WorkflowExecutionService.getTasks(complexInstanceId);
      expect(managerTasks.length).toBe(1);
      const managerTask = managerTasks[0] as ITask & { _id: Types.ObjectId };
      expect(managerTask.assignees[0].userId.toString()).toBe(managerAssigneeId);
      await WorkflowExecutionService.approveTask(managerTask._id.toString(), 'Approved by manager', managerAssigneeId);

      // Wait a bit for the async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check VP task is created
      const vpTasks = await WorkflowExecutionService.getTasks(complexInstanceId);
      expect(vpTasks.length).toBe(1);
      
      const vpTask = vpTasks[0] as ITask & { _id: Types.ObjectId };
      expect(vpTask.nodeName).toBe('Department VP Approval');
      expect(vpTask.priority).toBe(1);
      expect(vpTask.assignees[0].userId.toString()).toBe(vpAssigneeId);
      
      vpTaskId = vpTask._id.toString();
    });

    test('should handle task rejection', async () => {
      const task = await WorkflowExecutionService.rejectTask(vpTaskId, 'Budget exceeded', vpAssigneeId);
      expect(task.status).toBe(TaskStatus.REJECTED);
      
      // Wait a bit for the async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      const instance = await WorkflowExecutionService.getInstanceById(complexInstanceId);
      expect(instance.status).toBe(InstanceStatus.REJECTED);
    });
  });

  describe('Task Management', () => {
    test('should list user tasks', async () => {
      const tasks = await WorkflowExecutionService.getUserTasks(assigneeId);
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0].assignees.some((a: { userId: mongoose.Types.ObjectId | string }) => a.userId.toString() === assigneeId)).toBe(true);
    });

    test('should add task comment', async () => {
      const comment = 'Please provide more details';
      const task = await WorkflowExecutionService.addTaskComment(taskId, comment, userId);
      expect(task.comments).toHaveLength(1);
      expect(task.comments[0].content).toBe(comment);
    });

    test('should reassign task', async () => {
      const newAssigneeId = new Types.ObjectId().toString();
      const task = await WorkflowExecutionService.reassignTask(taskId, newAssigneeId, userId);
      expect(task.assignees.some((a: { userId: mongoose.Types.ObjectId | string }) => a.userId.toString() === newAssigneeId)).toBe(true);
    });
  });

  describe('Workflow Instance Management', () => {
    test('should list user workflow instances', async () => {
      const instances = await WorkflowExecutionService.getUserInstances(userId);
      expect(instances.length).toBeGreaterThan(0);
      expect(instances[0].initiatorId.toString()).toBe(userId);
    });

    test('should cancel workflow instance', async () => {
      const instance = await WorkflowExecutionService.cancelInstance(workflowInstanceId, 'Cancelled by user', userId);
      expect(instance.status).toBe(InstanceStatus.CANCELED);
      
      const tasks = await WorkflowExecutionService.getTasks(workflowInstanceId);
      expect(tasks.every((t: ITask) => t.status === TaskStatus.CANCELED)).toBe(true);
    });
  });
}); 