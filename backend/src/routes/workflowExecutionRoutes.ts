import express from 'express';
import { auth } from '../middleware/auth';
import { WorkflowExecutionController } from '../controllers/workflowExecutionController';

const router = express.Router();
const controller = new WorkflowExecutionController();

// Workflow instance management
router.post('/viewProcessChart', auth, controller.viewProcessChart);
router.post('/launch', auth, controller.flowStart);
router.get('/getById', auth, controller.getById);
router.get('/getForm', auth, controller.getForm);
router.get('/getDetail', auth, controller.getDetail);

// Task management
router.post('/listTasks', auth, controller.listTasks);
router.post('/listMineFlowInsts', auth, controller.listMineFlowInsts);
router.post('/listMineFlowInstCcs', auth, controller.listMineFlowInstCcs);
router.post('/listMineAuditRecords', auth, controller.listMineAuditRecords);
router.post('/listFlowInsts', auth, controller.listFlowInsts);

// Task actions
router.post('/approve', auth, controller.approve);
router.post('/reject', auth, controller.reject);
router.post('/transact', auth, controller.transact);

export default router; 