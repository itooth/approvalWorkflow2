import express from 'express';
import { AuthController } from '../../controllers/auth/authController';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/me', authenticate, AuthController.me);

export default router; 