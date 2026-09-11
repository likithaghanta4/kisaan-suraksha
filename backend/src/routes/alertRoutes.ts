/**
 * Alerts & Outbreak Radar Routes
 */

import { Router } from 'express';
import { getAlerts, markAlertRead } from '../controllers/alertController';
import { authMiddleware } from '../middleware';

const router = Router();

router.use(authMiddleware);

// GET /api/alerts
router.get('/', getAlerts);

// POST /api/alerts/:id/read
router.post('/:id/read', markAlertRead);

export default router;
