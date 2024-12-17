import { FieldType } from '../../models/Form';

export const createTestForm = (workflowId: string) => ({
  name: 'Test Form',
  code: 'TEST_FORM',
  description: 'Test form description',
  workflowId,
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: FieldType.SINGLELINE_TEXT,
      required: true,
      placeholder: 'Enter title',
      summary: true
    },
    {
      name: 'description',
      label: 'Description',
      type: FieldType.MULTILINE_TEXT,
      placeholder: 'Enter description'
    },
    {
      name: 'amount',
      label: 'Amount',
      type: FieldType.MONEY,
      required: true,
      comma: true,
      unit: 'USD'
    }
  ]
});

export const createComplexForm = (workflowId: string) => ({
  name: 'Complex Form',
  code: 'COMPLEX_FORM',
  description: 'Complex form with all field types',
  workflowId,
  fields: [
    {
      name: 'department',
      label: 'Department',
      type: FieldType.DEPARTMENT,
      required: true,
      placeholder: 'Select department'
    },
    {
      name: 'approver',
      label: 'Approver',
      type: FieldType.EMPLOYEE,
      required: true,
      placeholder: 'Select approver'
    },
    {
      name: 'category',
      label: 'Category',
      type: FieldType.SINGLE_CHOICE,
      required: true,
      options: ['IT Equipment', 'Office Supplies', 'Travel', 'Others']
    },
    {
      name: 'tags',
      label: 'Tags',
      type: FieldType.MULTI_CHOICE,
      options: ['Urgent', 'High Value', 'Regular', 'Low Priority']
    },
    {
      name: 'period',
      label: 'Period',
      type: FieldType.DATE_RANGE,
      format: 'YYYY-MM-DD'
    },
    {
      name: 'items',
      label: 'Items',
      type: FieldType.DETAIL,
      required: true,
      details: [
        {
          name: 'item_name',
          label: 'Item Name',
          type: FieldType.SINGLELINE_TEXT,
          required: true
        },
        {
          name: 'quantity',
          label: 'Quantity',
          type: FieldType.NUMBER,
          required: true,
          unit: 'pcs'
        },
        {
          name: 'unit_price',
          label: 'Unit Price',
          type: FieldType.MONEY,
          required: true,
          comma: true
        },
        {
          name: 'remarks',
          label: 'Remarks',
          type: FieldType.MULTILINE_TEXT
        }
      ]
    },
    {
      name: 'attachments',
      label: 'Attachments',
      type: FieldType.ATTACHMENT,
      placeholder: 'Upload supporting documents'
    },
    {
      name: 'location',
      label: 'Location',
      type: FieldType.AREA,
      placeholder: 'Select location'
    },
    {
      name: 'note',
      label: 'Important Note',
      type: FieldType.DESCRIBE,
      placeholder: 'Please provide all necessary information and documents.'
    }
  ]
}); 