import { Types } from 'mongoose';
import { TaskType } from '../../models/Task';
import { NodeType, AssigneeType } from '../../models/Workflow';

let groupCounter = 0;
let workflowCounter = 0;

export const createTestWorkflowGroup = () => ({
  name: 'Test Group',
  code: `TEST_GROUP_${++groupCounter}`,
  description: 'Test workflow group',
  icon: 'folder'
});

export const createTestWorkflow = (groupId: string) => ({
  name: 'Test Workflow',
  code: `TEST_WF_${++workflowCounter}`,
  description: 'Test workflow',
  icon: 'workflow',
  groupId,
  nodeConfig: {
    name: 'Start',
    type: NodeType.INITIATOR,
    childNode: {
      name: 'Manager Approval',
      type: NodeType.APPROVAL,
      assignees: [{
        rid: new Types.ObjectId().toString(),
        assigneeType: AssigneeType.SPECIFIC_USER
      }]
    }
  },
  flowPermission: {
    type: 1,
    flowInitiators: [{
      id: '789',
      type: 0,
      name: 'Test User'
    }]
  }
});

export const createComplexWorkflow = (groupId: string) => ({
  name: 'Complex Workflow',
  code: `COMPLEX_WF_${++workflowCounter}`,
  description: 'Complex workflow with conditions',
  icon: 'workflow',
  groupId,
  nodeConfig: {
    name: 'Start',
    type: NodeType.INITIATOR,
    childNode: {
      name: 'Manager Approval',
      type: NodeType.APPROVAL,
      assignees: [{
        rid: new Types.ObjectId().toString(),
        assigneeType: AssigneeType.DEPARTMENT_LEADER,
        layer: 1,
        layerType: 0
      }],
      childNode: {
        name: 'Department VP Approval',
        type: NodeType.APPROVAL,
        assignees: [{
          rid: new Types.ObjectId().toString(),
          assigneeType: AssigneeType.SUPERIOR,
          layer: 2,
          layerType: 0
        }],
        childNode: {
          name: 'Copy to Finance',
          type: NodeType.COPY,
          ccs: [{
            rid: new Types.ObjectId().toString(),
            assigneeType: AssigneeType.ROLE
          }]
        }
      }
    }
  },
  flowPermission: {
    type: 1,
    flowInitiators: [{
      id: '789',
      type: 0,
      name: 'Test User'
    }]
  }
}); 