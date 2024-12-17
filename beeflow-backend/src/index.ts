import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config/config';
import authRoutes from './api/v1/auth.routes';
import departmentRoutes from './api/v1/department.routes';
import roleRoutes from './api/v1/role.routes';
import userRoutes from './api/v1/user.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/users', userRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'BeeFlow API is running' });
});

// Connect to MongoDB
mongoose
  .connect(config.mongoose.url)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Start server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
}); 