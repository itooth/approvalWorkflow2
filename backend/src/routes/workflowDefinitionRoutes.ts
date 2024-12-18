import express, { Request, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { WorkflowDefinitionController } from '../controllers/workflowDefinitionController';

const router = express.Router();
const controller = new WorkflowDefinitionController();

// Group management
router.get('/listGroups', auth, (req, res) => controller.listGroups(req as AuthRequest, res));
router.get('/listGroupsWithFlowDefinition', auth, (req, res) => controller.listGroupsWithFlowDefinition(req as AuthRequest, res));
router.get('/listGroupsWithEnabledFlowDefinition', auth, (req, res) => controller.listGroupsWithEnabledFlowDefinition(req as AuthRequest, res));
router.post('/saveOrUpdateGroup', auth, (req, res) => controller.saveOrUpdateGroup(req as AuthRequest, res));
router.get('/deleteGroup', auth, (req, res) => controller.deleteGroup(req as AuthRequest, res));

// Flow definition management
router.get('/listFlowDefinitions', auth, (req, res) => controller.listFlowDefinitions(req as AuthRequest, res));
router.get('/getFlowConfig', auth, (req, res) => controller.getFlowConfig(req as AuthRequest, res));
router.post('/saveOrUpdate', auth, (req, res) => controller.saveOrUpdate(req as AuthRequest, res));
router.post('/copy', auth, (req, res) => controller.copy(req as AuthRequest, res));
router.get('/removeById', auth, (req, res) => controller.removeById(req as AuthRequest, res));
router.get('/freezeById', auth, (req, res) => controller.freezeById(req as AuthRequest, res));
router.get('/enableById', auth, (req, res) => controller.enableById(req as AuthRequest, res));
router.get('/getFlowFormWidget', auth, (req, res) => controller.getFlowFormWidget(req as AuthRequest, res));

export default router; 