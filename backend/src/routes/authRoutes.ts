/**
 * Auth Routes
 */

import { Router } from 'express';
import {
  register,
  login,
  getMe,
  sendOtp,
  verifyOtpHandler,
  setupProfileHandler,
  registerValidation,
  loginValidation,
} from '../controllers/authController';
import { authMiddleware } from '../middleware';

const router = Router();

// ---- Farmer-First Mobile + OTP Auth ----
// POST /api/auth/send-otp
router.post('/send-otp', sendOtp);

// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOtpHandler);

// POST /api/auth/setup-profile
router.post('/setup-profile', setupProfileHandler);

// ---- Legacy Auth (Preserved for compatibility) ----
// POST /api/auth/register
router.post('/register', registerValidation, register);

// POST /api/auth/login
router.post('/login', loginValidation, login);

// GET /api/auth/me (protected)
router.get('/me', authMiddleware, getMe);

export default router;
