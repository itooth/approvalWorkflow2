import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { config } from '../../config/config';
import { ApiError } from '../../utils/ApiError';

export class AuthService {
  static async login(email: string, password: string) {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user._id.toString());

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
      token,
    };
  }

  static generateToken(userId: string): string {
    return jwt.sign({ sub: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { sub: string };
      const user = await User.findById(decoded.sub);
      if (!user) {
        throw new ApiError(401, 'User not found');
      }
      return user;
    } catch (error) {
      throw new ApiError(401, 'Invalid token');
    }
  }
} 