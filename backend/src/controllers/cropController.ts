/**
 * Crop Controller — CRUD operations for farmer crop management
 * 
 * Supports both MongoDB persistence and in-memory demo store fallback.
 */

import { Request, Response } from 'express';
import mongoose from 'express';
import { Crop, Scan } from '../models';
import { demoCrops, getDemoCropsForUser, getDemoScansForUser } from '../data/demoStore';

/**
 * GET /api/crops
 * Get all crops for authenticated farmer
 */
export const getCrops = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = user._id ? String(user._id) : 'demo-farmer-001';

    if (require('mongoose').connection.readyState === 1) {
      const crops = await Crop.find({ userId }).sort({ createdAt: -1 });
      res.json({ crops });
      return;
    }

    // Demo store fallback
    const crops = getDemoCropsForUser(userId);
    res.json({ crops });
  } catch (error: any) {
    console.error('[Crops] Error fetching crops:', error.message);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
};

/**
 * GET /api/crops/:id
 * Get single crop details with inspection history & scans
 */
export const getCropById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = user._id ? String(user._id) : 'demo-farmer-001';
    let crop: any = null;
    let scans: any[] = [];

    if (require('mongoose').connection.readyState === 1) {
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        crop = await Crop.findOne({ _id: id, userId });
        if (crop) {
          scans = await Scan.find({ cropId: id }).sort({ createdAt: -1 });
        }
      }
    }

    if (!crop) {
      crop = demoCrops.find((c) => c._id === id);
      if (crop) {
        scans = getDemoScansForUser(userId).filter((s) => s.cropId === id || s.cropName.toLowerCase() === crop.cropName.toLowerCase());
      }
    }

    if (!crop) {
      res.status(404).json({ error: 'Crop not found' });
      return;
    }

    res.json({ crop, scans });
  } catch (error: any) {
    console.error('[Crops] Error fetching crop by id:', error.message);
    res.status(500).json({ error: 'Failed to fetch crop details' });
  }
};

/**
 * POST /api/crops
 * Register a new crop
 */
export const createCrop = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = user._id ? String(user._id) : 'demo-farmer-001';
    const { cropName, variety, area, sowingDate, stage } = req.body;

    if (!cropName) {
      res.status(400).json({ error: 'Crop name is required' });
      return;
    }

    const cropData = {
      userId,
      cropName: cropName.trim(),
      variety: variety ? variety.trim() : 'Standard',
      area: area ? area.trim() : '1 Acre',
      sowingDate: sowingDate ? new Date(sowingDate) : new Date(),
      stage: stage || 'vegetative',
      healthStatus: 'healthy',
      lastInspectionDate: new Date(),
      activeDiseases: [],
    };

    if (require('mongoose').connection.readyState === 1) {
      const newCrop = new Crop(cropData);
      await newCrop.save();
      res.status(201).json({ crop: newCrop });
      return;
    }

    // Demo store fallback
    const newDemoCrop = {
      ...cropData,
      _id: `crop-${Date.now()}`,
      healthStatus: 'healthy' as const,
      stage: (stage || 'vegetative') as any,
    };
    demoCrops.unshift(newDemoCrop);

    res.status(201).json({ crop: newDemoCrop });
  } catch (error: any) {
    console.error('[Crops] Error creating crop:', error.message);
    res.status(500).json({ error: 'Failed to create crop' });
  }
};

/**
 * PUT /api/crops/:id
 * Update crop details
 */
export const updateCrop = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = user._id ? String(user._id) : 'demo-farmer-001';
    const updates = req.body;

    if (require('mongoose').connection.readyState === 1) {
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        const updated = await Crop.findOneAndUpdate(
          { _id: id, userId },
          { $set: updates },
          { new: true }
        );
        if (updated) {
          res.json({ crop: updated });
          return;
        }
      }
    }

    // Demo store update
    const index = demoCrops.findIndex((c) => c._id === id);
    if (index !== -1) {
      demoCrops[index] = { ...demoCrops[index], ...updates };
      res.json({ crop: demoCrops[index] });
      return;
    }

    res.status(404).json({ error: 'Crop not found' });
  } catch (error: any) {
    console.error('[Crops] Error updating crop:', error.message);
    res.status(500).json({ error: 'Failed to update crop' });
  }
};

/**
 * DELETE /api/crops/:id
 * Delete a crop
 */
export const deleteCrop = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = user._id ? String(user._id) : 'demo-farmer-001';

    if (require('mongoose').connection.readyState === 1) {
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        const deleted = await Crop.findOneAndDelete({ _id: id, userId });
        if (deleted) {
          res.json({ message: 'Crop deleted successfully' });
          return;
        }
      }
    }

    const index = demoCrops.findIndex((c) => c._id === id);
    if (index !== -1) {
      demoCrops.splice(index, 1);
      res.json({ message: 'Crop deleted successfully' });
      return;
    }

    res.status(404).json({ error: 'Crop not found' });
  } catch (error: any) {
    console.error('[Crops] Error deleting crop:', error.message);
    res.status(500).json({ error: 'Failed to delete crop' });
  }
};
