import express from 'express';
import { FormController } from '../../controllers/form/formController';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

// All form routes require authentication
router.use(authenticate);

// Get all forms (available to all authenticated users)
router.get('/', FormController.getAll);

// Get specific form (available to all authenticated users)
router.get('/:id', FormController.getById);

// Get forms by workflow (available to all authenticated users)
router.get('/workflow/:workflowId', FormController.getByWorkflow);

// Admin only routes
router.use(authorize(['admin']));

// Create form
router.post('/', FormController.create);

// Update form
router.put('/:id', FormController.update);

// Delete form
router.delete('/:id', FormController.delete);

export default router; 