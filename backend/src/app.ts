import express from 'express';
import cors from 'cors';

import {
  authRoutes,
  dashboardRoutes,
  cropRoutes,
  scanRoutes,
  weatherRoutes,
  alertRoutes,
} from './routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'agriraksha-backend',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/ai', scanRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/alerts', alertRoutes);
// app.use('/api/advisories', advisoryRoutes);
// app.use('/api/expert-requests', expertRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
