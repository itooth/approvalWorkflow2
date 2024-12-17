import express from 'express';
import authRoutes from './auth.routes';
import departmentRoutes from './department.routes';
import roleRoutes from './role.routes';
import userRoutes from './user.routes';
import workflowRoutes from './workflow.routes';
import formRoutes from './form.routes';

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/workflows', workflowRoutes);
router.use('/forms', formRoutes);

export default router; 