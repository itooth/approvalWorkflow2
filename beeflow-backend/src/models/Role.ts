import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: [{
    type: String,
    trim: true
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Role = mongoose.model<IRole>('Role', RoleSchema); 