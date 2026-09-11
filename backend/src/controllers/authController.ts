/**
 * Auth Controller — Register, Login, Get Profile
 * 
 * Supports both MongoDB persistence and in-memory demo fallback.
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import { User } from '../models';
import { config } from '../config';
import {
  findDemoUserByPhone,
  findDemoUserById,
  addDemoUser,
  demoUsers,
} from '../data/demoStore';
import {
  requestOtp,
  verifyOtp,
  sanitizePhoneNumber,
  isValidIndianMobile,
} from '../services/otpService';
import { weatherService } from '../services/weatherService';



// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
};

// Validation rules
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\d{10,15}$/)
    .withMessage('Please enter a valid phone number (10-15 digits)'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('language')
    .optional()
    .isIn(['en', 'hi', 'mr', 'te'])
    .withMessage('Supported languages: en, hi, mr, te'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
];

export const loginValidation = [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * POST /api/auth/register
 * Register a new farmer account
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const { name, phone, email, password, language, location } = req.body;

    // Fallback: MongoDB not connected
    if (mongoose.connection.readyState !== 1) {
      const existingDemo = findDemoUserByPhone(phone);
      if (existingDemo) {
        res.status(409).json({ error: 'An account with this phone number already exists.' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newFarmer = addDemoUser({
        name,
        phone,
        email,
        passwordHash,
        language: language || 'en',
        role: 'farmer',
        location,
      });

      const token = generateToken(newFarmer._id);
      res.status(201).json({
        token,
        user: {
          _id: newFarmer._id,
          name: newFarmer.name,
          phone: newFarmer.phone,
          email: newFarmer.email,
          language: newFarmer.language,
          role: newFarmer.role,
          location: newFarmer.location,
          createdAt: newFarmer.createdAt,
        },
      });
      return;
    }

    // Standard MongoDB path
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      res.status(409).json({ error: 'An account with this phone number already exists.' });
      return;
    }

    const user = new User({
      name,
      phone,
      email,
      password,
      language: language || 'en',
      role: 'farmer',
      location,
    });

    await user.save();
    const token = generateToken(String(user._id));

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        language: user.language,
        role: user.role,
        location: user.location,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Register error:', error.message);
    if (error.code === 11000) {
      res.status(409).json({ error: 'An account with this phone number already exists.' });
      return;
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

/**
 * POST /api/auth/login
 * Login with phone and password
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const { phone, password } = req.body;

    // Fallback: MongoDB not connected
    if (mongoose.connection.readyState !== 1) {
      const demoUser = findDemoUserByPhone(phone);
      if (!demoUser) {
        res.status(401).json({ error: 'Invalid phone number or password.' });
        return;
      }
      if (!demoUser.passwordHash) {
        res.status(401).json({ error: 'Please log in with OTP verification.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, demoUser.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid phone number or password.' });
        return;
      }

      const token = generateToken(demoUser._id);
      res.json({
        token,
        user: {
          _id: demoUser._id,
          name: demoUser.name,
          phone: demoUser.phone,
          email: demoUser.email,
          language: demoUser.language,
          role: demoUser.role,
          location: demoUser.location,
          createdAt: demoUser.createdAt,
        },
      });
      return;
    }

    // Standard MongoDB path
    const user = await User.findOne({ phone }).select('+password');
    if (!user) {
      res.status(401).json({ error: 'Invalid phone number or password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid phone number or password.' });
      return;
    }

    const token = generateToken(String(user._id));

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        language: user.language,
        role: user.role,
        location: user.location,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Login error:', error.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

/**
 * GET /api/auth/me
 * Get current user profile (requires auth)
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const formattedAddress =
      user.location?.address ||
      [user.village, user.district, user.state].filter(Boolean).join(', ');

    const userLocation = user.location?.address
      ? user.location
      : (formattedAddress ? {
          latitude: user.location?.latitude || 18.5204,
          longitude: user.location?.longitude || 73.8567,
          address: formattedAddress,
        } : user.location);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        state: user.state || 'Maharashtra',
        district: user.district || '',
        village: user.village || '',
        isProfileComplete: user.isProfileComplete ?? true,
        language: user.language,
        role: user.role,
        location: userLocation,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[Auth] GetMe error:', error.message);
    res.status(500).json({ error: 'Failed to get profile.' });
  }
};

/**
 * POST /api/auth/send-otp
 * Request an OTP for mobile number login
 */
export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ error: 'Please enter a mobile number.' });
      return;
    }

    const sanitizedPhone = sanitizePhoneNumber(phone);
    if (!isValidIndianMobile(sanitizedPhone)) {
      res.status(400).json({
        error: 'Please enter a valid 10-digit Indian mobile number.',
      });
      return;
    }

    // Check if farmer already exists in system
    let existingUser: any = null;
    if (mongoose.connection.readyState === 1) {
      existingUser = await User.findOne({ phone: sanitizedPhone });
    } else {
      existingUser = findDemoUserByPhone(sanitizedPhone);
    }

    const otpResult = await requestOtp(sanitizedPhone);
    if (!otpResult.success) {
      const statusCode = otpResult.cooldownSeconds ? 429 : 400;
      res.status(statusCode).json({
        error: otpResult.message,
        cooldownSeconds: otpResult.cooldownSeconds,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'OTP generated successfully.',
      phone: sanitizedPhone,
      isNewUser: !existingUser,
      expiresInSeconds: otpResult.expiresInSeconds,
      devOtp: otpResult.devOtp,
    });
  } catch (error: any) {
    console.error('[Auth] sendOtp error:', error.message);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
};

