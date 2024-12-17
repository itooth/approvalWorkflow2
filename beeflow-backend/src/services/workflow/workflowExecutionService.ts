import { Workflow, IWorkflow, NodeType, INode, AssigneeType } from '../../models/Workflow';
import { WorkflowInstance, IWorkflowInstance, InstanceStatus } from '../../models/WorkflowInstance';
import { Task, ITask, TaskStatus, TaskType } from '../../models/Task';
import { ApiError } from '../../utils/ApiError';
import mongoose from 'mongoose';

interface StartWorkflowOptions {
  priority?: number;
  dueDate?: Date;
  variables?: { [key: string]: any };
}

export class WorkflowExecutionService {
  static async startWorkflow(
    workflowId: string,
    formData: any,
    userId: string,
    options: StartWorkflowOptions = {}
  ): Promise<IWorkflowInstance> {
    // Get workflow definition
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      throw new ApiError(404, 'Workflow not found');
    }

    // Create workflow instance
    const instance = new WorkflowInstance({
      workflowId: new mongoose.Types.ObjectId(workflowId),
      workflowVersion: workflow.version,
      title: formData.title || workflow.name,
      initiatorId: new mongoose.Types.ObjectId(userId),
      currentNodeId: workflow.nodeConfig.name,
      formData,
      variables: options.variables || {},
      priority: options.priority || 0,
      dueDate: options.dueDate,
      status: InstanceStatus.RUNNING,
      createdBy: new mongoose.Types.ObjectId(userId),
      updatedBy: new mongoose.Types.ObjectId(userId)
    });

    await instance.save();

    // Create initial task
    await this.createNextTask(instance, workflow, userId);

    // Return populated instance
    const populatedInstance = await WorkflowInstance.findById(instance._id)
      .populate('workflowId', 'name')
      .populate('initiatorId', 'name');

    if (!populatedInstance) {
      throw new ApiError(500, 'Failed to create workflow instance');
    }

