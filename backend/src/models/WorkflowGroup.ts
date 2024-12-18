import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflowGroup extends Document {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  order: number;
  active: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowGroupSchema = new Schema({
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
    default: 'folder'
  },
  order: {
    type: Number,
    default: 0,
    index: true
  },
  active: {
    type: Boolean,
    default: true,
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

export const WorkflowGroup = mongoose.model<IWorkflowGroup>('WorkflowGroup', WorkflowGroupSchema); 