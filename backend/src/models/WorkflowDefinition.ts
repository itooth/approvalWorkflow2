import mongoose, { Document, Schema } from 'mongoose';

interface IFlowNode {
  id: string;
  name: string;
  type: number;
  childNode?: IFlowNode;
  conditionNodes?: IConditionNode[];
}

interface IConditionNode {
  name: string;
  type: number;
  childNode?: IFlowNode;
  priorityLevel: number;
  conditionGroups: Array<{
    id: string;
    conditions: Array<{
      id: string;
      val: string[];
      varName: string;
      operator: number;
      operators: number[];
    }>;
  }>;
}

interface IWorkFlowDef {
  icon: string;
  name: string;
  groupId: string;
  groupName?: string;
  cancelable: number;
  flowAdminIds: string[];
}

interface IFlowPermission {
  type: number;
  flowInitiators: Array<{
    id: string;
    type: number;
  }>;
}

export interface IWorkflowDefinition extends Document {
  _id: mongoose.Types.ObjectId;
  nodeConfig: IFlowNode;
  flowWidgets: any[];
  workFlowDef: IWorkFlowDef;
  flowPermission: IFlowPermission;
}

const workflowDefinitionSchema = new Schema<IWorkflowDefinition>(
  {
    nodeConfig: {
      type: Schema.Types.Mixed,
      required: true
    },
    flowWidgets: [{
      type: Schema.Types.Mixed,
      required: true
    }],
    workFlowDef: {
      icon: { type: String, required: true },
      name: { type: String, required: true },
      groupId: { type: String, required: true },
      groupName: String,
      cancelable: { type: Number, default: 1 },
      flowAdminIds: [{ type: String }]
    },
    flowPermission: {
      type: { type: Number, required: true },
      flowInitiators: [{
        id: { type: String, required: true },
        type: { type: Number, required: true }
      }]
    }
  },
  {
    timestamps: true
  }
);

export const WorkflowDefinition = mongoose.model<IWorkflowDefinition>('WorkflowDefinition', workflowDefinitionSchema); 