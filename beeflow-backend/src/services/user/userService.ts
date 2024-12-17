import { User, IUser } from '../../models/User';
import { Department } from '../../models/Department';
import { ApiError } from '../../utils/ApiError';
import mongoose from 'mongoose';

export class UserService {
  static async getById(id: string) {
    const user = await User.findById(id)
      .populate('departmentId', 'name')
      .select('-password');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  static async update(id: string, updateData: Partial<IUser>) {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  static async assignToDepartment(userId: string, departmentId: string) {
    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      throw new ApiError(404, 'Department not found');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { departmentId } },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  static async removeFromDepartment(userId: string) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $unset: { departmentId: "" } },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  static async getUsersByDepartment(departmentId: string) {
    const users = await User.find({ departmentId })
      .populate('departmentId', 'name')
      .select('-password');
    return users;
  }

  static async getUsersInDepartmentHierarchy(departmentId: string) {
    // Get the department and all its children
    const department = await Department.findById(departmentId);
    if (!department) {
      throw new ApiError(404, 'Department not found');
    }

    // Get all child departments
    const childDepartments = await Department.find({
      path: { $regex: `^${department.path}` }
    });

    const departmentIds = childDepartments.map(d => d._id);

    // Get all users in these departments
    const users = await User.find({
      departmentId: { $in: departmentIds }
    })
      .populate('departmentId', 'name')
      .select('-password');

    return users;
  }

  static async getAll(query: any = {}) {
    const users = await User.find(query)
      .populate('departmentId', 'name')
      .select('-password')
      .sort({ name: 1 });
    return users;
  }
} 