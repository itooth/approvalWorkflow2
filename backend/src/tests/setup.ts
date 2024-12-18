import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from '../config';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../middleware/auth';

let mongo: MongoMemoryServer;

// Setup before tests
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
});

// Clear data between tests
beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

// Cleanup after tests
afterAll(async () => {
  if (mongoose.connection) {
    await mongoose.connection.close();
  }
  if (mongo) {
    await mongo.stop();
  }
});

// Helper function to generate test JWT tokens
export const generateTestToken = (userId: string = '1'): string => {
  const user: AuthUser = {
    id: userId,
    email: 'test@example.com',
    name: 'Test User',
    roles: ['admin']
  };
  return jwt.sign(user, config.jwtSecret);
};