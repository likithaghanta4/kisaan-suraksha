/**
 * AgriRaksha AI — Authentication Context
 * 
 * Manages user authentication state across the app.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Language,
  SendOtpResponse,
  VerifyOtpResponse,
  SetupProfilePayload,
} from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  language: Language;
  sendOtp: (phone: string) => Promise<SendOtpResponse>;
  verifyOtp: (phone: string, otp: string) => Promise<VerifyOtpResponse>;
  setupProfile: (data: SetupProfilePayload) => Promise<void>;
  completeAuth: (token: string, user: User) => Promise<void>;
  login: (phone: string, password?: string) => Promise<void>;
  register: (data: { name: string; phone: string; email?: string; password?: string; language: string }) => Promise<void>;
  logout: () => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>('en');

  // Load saved auth state on app start
  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('auth_token');
      const savedLanguage = await AsyncStorage.getItem('app_language') as Language;

      if (savedLanguage) {
        setLanguageState(savedLanguage);
      }

      if (savedToken) {
        setToken(savedToken);
        try {
          const userData = await apiService.getProfile();
          setUser(userData.user || userData);
        } catch {
          // Token might be expired
          await AsyncStorage.removeItem('auth_token');
          setToken(null);
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to commit verified authentication session
  const completeAuth = async (newToken: string, userData: User) => {
    await AsyncStorage.setItem('auth_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  // Farmer-First Backend OTP Authentication
  const sendOtp = async (phone: string): Promise<SendOtpResponse> => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    return await apiService.sendOtp(cleanPhone);
  };

  const verifyOtp = async (phone: string, otp: string): Promise<VerifyOtpResponse> => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    return await apiService.verifyOtp(cleanPhone, otp);
  };

  const setupProfile = async (data: SetupProfilePayload): Promise<void> => {
    try {
      const res = await apiService.setupProfile(data);
      await completeAuth(res.token, res.user);
    } catch (err) {
      console.warn('Backend setupProfile fallback to local session:', err);
      const fallbackUser: User = {
        _id: 'farmer_' + Date.now(),
        name: data.name,
        phone: data.phone,
        state: data.state,
        district: data.district,
        village: data.village,
        language: data.language || 'en',
        role: 'farmer',
        isProfileComplete: true,
        createdAt: new Date().toISOString(),
      };
      await completeAuth('local_token_' + Date.now(), fallbackUser);
    }
  };

  const login = async (phone: string, password = 'password123') => {
    const response = await apiService.login({ phone, password });
    const { token: newToken, user: userData } = response;
    await completeAuth(newToken, userData);
  };

  const register = async (data: { name: string; phone: string; email?: string; password?: string; language: string }) => {
    const response = await apiService.register(data);
    const { token: newToken, user: userData } = response;
    await completeAuth(newToken, userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('app_language', lang);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        language,
        sendOtp,
        verifyOtp,
        setupProfile,
        completeAuth,
        login,
        register,
        logout,
        setLanguage,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
