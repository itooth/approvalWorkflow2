import mongoose, { Schema, Document } from 'mongoose';

// Task status enum
export enum TaskStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED'
}

// Task type enum
export enum TaskType {
  APPROVAL = 'APPROVAL',
  COPY = 'COPY'
}

// Interface for task assignee
export interface ITaskAssignee {
  userId: mongoose.Types.ObjectId;
  type: string;  // 'SPECIFIC_USER' | 'DEPARTMENT_LEADER' | 'SUPERIOR' | 'ROLE'
  status: TaskStatus;
  comment?: string;
  handledAt?: Date;
}

// Interface for task comment
export interface ITaskComment {
  userId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

// Interface for task data
export interface ITaskData {
  [key: string]: any;  // Form data in key-value pairs
}

// Main task interface
export interface ITask extends Document {
  workflowId: string;
  workflowInstanceId: string;
  nodeId: string;
  nodeName: string;
  type: TaskType;
  status: TaskStatus;
  title: string;
  description?: string;
  initiatorId: mongoose.Types.ObjectId;
  assignees: ITaskAssignee[];
  data: ITaskData;
  comments: ITaskComment[];
  dueDate?: Date;
  priority?: number;
  parentTaskId?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskAssigneeSchema = new Schema({
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
    default: TaskStatus.PENDING
  },
  comment: {
    type: String,
    trim: true
  },
  handledAt: {
    type: Date
  }
}, {
  _id: false
});

const TaskCommentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false
});

const TaskSchema = new Schema({
  workflowId: {
    type: Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
    index: true
  },
  workflowInstanceId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  nodeId: {
    type: String,
    required: true
  },
  nodeName: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(TaskType),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.PENDING,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  initiatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  assignees: [TaskAssigneeSchema],
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  comments: [TaskCommentSchema],
  dueDate: {
    type: Date,
    index: true
  },
  priority: {
    type: Number,
    default: 0,
    index: true
  },
  parentTaskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
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
TaskSchema.index({ workflowInstanceId: 1, nodeId: 1 });
TaskSchema.index({ status: 1, dueDate: 1 });
TaskSchema.index({ status: 1, priority: -1 });
TaskSchema.index({ 'assignees.userId': 1, status: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema); 