/**
 * Scan & AI Routes
 */

import { Router } from 'express';
import { analyzeCrop, getScans, getScanById } from '../controllers/scanController';
import { authMiddleware } from '../middleware';

const router = Router();

// Protect all scan routes
router.use(authMiddleware);

// POST /api/scans/analyze (also aliased under /api/ai/analyze)
router.post('/analyze', analyzeCrop);

// GET /api/scans
router.get('/', getScans);

// GET /api/scans/:id
router.get('/:id', getScanById);

export default router;
