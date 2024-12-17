import { Form, IForm, IFormField, FieldType } from '../../models/Form';
import { Workflow } from '../../models/Workflow';
import { ApiError } from '../../utils/ApiError';
import mongoose from 'mongoose';

export class FormService {
  static async create(formData: Partial<IForm>, userId: string) {
    // Validate workflow exists
    const workflow = await Workflow.findById(formData.workflowId);
    if (!workflow) {
      throw new ApiError(404, 'Workflow not found');
    }

    // Validate form fields
    if (!formData.fields || formData.fields.length === 0) {
      throw new ApiError(400, 'Form must have at least one field');
    }
    this.validateFields(formData.fields);

    // Set created/updated by
    formData.createdBy = userId;
    formData.updatedBy = userId;

    const form = new Form(formData);
    await form.save();
    return form;
  }

  static async update(id: string, updateData: Partial<IForm>, userId: string) {
    // If updating workflow, validate it exists
    if (updateData.workflowId) {
      const workflow = await Workflow.findById(updateData.workflowId);
      if (!workflow) {
        throw new ApiError(404, 'Workflow not found');
      }
    }

    // If updating fields, validate them
    if (updateData.fields) {
      this.validateFields(updateData.fields);
    }

    // Set updated by
    updateData.updatedBy = userId;

    const form = await Form.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }
    return form;
  }

  static async delete(id: string) {
    const form = await Form.findByIdAndDelete(id);
    if (!form) {
      throw new ApiError(404, 'Form not found');
    }
    return form;
  }

  static async getById(id: string) {
    const form = await Form.findById(id)
      .populate('workflowId', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!form) {
      throw new ApiError(404, 'Form not found');
    }
    return form;
  }

  static async getByWorkflow(workflowId: string) {
    const forms = await Form.find({ workflowId, active: true })
      .sort({ version: -1 });
    return forms;
  }

  static async getAll(query: any = {}) {
    const forms = await Form.find({ ...query, active: true })
      .populate('workflowId', 'name')
      .sort({ createdAt: -1 });
    return forms;
  }

  private static validateFields(fields: IFormField[]) {
    fields.forEach(field => this.validateField(field));
  }

  private static validateField(field: IFormField) {
    // Validate required fields
    if (!field.name || !field.label || !field.type) {
      throw new ApiError(400, 'Field name, label, and type are required');
    }

    // Validate field name format (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(field.name)) {
      throw new ApiError(400, 'Field name must contain only letters, numbers, and underscores');
    }

    // Validate field type specific requirements
    switch (field.type) {
      case FieldType.SINGLE_CHOICE:
      case FieldType.MULTI_CHOICE:
        if (!field.options || field.options.length === 0) {
          throw new ApiError(400, `${field.type} field must have options`);
        }
        break;

      case FieldType.NUMBER:
      case FieldType.MONEY:
        if (field.unit && field.unit.length > 8) {
          throw new ApiError(400, 'Unit length cannot exceed 8 characters');
        }
        break;

      case FieldType.DATE:
      case FieldType.DATE_RANGE:
        if (field.format && !['YYYY-MM-DD', 'YYYY-MM-DD HH:mm'].includes(field.format)) {
          throw new ApiError(400, 'Invalid date format');
        }
        break;

      case FieldType.DETAIL:
        if (!field.details || field.details.length === 0) {
          throw new ApiError(400, 'Detail field must have sub-fields');
        }
        // Recursively validate detail fields
        field.details.forEach(detailField => this.validateField(detailField));
        break;
    }
  }
} 