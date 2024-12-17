import { Types } from 'mongoose';
import { TaskType } from '../../models/Task';
import { NodeType, AssigneeType } from '../../models/Workflow';

export const createTestFormData = () => ({
  title: 'Test Request',
  description: 'Test request description',
  amount: 1000,
  category: 'IT Equipment',
  items: [
    {
      item_name: 'Laptop',
      quantity: 1,
      unit_price: 1000,
      remarks: 'For development'
    }
  ]
});

export const createTestWorkflowInstance = (workflowId: string, userId: string) => ({
  workflowId,
  workflowVersion: 1,
  title: 'Test Request',
  initiatorId: userId,
  currentNodeId: 'start',
  formData: createTestFormData(),
  variables: {},
  priority: 0,
  createdBy: userId,
  updatedBy: userId
});

export const createTestTask = (
  workflowId: string,
  workflowInstanceId: string,
  userId: string,
  assigneeId: string
) => ({
  workflowId,
  workflowInstanceId,
  nodeId: 'approval1',
  nodeName: 'Manager Approval',
  type: TaskType.APPROVAL,
  title: 'Test Request',
  description: 'Approval needed for test request',
  initiatorId: userId,
  assignees: [
    {
      userId: assigneeId,
      type: AssigneeType.SPECIFIC_USER,
      comment: ''
    }
  ],
  data: createTestFormData(),
  comments: [],
  priority: 0,
  createdBy: userId,
  updatedBy: userId
});

export const createComplexWorkflowInstance = (workflowId: string, userId: string) => ({
  workflowId,
  workflowVersion: 1,
  title: 'Complex Request',
  initiatorId: userId,
  currentNodeId: 'start',
  formData: {
    title: 'Complex Request',
    description: 'Complex request with multiple approvals',
    amount: 5000,
    category: 'Travel',
    period: {
      start: '2024-01-01',
      end: '2024-01-07'
    },
    items: [
      {
        item_name: 'Flight Ticket',
        quantity: 1,
        unit_price: 3000,
        remarks: 'Round trip'
      },
      {
        item_name: 'Hotel',
        quantity: 6,
        unit_price: 300,
        remarks: '6 nights'
      },
      {
        item_name: 'Transportation',
        quantity: 1,
        unit_price: 200,
        remarks: 'Local transport'
      }
    ]
  },
  variables: {
    totalAmount: 5000,
    requiresVP: true,
    requiresCFO: true
  },
  priority: 1,
  createdBy: userId,
  updatedBy: userId
});

export const createComplexTask = (
  workflowId: string,
  workflowInstanceId: string,
  userId: string,
  assigneeIds: string[]
) => ({
  workflowId,
  workflowInstanceId,
  nodeId: 'approval2',
  nodeName: 'Department VP Approval',
  type: TaskType.APPROVAL,
  title: 'Complex Request',
  description: 'High value request requiring VP approval',
  initiatorId: userId,
  assignees: assigneeIds.map(id => ({
    userId: id,
    type: AssigneeType.SPECIFIC_USER,
    comment: ''
  })),
  data: {
    title: 'Complex Request',
    description: 'Complex request with multiple approvals',
    amount: 5000,
    category: 'Travel',
    items: [
      {
        item_name: 'Flight Ticket',
        quantity: 1,
        unit_price: 3000,
        remarks: 'Round trip'
      },
      {
        item_name: 'Hotel',
        quantity: 6,
        unit_price: 300,
        remarks: '6 nights'
      }
    ]
  },
  comments: [
    {
      userId,
      content: 'Please review this high value request',
      createdAt: new Date()
    }
  ],
  priority: 1,
  dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  createdBy: userId,
  updatedBy: userId
}); 