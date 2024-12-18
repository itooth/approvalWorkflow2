import { WorkflowGroup, IWorkflowGroup } from '../../models/WorkflowGroup';
import { Workflow } from '../../models/Workflow';
import { ApiError } from '../../utils/ApiError';
import mongoose from 'mongoose';

export class WorkflowGroupService {
  static async create(groupData: Partial<IWorkflowGroup>, userId: string) {
    // Set created/updated by
    groupData.createdBy = userId;
    groupData.updatedBy = userId;

    const group = new WorkflowGroup(groupData);
    await group.save();
    return group;
  }

  static async update(id: string, updateData: Partial<IWorkflowGroup>, userId: string) {
    // Set updated by
    updateData.updatedBy = userId;

    const group = await WorkflowGroup.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!group) {
      throw new ApiError(404, 'Workflow group not found');
    }
    return group;
  }

  static async delete(id: string) {
    // Check if group has workflows
    const hasWorkflows = await Workflow.exists({ groupId: id });
    if (hasWorkflows) {
      throw new ApiError(400, 'Cannot delete group with associated workflows');
    }

    const group = await WorkflowGroup.findByIdAndDelete(id);
    if (!group) {
      throw new ApiError(404, 'Workflow group not found');
    }
    return group;
  }

  static async getById(id: string) {
    const group = await WorkflowGroup.findById(id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!group) {
      throw new ApiError(404, 'Workflow group not found');
    }
    return group;
  }

  static async getAll(query: any = {}) {
    const groups = await WorkflowGroup.find({ ...query, active: true })
      .sort({ order: 1, createdAt: -1 });
    return groups;
  }

  static async reorder(groupIds: string[]) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update order for each group
      await Promise.all(groupIds.map((groupId, index) => 
        WorkflowGroup.findByIdAndUpdate(
          groupId,
          { $set: { order: index } },
          { session }
        )
      ));

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
} 