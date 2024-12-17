import { User } from '../models/User';
import mongoose from 'mongoose';

// Increase test timeout for slower operations
jest.setTimeout(30000);

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Register models
mongoose.model('User', User.schema); 