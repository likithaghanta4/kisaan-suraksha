/**
 * Dashboard Routes
 */

import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware';

const router = Router();

// GET /api/dashboard (protected)
router.get('/', authMiddleware, getDashboardData);

export default router;
