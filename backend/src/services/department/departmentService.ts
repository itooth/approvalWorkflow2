import { Department, IDepartment } from '../../models/Department';
import { ApiError } from '../../utils/ApiError';
import mongoose from 'mongoose';

export class DepartmentService {
  static async create(departmentData: Partial<IDepartment>) {
    const department = new Department(departmentData);
    await department.save();
    return department;
  }

  static async getById(id: string) {
    const department = await Department.findById(id)
      .populate('leaderId', 'name email')
      .populate('parentId', 'name');
    
    if (!department) {
      throw new ApiError(404, 'Department not found');
    }
    return department;
  }

  static async update(id: string, updateData: Partial<IDepartment>) {
    const department = await Department.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!department) {
      throw new ApiError(404, 'Department not found');
    }
    return department;
  }

  static async delete(id: string) {
    // Check if department has children
    const hasChildren = await Department.exists({ parentId: id });
    if (hasChildren) {
      throw new ApiError(400, 'Cannot delete department with sub-departments');
    }

    // Check if department has associated users
    const hasUsers = await mongoose.model('User').exists({ departmentId: id });
    if (hasUsers) {
      throw new ApiError(400, 'Cannot delete department with associated users');
    }

    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      throw new ApiError(404, 'Department not found');
    }
    return department;
  }

  static async getAll(query: any = {}) {
    const departments = await Department.find({ ...query, active: true })
      .populate('leaderId', 'name email')
      .populate('parentId', 'name')
      .sort({ level: 1, name: 1 });
    return departments;
  }

  static async getHierarchy() {
    const departments = await this.getAll();
    return this.buildHierarchyTree(departments);
  }

  private static buildHierarchyTree(departments: any[]) {
    const departmentMap = new Map();
    const roots: any[] = [];

    // First pass: Create map of departments
    departments.forEach(dept => {
      departmentMap.set(dept._id.toString(), {
        ...dept.toObject(),
        children: []
      });
    });

    // Second pass: Build tree structure
    departments.forEach(dept => {
      const department = departmentMap.get(dept._id.toString());
      if (dept.parentId) {
        const parent = departmentMap.get(dept.parentId.toString());
        if (parent) {
          parent.children.push(department);
        }
      } else {
        roots.push(department);
      }
    });

    return roots;
  }
} 