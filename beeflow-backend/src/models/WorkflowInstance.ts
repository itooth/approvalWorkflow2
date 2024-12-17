import mongoose, { Schema, Document } from 'mongoose';
import { TaskStatus } from './Task';

// Instance status enum
export enum InstanceStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED'
}

// Interface for node execution history
export interface INodeExecution {
  nodeId: string;
  nodeName: string;
  type: string;
  status: TaskStatus;
  assignees: {
    userId: mongoose.Types.ObjectId;
    type: string;
    status: TaskStatus;
    comment?: string;
    handledAt?: Date;
  }[];
  startedAt: Date;
  completedAt?: Date;
}

// Interface for workflow instance
export interface IWorkflowInstance extends Document {
  workflowId: string;
  workflowVersion: number;
  title: string;
  status: InstanceStatus;
  initiatorId: mongoose.Types.ObjectId;
  currentNodeId: string;
  nodeHistory: INodeExecution[];
  formData: any;
  variables: { [key: string]: any };
  parentInstanceId?: string;
  dueDate?: Date;
  priority: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NodeExecutionSchema = new Schema({
  nodeId: {
    type: String,
    required: true
  },
  nodeName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    required: true
  },
  assignees: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      required: true
    },
    comment: String,
    handledAt: Date
  }],
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: Date
}, {
  _id: false
});

const WorkflowInstanceSchema = new Schema({
  workflowId: {
    type: Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
    index: true
  },
  workflowVersion: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(InstanceStatus),
    default: InstanceStatus.RUNNING,
    index: true
  },
  initiatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  currentNodeId: {
    type: String,
    required: true
  },
  nodeHistory: [NodeExecutionSchema],
  formData: {
    type: Schema.Types.Mixed,
    required: true
  },
  variables: {
    type: Schema.Types.Mixed,
    default: {}
  },
  parentInstanceId: {
    type: Schema.Types.ObjectId,
    ref: 'WorkflowInstance'
  },
  dueDate: {
    type: Date,
    index: true
  },
  priority: {
    type: Number,
    default: 0,
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
WorkflowInstanceSchema.index({ status: 1, dueDate: 1 });
WorkflowInstanceSchema.index({ status: 1, priority: -1 });
WorkflowInstanceSchema.index({ workflowId: 1, status: 1 });
WorkflowInstanceSchema.index({ initiatorId: 1, status: 1 });

export const WorkflowInstance = mongoose.model<IWorkflowInstance>('WorkflowInstance', WorkflowInstanceSchema); 