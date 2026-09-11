/**
 * User Model — Mongoose Schema
 * 
 * Stores farmer profile data with auth credentials.
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  state?: string;
  district?: string;
  village?: string;
  isProfileComplete?: boolean;
  language: string;
  role: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^\d{10,15}$/, 'Please enter a valid phone number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
      select: false,
    },
    state: {
      type: String,
      default: 'Maharashtra',
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    village: {
      type: String,
      trim: true,
    },
    isProfileComplete: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'mr', 'te'],
      default: 'mr',
    },
    role: {
      type: String,
      enum: ['farmer', 'expert', 'admin'],
      default: 'farmer',
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for geo queries
userSchema.index({ location: '2dsphere' });

const User = mongoose.model<IUser>('User', userSchema);

export default User;
