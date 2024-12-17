import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { FormService } from '../services/form/formService';
import { WorkflowService } from '../services/workflow/workflowService';
import { WorkflowGroupService } from '../services/workflow/workflowGroupService';
import { createTestWorkflow, createTestWorkflowGroup } from './helpers/workflow.helper';
import { createTestForm, createComplexForm } from './helpers/form.helper';
import { ApiError } from '../utils/ApiError';
import { FieldType } from '../models/Form';
import { IWorkflowGroup } from '../models/WorkflowGroup';
import { IWorkflow } from '../models/Workflow';
import { IForm } from '../models/Form';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Form System Tests', () => {
  const userId = new Types.ObjectId().toString();
  let workflowId: string;
  let formId: string;

  beforeAll(async () => {
    // Create workflow group and workflow first
    const groupData = createTestWorkflowGroup();
    const group = (await WorkflowGroupService.create(groupData, userId)) as IWorkflowGroup & { _id: Types.ObjectId };
    const workflowData = createTestWorkflow(group._id.toString());
    const workflow = (await WorkflowService.create(workflowData, userId)) as IWorkflow & { _id: Types.ObjectId };
    workflowId = workflow._id.toString();
  });

  describe('Basic Form Tests', () => {
    test('should create a simple form', async () => {
      const formData = createTestForm(workflowId);
      const form = (await FormService.create(formData, userId)) as IForm & { _id: Types.ObjectId };
      
      expect(form.name).toBe(formData.name);
      expect(form.code).toBe(formData.code);
      expect(form.workflowId.toString()).toBe(workflowId);
      expect(form.fields).toHaveLength(3);
      expect(form.createdBy.toString()).toBe(userId);
      
      formId = form._id.toString();
    });

    test('should get form by id', async () => {
      const form = (await FormService.getById(formId)) as IForm & { _id: Types.ObjectId };
      expect(form._id.toString()).toBe(formId);
    });

    test('should update form', async () => {
      const updateData = { name: 'Updated Form' };
      const form = (await FormService.update(formId, updateData, userId)) as IForm & { _id: Types.ObjectId };
      expect(form.name).toBe(updateData.name);
    });

    test('should list forms', async () => {
      const forms = await FormService.getAll();
      expect(forms.length).toBeGreaterThan(0);
    });

    test('should list forms by workflow', async () => {
      const forms = await FormService.getByWorkflow(workflowId);
      expect(forms.length).toBeGreaterThan(0);
      expect(forms[0].workflowId.toString()).toBe(workflowId);
    });
  });

  describe('Complex Form Tests', () => {
    test('should create a complex form with all field types', async () => {
      const formData = createComplexForm(workflowId);
      const form = (await FormService.create(formData, userId)) as IForm & { _id: Types.ObjectId };
      
      expect(form.name).toBe(formData.name);
      expect(form.fields).toHaveLength(9); // All field types
      
      // Verify detail field structure
      const detailField = form.fields.find(f => f.type === FieldType.DETAIL);
      expect(detailField?.details).toHaveLength(4);
    });
  });

  describe('Form Validation Tests', () => {
    test('should reject form without workflow', async () => {
      const nonExistentId = new Types.ObjectId().toString();
      const invalidForm = {
        ...createTestForm(nonExistentId),
        workflowId: nonExistentId
      };

      await expect(FormService.create(invalidForm, userId))
        .rejects
        .toThrow('Workflow not found');
    });

    test('should reject form without fields', async () => {
      const invalidForm = {
        ...createTestForm(workflowId),
        fields: []
      };

      await expect(FormService.create(invalidForm, userId))
        .rejects
        .toThrow('Form must have at least one field');
    });

    test('should reject field with invalid name format', async () => {
      const invalidForm = {
        ...createTestForm(workflowId),
        fields: [{
          name: 'invalid name',
          label: 'Invalid',
          type: FieldType.SINGLELINE_TEXT
        }]
      };

      await expect(FormService.create(invalidForm, userId))
        .rejects
        .toThrow('Field name must contain only letters, numbers, and underscores');
    });

    test('should reject choice field without options', async () => {
      const invalidForm = {
        ...createTestForm(workflowId),
        fields: [{
          name: 'choice',
          label: 'Choice',
          type: FieldType.SINGLE_CHOICE,
          options: []
        }]
      };

      await expect(FormService.create(invalidForm, userId))
        .rejects
        .toThrow('SINGLE_CHOICE field must have options');
    });

    test('should reject number field with long unit', async () => {
      const invalidForm = {
        ...createTestForm(workflowId),
        fields: [{
          name: 'number',
          label: 'Number',
          type: FieldType.NUMBER,
          unit: 'very_long_unit_name'
        }]
      };

      await expect(FormService.create(invalidForm, userId))
        .rejects
        .toThrow('Unit length cannot exceed 8 characters');
    });

    test('should reject date field with invalid format', async () => {
      const invalidForm = {
        ...createTestForm(workflowId),
        fields: [{
          name: 'date',
          label: 'Date',
          type: FieldType.DATE,
          format: 'invalid-format'
        }]
      };

      await expect(FormService.create(invalidForm, userId))
        .rejects
        .toThrow('Invalid date format');
    });

    test('should reject detail field without sub-fields', async () => {
      const invalidForm = {
        ...createTestForm(workflowId),
        fields: [{
          name: 'detail',
          label: 'Detail',
          type: FieldType.DETAIL,
          details: []
        }]
      };

      await expect(FormService.create(invalidForm, userId))
        .rejects
        .toThrow('Detail field must have sub-fields');
    });
  });
}); 