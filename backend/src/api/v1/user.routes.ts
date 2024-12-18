import express from 'express';
import { UserController } from '../../controllers/user/userController';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Get all users (available to all authenticated users)
router.get('/', UserController.getAll);

// Get specific user (available to all authenticated users)
router.get('/:id', UserController.getById);

// Get users by department
router.get('/department/:departmentId', UserController.getUsersByDepartment);

// Get users in department hierarchy
router.get('/department/:departmentId/hierarchy', UserController.getUsersInDepartmentHierarchy);

// Admin only routes
router.use(authorize(['admin']));

// Update user
router.put('/:id', UserController.update);

// Assign user to department
router.post('/assign-department', UserController.assignToDepartment);

// Remove user from department
router.post('/remove-department', UserController.removeFromDepartment);

export default router; 