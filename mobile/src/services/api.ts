/**
 * AgriRaksha AI — API Service Layer
 * 
 * Centralized HTTP client for all backend API calls.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT } from '../constants';
import {
  SendOtpResponse,
  VerifyOtpResponse,
  SetupProfilePayload,
  AuthResponse,
} from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor — attach JWT token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor — handle common errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired — clear auth state
          AsyncStorage.removeItem('auth_token');
        }
        return Promise.reject(error);
      }
    );
  }

  // ---- Farmer-First Mobile + OTP Auth ----
  async sendOtp(phone: string): Promise<SendOtpResponse> {
    const response = await this.client.post('/auth/send-otp', { phone });
    return response.data;
  }

  async verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
    const response = await this.client.post('/auth/verify-otp', { phone, otp });
    return response.data;
  }

  async setupProfile(data: SetupProfilePayload): Promise<AuthResponse> {
    const response = await this.client.post('/auth/setup-profile', data);
    return response.data;
  }

  // ---- Legacy Auth (Preserved for compatibility) ----
  async register(data: { name: string; phone: string; email?: string; password?: string; language: string }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(data: { phone: string; password?: string }) {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async getDashboard() {
    const response = await this.client.get('/dashboard');
    return response.data;
  }

  // ---- Crops ----
  async getCrops() {
    const response = await this.client.get('/crops');
    return response.data;
  }

  async getCrop(id: string) {
    const response = await this.client.get(`/crops/${id}`);
    return response.data;
  }

  async createCrop(data: { cropName: string; variety?: string; area?: string; sowingDate?: string }) {
    const response = await this.client.post('/crops', data);
    return response.data;
  }

  async updateCrop(id: string, data: Partial<{ cropName: string; variety: string; area: string }>) {
    const response = await this.client.put(`/crops/${id}`, data);
    return response.data;
  }

  async deleteCrop(id: string) {
    const response = await this.client.delete(`/crops/${id}`);
    return response.data;
  }

  async runDiagnosis(data: { cropName: string; cropId?: string; sampleType?: string; imageUri?: string }) {
    const response = await this.client.post('/scans/analyze', data);
    return response.data;
  }

  async analyzeCrop(imageUri: string, cropName: string, cropId?: string) {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'crop_image.jpg',
    } as any);
    formData.append('cropName', cropName);
    if (cropId) formData.append('cropId', cropId);

    const response = await this.client.post('/ai/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60s for AI analysis
    });
    return response.data;
  }

  async getScans(filters?: { cropId?: string; limit?: number }) {
    const response = await this.client.get('/scans', { params: filters });
    return response.data;
  }

  async getScan(id: string) {
    const response = await this.client.get(`/scans/${id}`);
    return response.data;
  }

  // ---- Weather ----
  async getWeather(lat?: number, lon?: number, village?: string, district?: string, state?: string) {
    const params: Record<string, any> = {};
    if (lat !== undefined && lon !== undefined) {
      params.lat = lat;
      params.lon = lon;
    }
    if (village) params.village = village;
    if (district) params.district = district;
    if (state) params.state = state;

    const response = await this.client.get('/weather', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return response.data;
  }

  // ---- Risk ----
  async getRisk(cropId?: string) {
    const response = await this.client.get(cropId ? `/weather/risk/${cropId}` : '/weather/risk');
    return response.data;
  }

  // ---- Alerts ----
  async getAlerts() {
    const response = await this.client.get('/alerts');
    return response.data;
  }

  async markAlertRead(id: string) {
    const response = await this.client.post(`/alerts/${id}/read`);
    return response.data;
  }

  // ---- Advisory ----
  async getAdvisory(disease: string) {
    const response = await this.client.get(`/advisories/${encodeURIComponent(disease)}`);
    return response.data;
  }

  // ---- Expert ----
  async createExpertRequest(data: {
    cropId: string;
    imageUrl: string;
    aiPrediction?: string;
    confidence?: number;
    symptoms: string;
    description: string;
  }) {
    const response = await this.client.post('/expert-requests', data);
    return response.data;
  }

  async getExpertRequests() {
    const response = await this.client.get('/expert-requests');
    return response.data;
  }
}

export const apiService = new ApiService();
