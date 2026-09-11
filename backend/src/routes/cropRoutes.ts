/**
 * Crop Routes — CRUD for registered farmer crops
 */

import { Router } from 'express';
import {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
} from '../controllers/cropController';
import { authMiddleware } from '../middleware';

const router = Router();

// All crop routes require JWT authentication
router.use(authMiddleware);

// GET /api/crops
router.get('/', getCrops);

// GET /api/crops/:id
router.get('/:id', getCropById);

// POST /api/crops
router.post('/', createCrop);

// PUT /api/crops/:id
router.put('/:id', updateCrop);

// DELETE /api/crops/:id
router.delete('/:id', deleteCrop);

export default router;
