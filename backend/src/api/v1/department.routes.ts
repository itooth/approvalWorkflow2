import express from 'express';
import { DepartmentController } from '../../controllers/department/departmentController';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

// All department routes require authentication
router.use(authenticate);

// Get department hierarchy (available to all authenticated users)
router.get('/hierarchy', DepartmentController.getHierarchy);

// Get all departments (available to all authenticated users)
router.get('/', DepartmentController.getAll);

// Get specific department (available to all authenticated users)
router.get('/:id', DepartmentController.getById);

// Admin only routes
router.use(authorize(['admin']));

// Create department
router.post('/', DepartmentController.create);

// Update department
router.put('/:id', DepartmentController.update);

// Delete department
router.delete('/:id', DepartmentController.delete);

export default router; 