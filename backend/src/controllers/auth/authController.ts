import { Request, Response } from 'express';
import { AuthService } from '../../services/auth/authService';
import { User } from '../../models/User';
import { ApiError } from '../../utils/ApiError';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ApiError(400, 'Email already registered');
      }

      // Create new user
      const user = new User({
        email,
        password,
        name,
        roles: ['user'],
      });
      await user.save();

      // Generate token
      const token = AuthService.generateToken(user._id.toString());

      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          roles: user.roles,
        },
        token,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new ApiError(401, 'No token provided');
      }

      const user = await AuthService.verifyToken(token);
      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          roles: user.roles,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 