/**
 * API configuration for the mobile app.
 */

import { Platform } from 'react-native';

// Default to localhost for development
// Android emulator needs 10.0.2.2, while Web/iOS needs localhost
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// For physical device testing, use your computer's IP:
// export const API_BASE_URL = 'http://192.168.x.x:5000/api';

export const API_TIMEOUT = 30000; // 30 seconds

export const DEMO_MODE = true;
