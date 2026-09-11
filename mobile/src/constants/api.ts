/**
 * API configuration for the mobile app.
 */

import { Platform } from 'react-native';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api');

export const API_TIMEOUT = 30000; // 30 seconds

export const DEMO_MODE = true;