/**
 * POST /api/auth/verify-otp
 * Verify 6-digit OTP against PostgreSQL hash and authenticate farmer
 */
export const verifyOtpHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;
    if (!phone) {
      res.status(400).json({ error: 'Mobile number is required.' });
      return;
    }

    if (!otp) {
      res.status(400).json({ error: 'OTP is required.' });
      return;
    }

    const sanitizedPhone = sanitizePhoneNumber(phone);

    // Verify OTP against database
    const verification = await verifyOtp(sanitizedPhone, otp);
    if (!verification.valid) {
      res.status(400).json({ error: verification.error || 'OTP verification failed.' });
      return;
    }


    // Lookup farmer in MongoDB or demoStore
    let user: any = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ phone: sanitizedPhone });
    } else {
      user = findDemoUserByPhone(sanitizedPhone);
    }

    // Existing Farmer: Create session and return JWT token
    if (user) {
      const token = generateToken(String(user._id));
      const formattedAddress =
        user.location?.address ||
        [user.village, user.district, user.state].filter(Boolean).join(', ');

      const userLocation = user.location?.address
        ? user.location
        : (formattedAddress ? {
            latitude: user.location?.latitude || 18.5204,
            longitude: user.location?.longitude || 73.8567,
            address: formattedAddress,
          } : user.location);

      res.status(200).json({
        success: true,
        isNewUser: false,
        token,
        user: {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          state: user.state || 'Maharashtra',
          district: user.district || '',
          village: user.village || '',
          language: user.language || 'mr',
          role: user.role || 'farmer',
          location: userLocation,
          isProfileComplete: user.isProfileComplete ?? true,
          createdAt: user.createdAt,
        },
      });
      return;
    }

    // New Farmer: Verified mobile number, prompt for first-time profile setup
    res.status(200).json({
      success: true,
      isNewUser: true,
      phone: sanitizedPhone,
      message: 'Mobile number verified successfully. Please complete your profile.',
    });
  } catch (error: any) {
    console.error('[Auth] verifyOtpHandler error:', error.message);
    res.status(500).json({ error: 'Failed to verify authentication. Please try again.' });
  }
};

/**
 * POST /api/auth/setup-profile
 * First-time profile setup for new farmers after OTP verification
 */
export const setupProfileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, name, state, district, village, language } = req.body;

    if (!phone || !name || !district) {
      res.status(400).json({ error: 'Name, phone number, and district are required.' });
      return;
    }

    const sanitizedPhone = sanitizePhoneNumber(phone);
    const cleanState = state?.trim() || 'Maharashtra';
    const cleanDistrict = district.trim();
    const cleanVillage = village?.trim() || undefined;

    // Geocode farmer village / district / state to exact coordinates
    const geo = await weatherService.geocodeLocation(cleanVillage, cleanDistrict, cleanState);
    const userLocation = {
      latitude: geo.latitude,
      longitude: geo.longitude,
      address: geo.locationName || [cleanVillage, cleanDistrict, cleanState].filter(Boolean).join(', '),
    };

    // Fallback: MongoDB not connected -> Demo Store
    if (mongoose.connection.readyState !== 1) {
      let existingDemo = findDemoUserByPhone(sanitizedPhone);
      if (existingDemo) {
        // Update existing record rather than failing
        existingDemo.name = name.trim();
        existingDemo.state = cleanState;
        existingDemo.district = cleanDistrict;
        existingDemo.village = cleanVillage;
        existingDemo.language = language || 'mr';
        existingDemo.isProfileComplete = true;
        existingDemo.location = userLocation;

        const token = generateToken(existingDemo._id);
        res.status(200).json({
          success: true,
          token,
          user: existingDemo,
        });
        return;
      }

      const newDemo = addDemoUser({
        name: name.trim(),
        phone: sanitizedPhone,
        state: cleanState,
        district: cleanDistrict,
        village: cleanVillage,
        language: language || 'mr',
        role: 'farmer',
        isProfileComplete: true,
        location: userLocation,
      });

      const token = generateToken(newDemo._id);
      res.status(201).json({
        success: true,
        token,
        user: newDemo,
      });
      return;
    }

    // Standard MongoDB path
    let user = await User.findOne({ phone: sanitizedPhone });
    if (user) {
      // Update existing record
      user.name = name.trim();
      user.state = cleanState;
      user.district = cleanDistrict;
      user.village = cleanVillage;
      user.language = language || 'mr';
      user.isProfileComplete = true;
      user.location = userLocation;
      await user.save();
    } else {
      user = new User({
        name: name.trim(),
        phone: sanitizedPhone,
        state: cleanState,
        district: cleanDistrict,
        village: cleanVillage,
        language: language || 'mr',
        role: 'farmer',
        isProfileComplete: true,
        location: userLocation,
      });
      await user.save();
    }

    const token = generateToken(String(user._id));
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        state: user.state,
        district: user.district,
        village: user.village,
        language: user.language,
        role: user.role,
        location: user.location,
        isProfileComplete: user.isProfileComplete,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[Auth] setupProfileHandler error:', error.message);
    res.status(500).json({ error: 'Failed to complete profile setup. Please try again.' });
  }
};

