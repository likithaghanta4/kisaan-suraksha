/**
 * AgriRaksha AI — Firebase Client Configuration
 * 
 * Initializes Firebase Authentication for Phone / SMS OTP login.
 * Values are loaded from environment variables with sensible defaults.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: (process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '').trim(),
  authDomain: (process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'agriraksha-ai.firebaseapp.com').trim(),
  projectId: (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'agriraksha-ai').trim(),
  storageBucket: (process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'agriraksha-ai.appspot.com').trim(),
  messagingSenderId: (process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
  appId: (process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '').trim(),
};

// Check if valid API key is configured
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.startsWith('AIzaSyPlaceholder') &&
    firebaseConfig.apiKey.length > 10
  );
};

// Initialize Firebase App singleton
const app = getApps().length === 0
  ? initializeApp(
      firebaseConfig.apiKey
        ? firebaseConfig
        : { ...firebaseConfig, apiKey: 'AIzaSyPlaceholderAgriRaksha2026' }
    )
  : getApp();

// Export Firebase Auth instance
export const auth = getAuth(app);

export default app;
