import mongoose from 'mongoose';
import { config } from './index';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongodbUri);
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    // In demo mode, continue without DB
    if (config.demoMode) {
      console.warn('[MongoDB] Running in DEMO MODE without database');
    } else {
      process.exit(1);
    }
  }
};
