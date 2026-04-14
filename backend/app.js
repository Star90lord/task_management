import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import errorMiddleware from './middleware/error.middleware.js';
import ApiError from './utils/ApiError.js';

dotenv.config();

const app = express();

/**
 * Trust proxy for deployment behind nginx/load balancers
 */
app.set('trust proxy', 1);

/**
 * Security Middlewares
 */
app.use(helmet());

/**
 * CORS Configuration
 */
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
};
app.use(cors(corsOptions));

/**
 * Body Parser Middlewares
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * Request Logging
 */
const morganFormat =
  process.env.NODE_ENV === 'production'
    ? 'combined'
    : ':method :url :status :response-time ms';
app.use(morgan(morganFormat));

/**
 * Request ID Middleware (for tracking)
 */
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-Id', req.id);
  next();
});

/**
 * Health Check Route
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

/**
 * Root Route
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Task Management API v1.0.0',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      health: '/health',
    },
  });
});

/**
 * 404 Route Handler
 */
app.use((req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
});

/**
 * Global Error Handling Middleware (MUST BE LAST)
 */
app.use(errorMiddleware);

export default app;