import { WorkflowDefinition } from '../../models/WorkflowDefinition';
import { User } from '../../models/User';

interface WorkflowTask {
  id: string;
  nodeId: string;
  type: number;
  status: string;
  initiatorId?: string;
  assignees?: Array<{
    userId: string;
    type: number;
  }>;
}

export class WorkflowExecutionService {
  async executeWorkflow(workflowId: string, formData: any, userId: string) {
    try {
      const workflow = await WorkflowDefinition.findById(workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Create workflow instance
      const instance = {
        id: Date.now().toString(),
        workflowId,
        formData,
        status: 'RUNNING',
        currentNode: workflow.nodeConfig.id,
        initiator: userId,
        tasks: []
      };

      // Start first task
      await this.createTask(instance, workflow.nodeConfig, userId);

      return instance;
    } catch (error) {
      throw error;
    }
  }

  private async createTask(instance: any, node: any, userId: string) {
    const task: WorkflowTask = {
      id: Date.now().toString(),
      nodeId: node.id,
      type: node.type,
      status: 'PENDING',
      initiatorId: userId
    };

    if (node.type === 1) { // Approval node
      task.assignees = node.assignees?.map((assignee: any) => ({
        userId: assignee.id,
        type: assignee.type
      }));
    }

    instance.tasks.push(task);
    return task;
  }

  async getTaskAssignee(task: WorkflowTask) {
    try {
      const assigneeId = task.type === 1 
        ? task.assignees?.[0]?.userId || ''
        : task.initiatorId || '';

      if (!assigneeId) return null;

      const user = await User.findById(assigneeId);
      return user;
    } catch (error) {
      throw error;
    }
  }
} 