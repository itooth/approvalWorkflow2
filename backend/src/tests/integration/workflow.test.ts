import request from 'supertest';
import app from '../../app';
import { generateTestToken } from '../setup';
import { WorkflowDefinition, IWorkflowDefinition } from '../../models/WorkflowDefinition';
import mongoose from 'mongoose';

describe('Workflow Definition API', () => {
  const token = generateTestToken();

  describe('GET /flowdefinition/listGroups', () => {
    it('should return empty groups list when no definitions exist', async () => {
      const response = await request(app)
        .get('/flowdefinition/listGroups')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toEqual([]);
    });

    it('should return groups when definitions exist', async () => {
      // Create test workflow definition
      const workflow = await WorkflowDefinition.create({
        nodeConfig: {
          name: 'Start',
          type: 0
        },
        flowWidgets: [],
        workFlowDef: {
          icon: 'test',
          name: 'Test Workflow',
          groupId: 'group1',
          groupName: 'Test Group',
          cancelable: 1,
          flowAdminIds: ['1']
        },
        flowPermission: {
          type: 1,
          flowInitiators: [{ id: '1', type: 0 }]
        }
      }) as IWorkflowDefinition;

      const response = await request(app)
        .get('/flowdefinition/listGroups')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        _id: 'group1',
        name: 'Test Group'
      });
    });
  });

  describe('POST /flowdefinition/saveOrUpdate', () => {
    it('should create new workflow definition', async () => {
      const workflowData = {
        nodeConfig: {
          name: 'Start',
          type: 0
        },
        flowWidgets: [],
        workFlowDef: {
          icon: 'test',
          name: 'Test Workflow',
          groupId: 'group1',
          cancelable: 1,
          flowAdminIds: ['1']
        },
        flowPermission: {
          type: 1,
          flowInitiators: [{ id: '1', type: 0 }]
        }
      };

      const response = await request(app)
        .post('/flowdefinition/saveOrUpdate')
        .set('Authorization', `Bearer ${token}`)
        .send(workflowData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.message).toBe('Flow definition saved successfully');

      // Verify in database
      const saved = await WorkflowDefinition.findOne({ 'workFlowDef.name': 'Test Workflow' });
      expect(saved).toBeTruthy();
      expect(saved?.workFlowDef.name).toBe('Test Workflow');
    });
  });

  describe('GET /flowdefinition/getFlowConfig', () => {
    it('should return 404 for non-existent workflow', async () => {
      const response = await request(app)
        .get('/flowdefinition/getFlowConfig')
        .query({ id: new mongoose.Types.ObjectId().toString() })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(0);
      expect(response.body.error).toBe('Definition not found');
    });

    it('should return workflow configuration', async () => {
      const workflow = await WorkflowDefinition.create({
        nodeConfig: {
          name: 'Start',
          type: 0
        },
        flowWidgets: [],
        workFlowDef: {
          icon: 'test',
          name: 'Test Workflow',
          groupId: 'group1',
          cancelable: 1,
          flowAdminIds: ['1']
        },
        flowPermission: {
          type: 1,
          flowInitiators: [{ id: '1', type: 0 }]
        }
      }) as IWorkflowDefinition;

      const response = await request(app)
        .get('/flowdefinition/getFlowConfig')
        .query({ id: workflow._id.toString() })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data.flowDefId).toBe(workflow._id.toString());
      expect(JSON.parse(response.body.data.flowDefJson)).toMatchObject({
        nodeConfig: workflow.nodeConfig,
        workFlowDef: workflow.workFlowDef
      });
    });
  });
}); 