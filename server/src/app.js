import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

import healthRoutes from './routes/health.routes.js';
import predictionRoutes from './routes/prediction.routes.js';
import fleetRoutes from './routes/fleet.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import modelRoutes from './routes/model.routes.js';

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Allows inline styles/fonts and background videos
}));

// CORS Configuration
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.frontendUrl === '*' || allowedOrigins.includes(origin) || origin.includes('onrender.com') || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/model', modelRoutes);

// Fallback 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND'
  });
});

// Serve built React client if client/dist exists (Full-stack production mode)
if (fs.existsSync(config.clientDistDir)) {
  console.log(`[Static] Serving frontend bundle from: ${config.clientDistDir}`);
  app.use(express.static(config.clientDistDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(config.clientDistDir, 'index.html'));
  });
}

// Centralized error handling
app.use(errorHandler);

export default app;
