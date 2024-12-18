import mongoose from 'mongoose';

export interface IDepartment {
  name: string;
  parentId?: mongoose.Types.ObjectId;
  leaderId?: mongoose.Types.ObjectId;
  description?: string;
  path?: string;  // Store the full path of department hierarchy
  level: number;  // Store the level in hierarchy
  active: boolean;
}

const departmentSchema = new mongoose.Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      trim: true,
    },
    path: {
      type: String,
      default: '',
    },
    level: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to update path and level
departmentSchema.pre('save', async function(next) {
  if (this.parentId) {
    const parent = await Department.findById(this.parentId);
    if (parent) {
      this.path = parent.path ? `${parent.path}/${this._id}` : this._id.toString();
      this.level = parent.level + 1;
    }
  } else {
    this.path = this._id.toString();
    this.level = 0;
  }
  next();
});

// Method to get all children departments
departmentSchema.methods.getChildren = async function() {
  return Department.find({ parentId: this._id });
};

// Method to get full hierarchy path
departmentSchema.methods.getHierarchyPath = async function() {
  const departments = await Department.find({
    _id: { $in: this.path.split('/') }
  });
  return departments.sort((a, b) => a.level - b.level);
};

export const Department = mongoose.model<IDepartment>('Department', departmentSchema); 