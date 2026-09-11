/**
 * JWT Authentication Middleware
 * 
 * Protects routes by verifying Bearer token.
 * Supports both MongoDB models and in-memory demo fallback.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { config } from '../config';
import User, { IUser } from '../models/User';
import { findDemoUserById } from '../data/demoStore';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };

    if (mongoose.connection.readyState !== 1) {
      const demoUser = findDemoUserById(decoded.userId);
      if (!demoUser) {
        res.status(401).json({ error: 'User not found. Please log in again.' });
        return;
      }
      req.user = demoUser;
      next();
      return;
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found. Please log in again.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Session expired. Please log in again.' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token. Please log in again.' });
      return;
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};
