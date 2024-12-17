import express from 'express';
import { RoleController } from '../../controllers/role/roleController';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

// All role routes require authentication
router.use(authenticate);

// Get all roles (available to all authenticated users)
router.get('/', RoleController.getAll);

// Get specific role (available to all authenticated users)
router.get('/:id', RoleController.getById);

// Admin only routes
router.use(authorize(['admin']));

// Create role
router.post('/', RoleController.create);

// Update role
router.put('/:id', RoleController.update);

// Delete role
router.delete('/:id', RoleController.delete);

// Assign roles to user
router.post('/assign', RoleController.assignToUser);

// Remove roles from user
router.post('/remove', RoleController.removeFromUser);

export default router; 