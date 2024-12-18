import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/beeflow'),
  JWT_SECRET: z.string().default('your-secret-key'),
  CORS_ORIGIN: z.string().default('http://localhost:5174')
});

const env = envSchema.parse(process.env);

export const config = {
  port: parseInt(env.PORT, 10),
  mongoUri: env.MONGODB_URI,
  jwtSecret: env.JWT_SECRET,
  corsOrigin: env.CORS_ORIGIN,
  env: env.NODE_ENV
}; 