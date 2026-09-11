/**
 * AgriRaksha AI — Core TypeScript Types
 */

// ---- User / Auth ----
export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  state?: string;
  district?: string;
  village?: string;
  isProfileComplete?: boolean;
  language: Language;
  role: 'farmer';
  location?: Location;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  phone: string;
  isNewUser: boolean;
  expiresInSeconds: number;
  devOtp?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  isNewUser: boolean;
  phone?: string;
  token?: string;
  user?: User;
  message?: string;
}

export interface SetupProfilePayload {
  phone: string;
  name: string;
  state?: string;
  district: string;
  village?: string;
  language: Language;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  language: Language;
  location?: Location;
}

export interface LoginPayload {
  phone: string;
  password?: string;
}

// ---- Language ----
export type Language = 'en' | 'hi' | 'mr' | 'te';

// ---- Location ----
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// ---- Crop ----
export interface Crop {
  _id: string;
  userId: string;
  cropName: string;
  variety?: string;
  area?: string;
  location?: Location;
  sowingDate?: string;
  healthStatus: HealthStatus;
  riskLevel: RiskLevel;
  lastScanDate?: string;
  createdAt: string;
}

export interface CreateCropPayload {
  cropName: string;
  variety?: string;
  area?: string;
  location?: Location;
  sowingDate?: string;
}

// ---- Scan / Prediction ----
export interface CropScan {
  _id: string;
  userId: string;
  cropId: string;
  imageUrl: string;
  cropName: string;
  disease?: DiseasePrediction;
  pests?: PestPrediction[];
  severity?: SeverityResult;
  riskScore: number;
  riskLevel: RiskLevel;
  weatherSnapshot?: WeatherData;
  createdAt: string;
}

export interface DiseasePrediction {
  disease: string;
  confidence: number;
  description: string;
}

export interface PestPrediction {
  pest: string;
  confidence: number;
  bbox?: number[];
}

export interface SeverityResult {
  severity: SeverityLevel;
  affectedAreaPercentage: number;
  description: string;
}

export interface AnalysisResult {
  crop: string;
  disease?: DiseasePrediction;
  pests?: PestPrediction[];
  severity?: SeverityResult;
  riskScore: number;
  riskLevel: RiskLevel;
  weather?: WeatherData;
  modelMode: string;
}

// ---- Weather ----
export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  description: string;
  icon?: string;
}

// ---- Risk ----
export interface RiskAssessment {
  riskScore: number;
  riskLevel: RiskLevel;
  explanation: string;
  factors: string[];
}

// ---- Alerts ----
export interface Alert {
  _id: string;
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  cropId?: string;
  isRead: boolean;
  createdAt: string;
}

export type AlertType =
  | 'disease_risk'
  | 'pest_risk'
  | 'outbreak_signal'
  | 'monitoring_reminder'
  | 'scan_reminder';

// ---- Expert ----
export interface ExpertRequest {
  _id: string;
  userId: string;
  cropId: string;
  imageUrl: string;
  aiPrediction?: string;
  confidence?: number;
  symptoms: string;
  description: string;
  status: ExpertRequestStatus;
  response?: string;
  createdAt: string;
}

export type ExpertRequestStatus = 'pending' | 'under_review' | 'resolved';

// ---- Enums ----
export type HealthStatus = 'healthy' | 'monitor' | 'attention_required';
export type RiskLevel = 'low' | 'moderate' | 'high';
export type SeverityLevel = 'Low' | 'Moderate' | 'Severe';

// ---- Advisory ----
export interface Advisory {
  disease: string;
  cropName: string;
  immediateActions: string[];
  prevention: string[];
  monitoring: string[];
  management: string[];
  chemicalManagement: string[];
  disclaimer: string;
}

// ---- Navigation ----
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  LanguageSelect: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  CropDetail: { cropId: string };
  AddCrop: undefined;
  EditCrop: { cropId: string };
  ScanCrop: { cropId?: string };
  ImagePreview: { imageUri: string; cropId?: string; cropName?: string };
  Analyzing: { imageUri: string; cropId?: string; cropName: string };
  AnalysisResult: { result: AnalysisResult; cropId?: string };
  DiseaseDetail: { disease: DiseasePrediction; cropName: string };
  PestDetail: { pest: PestPrediction; cropName: string };
  Advisory: { disease: string; cropName: string };
  Weather: { location?: Location };
  ScanHistory: undefined;
  CropHealthHistory: { cropId: string; cropName: string };
  ExpertRequest: { scanId?: string; cropId?: string };
  ExpertRequestDetail: { requestId: string };
  Profile: undefined;
  Settings: undefined;
};
