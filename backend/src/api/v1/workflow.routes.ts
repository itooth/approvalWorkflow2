import express from 'express';
import { WorkflowController } from '../../controllers/workflow/workflowController';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

// All workflow routes require authentication
router.use(authenticate);

// Workflow Group routes
router.get('/groups', WorkflowController.getAllGroups);
router.get('/groups/:id', WorkflowController.getGroup);

// Admin only group management routes
router.use('/groups', authorize(['admin']));
router.post('/groups', WorkflowController.createGroup);
router.put('/groups/:id', WorkflowController.updateGroup);
router.delete('/groups/:id', WorkflowController.deleteGroup);
router.post('/groups/reorder', WorkflowController.reorderGroups);

// Workflow routes
router.get('/', WorkflowController.getAllWorkflows);
router.get('/:id', WorkflowController.getWorkflow);
router.get('/group/:groupId', WorkflowController.getWorkflowsByGroup);

// Admin only workflow management routes
router.use(authorize(['admin']));
router.post('/', WorkflowController.createWorkflow);
router.put('/:id', WorkflowController.updateWorkflow);
router.delete('/:id', WorkflowController.deleteWorkflow);

export default router; 