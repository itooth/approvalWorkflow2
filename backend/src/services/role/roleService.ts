import { Role, IRole } from '../../models/Role';
import { ApiError } from '../../utils/ApiError';
import mongoose from 'mongoose';

export class RoleService {
  static async create(roleData: Partial<IRole>) {
    const role = new Role(roleData);
    await role.save();
    return role;
  }

  static async getById(id: string) {
    const role = await Role.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }
    return role;
  }

  static async update(id: string, updateData: Partial<IRole>) {
    const role = await Role.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!role) {
      throw new ApiError(404, 'Role not found');
    }
    return role;
  }

  static async delete(id: string) {
    // Check if role has associated users
    const hasUsers = await mongoose.model('User').exists({ roles: id });
    if (hasUsers) {
      throw new ApiError(400, 'Cannot delete role with associated users');
    }

    const role = await Role.findByIdAndDelete(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }
    return role;
  }

  static async getAll(query: any = {}) {
    const roles = await Role.find({ ...query, active: true })
      .sort({ name: 1 });
    return roles;
  }

  static async assignToUser(userId: string, roleIds: string[]) {
    const user = await mongoose.model('User').findByIdAndUpdate(
      userId,
      { $addToSet: { roles: { $each: roleIds } } },
      { new: true }
    );
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  static async removeFromUser(userId: string, roleIds: string[]) {
    const user = await mongoose.model('User').findByIdAndUpdate(
      userId,
      { $pullAll: { roles: roleIds } },
      { new: true }
    );
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
} 