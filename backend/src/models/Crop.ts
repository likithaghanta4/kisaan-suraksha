/**
 * Crop Model — Mongoose Schema
 * 
 * Tracks farmer's registered crops and current health status.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ICrop extends Document {
  userId: mongoose.Types.ObjectId | string;
  cropName: string;
  variety?: string;
  area?: string; // e.g. "3 Acres"
  sowingDate?: Date;
  stage: 'sowing' | 'vegetative' | 'flowering' | 'fruiting' | 'harvesting';
  healthStatus: 'healthy' | 'at_risk' | 'infected';
  lastInspectionDate?: Date;
  activeDiseases?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const cropSchema = new Schema<ICrop>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    variety: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
      default: '1 Acre',
    },
    sowingDate: {
      type: Date,
      default: Date.now,
    },
    stage: {
      type: String,
      enum: ['sowing', 'vegetative', 'flowering', 'fruiting', 'harvesting'],
      default: 'vegetative',
    },
    healthStatus: {
      type: String,
      enum: ['healthy', 'at_risk', 'infected'],
      default: 'healthy',
    },
    lastInspectionDate: {
      type: Date,
      default: Date.now,
    },
    activeDiseases: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

cropSchema.index({ userId: 1, cropName: 1 });

const Crop = mongoose.model<ICrop>('Crop', cropSchema);

export default Crop;
