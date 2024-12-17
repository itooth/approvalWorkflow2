import mongoose, { Schema, Document } from 'mongoose';

// Node types enum
export enum NodeType {
  INITIATOR = 'INITIATOR',
  APPROVAL = 'APPROVAL',
  COPY = 'COPY',
  CONDITION = 'CONDITION',
  ROUTER = 'ROUTER'
}

// Assignee types enum
export enum AssigneeType {
  SPECIFIC_USER = 'SPECIFIC_USER',
  DEPARTMENT_LEADER = 'DEPARTMENT_LEADER',
  SUPERIOR = 'SUPERIOR',
  ROLE = 'ROLE',
  SPECIFIC_USERS = 'SPECIFIC_USERS'
}

// Interfaces for workflow node structure
export interface IAssignee {
  rid: string;              // Reference ID (user, role, or department ID)
  assigneeType: AssigneeType;
  layer?: number;           // For superior/leader type
  layerType?: number;       // Up or down hierarchy
  assignees?: string[];     // For specific users type
}

export interface ICondition {
  id: string;
  val: any[];
  varName: string;
  operator: number;
  operators: number[];
}

export interface IConditionGroup {
  id: string;
  conditions: ICondition[];
}

export interface INode {
  name: string;
  type: NodeType;
  childNode?: INode;
  assignees?: IAssignee[];
  approvalType?: number;     // 0: Any one, 1: All need to approve
  flowNodeNoAuditorType?: number;
  flowNodeSelfAuditorType?: number;
  multiInstanceApprovalType?: number;
  conditionNodes?: INode[];
  priorityLevel?: number;
  conditionGroups?: IConditionGroup[];
  conditionExpression?: string;
  ccs?: IAssignee[];        // For copy node type
}

// Interface for workflow permissions
export interface IFlowPermission {
  type: number;             // 0: All, 1: Specific users, 2: None
  flowInitiators: {
    id: string;
    type: number;
    name?: string;
  }[];
}

// Main workflow interface
export interface IWorkflow extends Document {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  groupId: string;
  nodeConfig: INode;
  flowPermission: IFlowPermission;
  cancelable: boolean;
  active: boolean;
  version: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'workflow'
  },
  groupId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'WorkflowGroup',
    index: true
  },
  nodeConfig: {
    type: Schema.Types.Mixed,
    required: true
  },
  flowPermission: {
    type: Schema.Types.Mixed,
    required: true
  },
  cancelable: {
    type: Boolean,
    default: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  version: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export const Workflow = mongoose.model<IWorkflow>('Workflow', WorkflowSchema); 