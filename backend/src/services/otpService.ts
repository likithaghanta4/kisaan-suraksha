/**
 * AgriRaksha AI — OTP Service
 * 
 * Secure OTP generation, hashing, database persistence, and verification helper.
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query, isPostgresAvailable } from '../config/postgres';

// Security configuration
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds

// In-memory fallback structure (stores ONLY hashed OTPs, used if PostgreSQL is temporarily offline)
interface SecureOtpMemoryRecord {
  mobileNumber: string;
  otpHash: string;
  expiresAt: number;
  attempts: number;
  verifiedAt: number | null;
  createdAt: number;
}

const secureMemoryStore = new Map<string, SecureOtpMemoryRecord>();

/**
 * Sanitize an Indian phone number to 10 digits
 */
export const sanitizePhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits.slice(-10);
};

/**
 * Validate standard Indian mobile number (10 digits starting with 6, 7, 8, or 9)
 */
export const isValidIndianMobile = (phone: string): boolean => {
  const sanitized = sanitizePhoneNumber(phone);
  return /^[6-9]\d{9}$/.test(sanitized);
};

/**
 * Generate a cryptographically secure random 6-digit OTP string
 */
export const generateSecureOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Request and generate a secure 6-digit OTP for the farmer's mobile number
 */
export const requestOtp = async (
  phone: string
): Promise<{
  success: boolean;
  message: string;
  expiresInSeconds: number;
  cooldownSeconds?: number;
  devOtp?: string;
}> => {
  const sanitizedPhone = sanitizePhoneNumber(phone);

  if (!isValidIndianMobile(sanitizedPhone)) {
    return {
      success: false,
      message: 'Please enter a valid 10-digit Indian mobile number.',
      expiresInSeconds: 0,
    };
  }

  const now = Date.now();
  const postgresReady = isPostgresAvailable();

  // 1. Check for active resend cooldown
  if (postgresReady) {
    try {
      const recentOtpResult = await query(
        `SELECT created_at, expires_at 
         FROM otp_verifications 
         WHERE mobile_number = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [sanitizedPhone]
      );

      if (recentOtpResult && recentOtpResult.rows.length > 0) {
        const lastCreatedAt = new Date(recentOtpResult.rows[0].created_at).getTime();
        const elapsed = now - lastCreatedAt;
        if (elapsed < RESEND_COOLDOWN_MS) {
          const remainingCooldown = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
          return {
            success: false,
            message: `Please wait ${remainingCooldown} seconds before requesting a new OTP.`,
            expiresInSeconds: Math.ceil(
              (new Date(recentOtpResult.rows[0].expires_at).getTime() - now) / 1000
            ),
            cooldownSeconds: remainingCooldown,
          };
        }
      }
    } catch (err: any) {
      console.warn('[OTP Service] Cooldown check DB warning:', err.message);
    }
  } else {
    // Memory store cooldown check
    const existing = secureMemoryStore.get(sanitizedPhone);
    if (existing && now - existing.createdAt < RESEND_COOLDOWN_MS) {
      const remainingCooldown = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.createdAt)) / 1000);
      return {
        success: false,
        message: `Please wait ${remainingCooldown} seconds before requesting a new OTP.`,
        expiresInSeconds: Math.ceil((existing.expiresAt - now) / 1000),
        cooldownSeconds: remainingCooldown,
      };
    }
  }

  // 2. Generate cryptographically secure random 6-digit OTP
  const rawOtp = generateSecureOtp();

  // 3. Hash OTP before storing (never store plaintext OTP in database)
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(rawOtp, salt);
  const expiresAtDate = new Date(now + OTP_EXPIRY_MS);

  // 4. Invalidate previous unverified OTPs and persist new OTP hash in PostgreSQL
  if (postgresReady) {
    try {
      // Invalidate existing active OTPs for this phone number
      await query(
        `UPDATE otp_verifications 
         SET verified_at = NOW() 
         WHERE mobile_number = $1 AND verified_at IS NULL`,
        [sanitizedPhone]
      );

      // Insert fresh OTP record
      await query(
        `INSERT INTO otp_verifications (mobile_number, otp_hash, expires_at, attempts, created_at)
         VALUES ($1, $2, $3, 0, NOW())`,
        [sanitizedPhone, otpHash, expiresAtDate]
      );
    } catch (dbErr: any) {
      console.error('[OTP Service] Error saving OTP to PostgreSQL:', dbErr.message);
      // Fallback to memory store
      secureMemoryStore.set(sanitizedPhone, {
        mobileNumber: sanitizedPhone,
        otpHash,
        expiresAt: now + OTP_EXPIRY_MS,
        attempts: 0,
        verifiedAt: null,
        createdAt: now,
      });
    }
  } else {
    secureMemoryStore.set(sanitizedPhone, {
      mobileNumber: sanitizedPhone,
      otpHash,
      expiresAt: now + OTP_EXPIRY_MS,
      attempts: 0,
      verifiedAt: null,
      createdAt: now,
    });
  }

  const isDev = process.env.NODE_ENV !== 'production';

  return {
    success: true,
    message: 'OTP generated successfully.',
    expiresInSeconds: OTP_EXPIRY_MS / 1000,
    devOtp: isDev ? rawOtp : undefined,
  };
};

/**
 * Verify OTP entered by farmer against the hashed record in PostgreSQL
 */
export const verifyOtp = async (
  phone: string,
  inputOtp: string
): Promise<{ valid: boolean; error?: string }> => {
  const sanitizedPhone = sanitizePhoneNumber(phone);
  const cleanInput = (inputOtp || '').trim();

  if (!cleanInput || cleanInput.length !== 6 || !/^\d{6}$/.test(cleanInput)) {
    return {
      valid: false,
      error: 'Please enter a valid 6-digit OTP.',
    };
  }

  const now = new Date();
  const postgresReady = isPostgresAvailable();

  if (postgresReady) {
    try {
      // Find latest unverified OTP record for this mobile number
      const otpQuery = await query(
        `SELECT id, otp_hash, expires_at, attempts, verified_at 
         FROM otp_verifications 
         WHERE mobile_number = $1 AND verified_at IS NULL 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [sanitizedPhone]
      );

      if (!otpQuery || otpQuery.rows.length === 0) {
        return {
          valid: false,
          error: 'OTP has expired or was not requested. Please request a new OTP.',
        };
      }

      const record = otpQuery.rows[0];

      // Check 1: Expiry check
      if (new Date(record.expires_at).getTime() < now.getTime()) {
        await query(
          `UPDATE otp_verifications SET verified_at = NOW() WHERE id = $1`,
          [record.id]
        );
        return {
          valid: false,
          error: 'OTP has expired. Please request a new OTP.',
        };
      }

      // Check 2: Max attempts check
      if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
        await query(
          `UPDATE otp_verifications SET verified_at = NOW() WHERE id = $1`,
          [record.id]
        );
        return {
          valid: false,
          error: 'Maximum verification attempts exceeded. Please request a new OTP.',
        };
      }

      // Check 3: Compare OTP hash
      const isMatch = await bcrypt.compare(cleanInput, record.otp_hash);

      if (!isMatch) {
        const updatedAttempts = record.attempts + 1;
        await query(
          `UPDATE otp_verifications SET attempts = $1 WHERE id = $2`,
          [updatedAttempts, record.id]
        );

        const remaining = MAX_VERIFY_ATTEMPTS - updatedAttempts;
        return {
          valid: false,
          error: remaining > 0
            ? `Invalid OTP. Please check and try again. (${remaining} attempts remaining)`
            : 'Maximum verification attempts exceeded. Please request a new OTP.',
        };
      }

      // Check 4: Success — Single-use invalidation
      await query(
        `UPDATE otp_verifications SET verified_at = NOW() WHERE id = $1`,
        [record.id]
      );

      return { valid: true };
    } catch (err: any) {
      console.error('[OTP Service] DB verification error, falling back:', err.message);
    }
  }

  // Memory fallback verification
  const memoryRecord = secureMemoryStore.get(sanitizedPhone);
  if (!memoryRecord || memoryRecord.verifiedAt !== null) {
    return {
      valid: false,
      error: 'OTP has expired or was not requested. Please request a new OTP.',
    };
  }

  if (Date.now() > memoryRecord.expiresAt) {
    secureMemoryStore.delete(sanitizedPhone);
    return {
      valid: false,
      error: 'OTP has expired. Please request a new OTP.',
    };
  }

  if (memoryRecord.attempts >= MAX_VERIFY_ATTEMPTS) {
    secureMemoryStore.delete(sanitizedPhone);
    return {
      valid: false,
      error: 'Maximum verification attempts exceeded. Please request a new OTP.',
    };
  }

  const isMatch = await bcrypt.compare(cleanInput, memoryRecord.otpHash);
  if (!isMatch) {
    memoryRecord.attempts += 1;
    const remaining = MAX_VERIFY_ATTEMPTS - memoryRecord.attempts;
    return {
      valid: false,
      error: remaining > 0
        ? `Invalid OTP. Please check and try again. (${remaining} attempts remaining)`
        : 'Maximum verification attempts exceeded. Please request a new OTP.',
    };
  }

  // Single-use mark
  memoryRecord.verifiedAt = Date.now();
  secureMemoryStore.delete(sanitizedPhone);

  return { valid: true };
};

export default {
  sanitizePhoneNumber,
  isValidIndianMobile,
  generateSecureOtp,
  requestOtp,
  verifyOtp,
};
