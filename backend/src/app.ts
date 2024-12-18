import express from 'express';
import cors from 'cors';
import { config } from './config';
import workflowDefinitionRoutes from './routes/workflowDefinitionRoutes';
import organizationRoutes from './routes/organizationRoutes';
import workflowExecutionRoutes from './routes/workflowExecutionRoutes';

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/flowdefinition', workflowDefinitionRoutes);
app.use('/organ', organizationRoutes);
app.use('/flowinstance', workflowExecutionRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    code: 0,
    error: err.message || 'Internal Server Error'
  });
});

export default app; 