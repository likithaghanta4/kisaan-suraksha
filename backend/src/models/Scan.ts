/**
 * Scan Model — Mongoose Schema
 * 
 * Stores AI diagnostic scans for leaves/plants with detected disease or pest,
 * confidence score, severity rating, and recommended treatments.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IScan extends Document {
  userId: mongoose.Types.ObjectId | string;
  cropId?: mongoose.Types.ObjectId | string;
  cropName: string;
  imageUrl?: string;
  diseaseName: string;
  diseaseCode?: string;
  isHealthy: boolean;
  confidence: number;
  severity: 'low' | 'moderate' | 'severe' | 'none';
  isPest: boolean;
  pestName?: string;
  symptoms: string[];
  organicTreatment: string[];
  chemicalTreatment: string[];
  preventionTips: string[];
  location?: {
    latitude: number;
    longitude: number;
    district?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const scanSchema = new Schema<IScan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cropId: {
      type: Schema.Types.ObjectId,
      ref: 'Crop',
      index: true,
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    diseaseName: {
      type: String,
      required: true,
      default: 'Healthy Leaf',
    },
    diseaseCode: {
      type: String,
    },
    isHealthy: {
      type: Boolean,
      default: false,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    severity: {
      type: String,
      enum: ['low', 'moderate', 'severe', 'none'],
      default: 'moderate',
    },
    isPest: {
      type: Boolean,
      default: false,
    },
    pestName: {
      type: String,
    },
    symptoms: [
      {
        type: String,
      },
    ],
    organicTreatment: [
      {
        type: String,
      },
    ],
    chemicalTreatment: [
      {
        type: String,
      },
    ],
    preventionTips: [
      {
        type: String,
      },
    ],
    location: {
      latitude: Number,
      longitude: Number,
      district: String,
    },
  },
  {
    timestamps: true,
  }
);

scanSchema.index({ userId: 1, createdAt: -1 });

const Scan = mongoose.model<IScan>('Scan', scanSchema);

export default Scan;