    return populatedInstance;
  }

  static async getTasks(workflowInstanceId: string): Promise<ITask[]> {
    return Task.find({
      workflowInstanceId: new mongoose.Types.ObjectId(workflowInstanceId),
      status: TaskStatus.PENDING
    })
    .populate('assignees.userId', 'name')
    .populate('initiatorId', 'name')
    .sort({ priority: -1, createdAt: 1 });
  }

  static async approveTask(taskId: string, comment: string, userId: string): Promise<ITask> {
    const task = await Task.findById(taskId)
      .populate('assignees.userId', 'name')
      .populate('initiatorId', 'name');

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Validate user is assignee
    const assignee = task.assignees.find(a => a.userId.toString() === userId);
    if (!assignee) {
      throw new ApiError(403, 'User is not an assignee of this task');
    }

    // Update assignee status
    assignee.status = TaskStatus.APPROVED;
    assignee.comment = comment;
    assignee.handledAt = new Date();

    // Check if all assignees have approved
    const allApproved = task.assignees.every(a => a.status === TaskStatus.APPROVED);
    if (allApproved) {
      task.status = TaskStatus.APPROVED;
      task.updatedBy = new mongoose.Types.ObjectId(userId);
      await task.save();
      
      // Handle task completion after saving task
      try {
        await this.handleTaskCompletion(task);
      } catch (error) {
        console.error('Error handling task completion:', error);
        throw error;
      }
    } else {
      task.updatedBy = new mongoose.Types.ObjectId(userId);
      await task.save();
    }

    return task;
  }

  static async rejectTask(taskId: string, comment: string, userId: string): Promise<ITask> {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Validate user is assignee
    const assignee = task.assignees.find(a => a.userId.toString() === userId);
    if (!assignee) {
      throw new ApiError(403, 'User is not an assignee of this task');
    }

    // Update assignee and task status
    assignee.status = TaskStatus.REJECTED;
    assignee.comment = comment;
    assignee.handledAt = new Date();
    task.status = TaskStatus.REJECTED;
    task.updatedBy = new mongoose.Types.ObjectId(userId);

    await task.save();

    // Update workflow instance
    const instance = await WorkflowInstance.findById(task.workflowInstanceId);
    if (instance) {
      instance.status = InstanceStatus.REJECTED;
      instance.updatedBy = new mongoose.Types.ObjectId(userId);
      await instance.save();
    }

    return task;
  }

  static async addTaskComment(taskId: string, content: string, userId: string): Promise<ITask> {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    task.comments.push({
      userId: new mongoose.Types.ObjectId(userId),
      content,
      createdAt: new Date()
    });

    task.updatedBy = new mongoose.Types.ObjectId(userId);
    await task.save();
    return task;
  }

  static async reassignTask(taskId: string, newAssigneeId: string, userId: string): Promise<ITask> {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Add new assignee
    task.assignees.push({
      userId: new mongoose.Types.ObjectId(newAssigneeId),
      type: AssigneeType.SPECIFIC_USER,
      status: TaskStatus.PENDING
    });

    // Add reassignment comment
    task.comments.push({
      userId: new mongoose.Types.ObjectId(userId),
      content: `Task reassigned to user ${newAssigneeId}`,
      createdAt: new Date()
    });

    task.updatedBy = new mongoose.Types.ObjectId(userId);
    await task.save();
    return task;
  }

  static async getUserTasks(userId: string): Promise<ITask[]> {
    return Task.find({
      'assignees.userId': userId,
      status: TaskStatus.PENDING
    })
    .populate('workflowId', 'name')
    .populate('initiatorId', 'name')
    .sort({ priority: -1, createdAt: 1 });
  }

  static async getUserInstances(userId: string): Promise<IWorkflowInstance[]> {
    return WorkflowInstance.find({
      initiatorId: userId
    })
    .populate('workflowId', 'name')
    .sort({ createdAt: -1 });
  }

  static async getInstanceById(instanceId: string): Promise<IWorkflowInstance> {
    const instance = await WorkflowInstance.findById(instanceId)
      .populate('workflowId', 'name')
      .populate('initiatorId', 'name');

    if (!instance) {
      throw new ApiError(404, 'Workflow instance not found');
    }

    return instance;
  }

  static async cancelInstance(instanceId: string, reason: string, userId: string): Promise<IWorkflowInstance> {
    const instance = await WorkflowInstance.findById(instanceId);
    if (!instance) {
      throw new ApiError(404, 'Workflow instance not found');
    }

    // Update instance status
    instance.status = InstanceStatus.CANCELED;
    instance.updatedBy = new mongoose.Types.ObjectId(userId);
    await instance.save();

    // Cancel all pending tasks
    await Task.updateMany(
      {
        workflowInstanceId: instanceId,
        status: TaskStatus.PENDING
      },
      {
        $set: {
          status: TaskStatus.CANCELED,
          'assignees.$[].status': TaskStatus.CANCELED,
          updatedBy: new mongoose.Types.ObjectId(userId)
        },
        $push: {
          comments: {
            userId: new mongoose.Types.ObjectId(userId),
            content: `Workflow canceled: ${reason}`,
            createdAt: new Date()
          }
        }
      }
    );

    return instance;
  }

  private static async handleTaskCompletion(task: ITask): Promise<void> {
    const instance = await WorkflowInstance.findById(task.workflowInstanceId);
    const workflow = await Workflow.findById(task.workflowId);

    if (!instance || !workflow) {
      throw new ApiError(404, 'Workflow instance or definition not found');
    }

    // Find current node in workflow definition
    const currentNode = this.findNodeByName(workflow.nodeConfig, instance.currentNodeId);
    if (!currentNode) {
      throw new ApiError(404, 'Current node not found in workflow definition');
    }

    // If there's a next node, create task for it
    if (currentNode.childNode) {
      instance.currentNodeId = currentNode.childNode.name;
      await instance.save();
      await this.createNextTask(instance, workflow, task.updatedBy.toString());
    } else {
      // If no next node, complete the workflow
      instance.status = InstanceStatus.COMPLETED;
      instance.updatedBy = task.updatedBy;
      await instance.save();
    }
  }

  private static async createNextTask(
    instance: IWorkflowInstance,
    workflow: IWorkflow,
    userId: string
  ): Promise<void> {
    const currentNode = this.findNodeByName(workflow.nodeConfig, instance.currentNodeId);
    if (!currentNode) {
      throw new ApiError(404, 'Current node not found in workflow definition');
    }

    // Create task based on node type
    const task = new Task({
      workflowId: workflow._id,
      workflowInstanceId: instance._id,
      nodeName: currentNode.name,
      type: this.getTaskTypeFromNode(currentNode),
      title: instance.title,
      description: currentNode.description || '',
      priority: instance.priority,
      dueDate: instance.dueDate,
      assignees: currentNode.assignees.map(assignee => ({
        userId: assignee.rid,
        type: assignee.type,
        status: TaskStatus.PENDING
      })),
      variables: instance.variables,
      status: TaskStatus.PENDING,
      createdBy: new mongoose.Types.ObjectId(userId),
      updatedBy: new mongoose.Types.ObjectId(userId)
    });

    await task.save();
  }

  private static findNodeByName(node: INode, name: string): INode | null {
    if (node.name === name) {
      return node;
    }
    if (node.childNode) {
      return this.findNodeByName(node.childNode, name);
    }
    return null;
  }

  private static getTaskTypeFromNode(node: INode): TaskType {
    switch (node.type) {
      case NodeType.APPROVAL:
        return TaskType.APPROVAL;
      case NodeType.NOTIFICATION:
        return TaskType.NOTIFICATION;
      default:
        return TaskType.APPROVAL;
    }
  }
} 