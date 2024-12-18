import mongoose, { Schema, Document } from 'mongoose';

// Field types enum matching frontend WIDGET types
export enum FieldType {
  SINGLELINE_TEXT = 'SINGLELINE_TEXT',
  MULTILINE_TEXT = 'MULTILINE_TEXT',
  DESCRIBE = 'DESCRIBE',
  NUMBER = 'NUMBER',
  MONEY = 'MONEY',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTI_CHOICE = 'MULTI_CHOICE',
  DATE = 'DATE',
  DATE_RANGE = 'DATE_RANGE',
  DETAIL = 'DETAIL',
  PICTURE = 'PICTURE',
  ATTACHMENT = 'ATTACHMENT',
  DEPARTMENT = 'DEPARTMENT',
  EMPLOYEE = 'EMPLOYEE',
  AREA = 'AREA',
  FLOW_INST = 'FLOW_INST'
}

// Interface for form field
export interface IFormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  summary?: boolean;
  editable?: boolean;
  options?: string[];      // For choice fields
  unit?: string;          // For number fields
  format?: string;        // For date fields
  comma?: boolean;        // For money fields (thousand separator)
  details?: IFormField[]; // For detail fields
}

// Interface for form
export interface IForm extends Document {
  name: string;
  code: string;
  description?: string;
  fields: IFormField[];
  workflowId: string;
  active: boolean;
  version: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(FieldType)
  },
  placeholder: {
    type: String,
    trim: true
  },
  required: {
    type: Boolean,
    default: false
  },
  summary: {
    type: Boolean,
    default: false
  },
  editable: {
    type: Boolean,
    default: true
  },
  options: [{
    type: String,
    trim: true
  }],
  unit: {
    type: String,
    trim: true
  },
  format: {
    type: String,
    trim: true
  },
  comma: {
    type: Boolean,
    default: false
  },
  details: [{ type: Schema.Types.Mixed }] // Allows nested form fields
}, {
  _id: false // Don't create _id for subdocuments
});

const FormSchema = new Schema({
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
  fields: [FormFieldSchema],
  workflowId: {
    type: Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
    index: true
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

export const Form = mongoose.model<IForm>('Form', FormSchema); 