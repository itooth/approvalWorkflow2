import express, { Request, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { OrganizationController } from '../controllers/organizationController';

const router = express.Router();
const controller = new OrganizationController();

// Department management
router.get('/listDepts', auth, (req, res) => controller.listDepts(req as AuthRequest, res));

// Role management
router.get('/listRoles', auth, (req, res) => controller.listRoles(req as AuthRequest, res));

// User management
router.get('/listUsers', auth, (req, res) => controller.listUsers(req as AuthRequest, res));
router.get('/getUserDetail', auth, (req, res) => controller.getUserDetail(req as AuthRequest, res));
router.get('/getLoginUserDetail', auth, (req, res) => controller.getLoginUserDetail(req as AuthRequest, res));

export default router; 