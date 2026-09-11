/**
 * Weather & Risk Assessment Routes
 */

import { Router } from 'express';
import { getWeather, getRiskAssessment } from '../controllers/weatherController';
import { authMiddleware } from '../middleware';

const router = Router();

router.use(authMiddleware);

// GET /api/weather
router.get('/', getWeather);

// GET /api/weather/risk/:cropId?
router.get('/risk/:cropId?', getRiskAssessment);

export default router;
