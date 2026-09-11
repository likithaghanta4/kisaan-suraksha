/**
 * In-Memory Demo Store for AgriRaksha AI
 * 
 * Provides fallback data storage when MongoDB is not connected,
 * ensuring flawless demo and evaluation experience.
 */

import bcrypt from 'bcryptjs';

export interface DemoUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  passwordHash?: string;
  state?: string;
  district?: string;
  village?: string;
  isProfileComplete?: boolean;
  language: string;
  role: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoCrop {
  _id: string;
  userId: string;
  cropName: string;
  variety: string;
  area: string;
  stage: 'sowing' | 'vegetative' | 'flowering' | 'fruiting' | 'harvesting';
  healthStatus: 'healthy' | 'at_risk' | 'infected';
  sowingDate: Date;
  lastInspectionDate: Date;
  activeDiseases: string[];
}

export interface DemoScan {
  _id: string;
  userId: string;
  cropId?: string;
  cropName: string;
  diseaseName: string;
  diseaseCode: string;
  isHealthy: boolean;
  confidence: number;
  severity: 'low' | 'moderate' | 'severe' | 'none';
  isPest: boolean;
  pestName?: string;
  symptoms: string[];
  organicTreatment: string[];
  chemicalTreatment: string[];
  preventionTips: string[];
  createdAt: Date;
}

// Pre-seeded demo farmer
const defaultPasswordHash = bcrypt.hashSync('password123', 10);

export const demoUsers: DemoUser[] = [
  {
    _id: 'demo-farmer-001',
    name: 'Ramesh Patil',
    phone: '9876543210',
    email: 'ramesh.patil@agriraksha.in',
    passwordHash: defaultPasswordHash,
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Baramati',
    isProfileComplete: true,
    language: 'mr',
    role: 'farmer',
    location: {
      latitude: 18.5204,
      longitude: 73.8567,
      address: 'Baramati, Pune, Maharashtra',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'demo-farmer-002',
    name: 'Suresh Rao',
    phone: '9848012345',
    email: 'suresh.rao@agriraksha.in',
    passwordHash: defaultPasswordHash,
    state: 'Telangana',
    district: 'Warangal',
    village: 'Hanamkonda',
    isProfileComplete: true,
    language: 'te',
    role: 'farmer',
    location: {
      latitude: 17.3850,
      longitude: 78.4867,
      address: 'Warangal, Telangana',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const demoCrops: DemoCrop[] = [
  {
    _id: 'crop-001',
    userId: 'demo-farmer-001',
    cropName: 'Tomato',
    variety: 'Abhinav (Syngenta)',
    area: '2.5 Acres',
    stage: 'flowering',
    healthStatus: 'at_risk',
    sowingDate: new Date(Date.now() - 45 * 86400000),
    lastInspectionDate: new Date(Date.now() - 1 * 86400000),
    activeDiseases: ['Early Blight'],
  },
  {
    _id: 'crop-002',
    userId: 'demo-farmer-001',
    cropName: 'Cotton',
    variety: 'BT Cotton BG-II',
    area: '4.0 Acres',
    stage: 'vegetative',
    healthStatus: 'healthy',
    sowingDate: new Date(Date.now() - 60 * 86400000),
    lastInspectionDate: new Date(Date.now() - 2 * 86400000),
    activeDiseases: [],
  },
  {
    _id: 'crop-003',
    userId: 'demo-farmer-001',
    cropName: 'Soybean',
    variety: 'JS 335',
    area: '3.0 Acres',
    stage: 'fruiting',
    healthStatus: 'healthy',
    sowingDate: new Date(Date.now() - 75 * 86400000),
    lastInspectionDate: new Date(Date.now() - 4 * 86400000),
    activeDiseases: [],
  },
  {
    _id: 'crop-004',
    userId: 'demo-farmer-002',
    cropName: 'Chilli',
    variety: 'Teja Guntur',
    area: '2.0 Acres',
    stage: 'flowering',
    healthStatus: 'healthy',
    sowingDate: new Date(Date.now() - 40 * 86400000),
    lastInspectionDate: new Date(Date.now() - 1 * 86400000),
    activeDiseases: [],
  },
  {
    _id: 'crop-005',
    userId: 'demo-farmer-002',
    cropName: 'Cotton',
    variety: 'Kaveri Jadoo',
    area: '5.0 Acres',
    stage: 'vegetative',
    healthStatus: 'at_risk',
    sowingDate: new Date(Date.now() - 55 * 86400000),
    lastInspectionDate: new Date(Date.now() - 2 * 86400000),
    activeDiseases: ['Pink Bollworm Risk'],
  },
];

export const demoScans: DemoScan[] = [
  {
    _id: 'scan-001',
    userId: 'demo-farmer-001',
    cropId: 'crop-001',
    cropName: 'Tomato',
    diseaseName: 'Early Blight (अल्टरनेरिया करपा)',
    diseaseCode: 'TOM_EB_01',
    isHealthy: false,
    confidence: 0.94,
    severity: 'moderate',
    isPest: false,
    symptoms: [
      'Concentric dark brown rings on lower leaves',
      'Yellow chlorotic halo surrounding lesions',
      'Lower leaves wilting prematurely',
    ],
    organicTreatment: [
      'Spray Neem Oil (Azadirachtin 10000 ppm) @ 2ml/L water',
      'Apply Trichoderma viride bio-fungicide @ 5g/L water in root zone',
      'Remove and burn severely infected lower leaves',
    ],
    chemicalTreatment: [
      'Mancozeb 75% WP @ 2.5g per litre of water',
      'Or Chlorothalonil 75% WP @ 2g per litre of water',
      'Spray in morning hours on clear sunny days',
    ],
    preventionTips: [
      'Avoid overhead sprinkler irrigation to keep foliage dry',
      'Maintain 60cm distance between rows for good aeration',
      'Practice crop rotation with non-solanaceous crops',
    ],
    createdAt: new Date(Date.now() - 1 * 86400000),
  },
  {
    _id: 'scan-002',
    userId: 'demo-farmer-001',
    cropId: 'crop-002',
    cropName: 'Cotton',
    diseaseName: 'Healthy Leaf (निरोगी पान)',
    diseaseCode: 'COT_HL_00',
    isHealthy: true,
    confidence: 0.97,
    severity: 'none',
    isPest: false,
    symptoms: ['Normal leaf coloration', 'No visible spot or fungal growth'],
    organicTreatment: ['Continue routine monitoring every 5-7 days'],
    chemicalTreatment: [],
    preventionTips: ['Ensure balanced NPK nutrition to maintain pest immunity'],
    createdAt: new Date(Date.now() - 3 * 86400000),
  },
];

export const findDemoUserByPhone = (phone: string): DemoUser | undefined => {
  const user = demoUsers.find((u) => u.phone === phone);
  if (user && (!user.location || !user.location.address)) {
    const addr = [user.village, user.district, user.state].filter(Boolean).join(', ');
    if (addr) {
      user.location = {
        latitude: user.location?.latitude || 18.5204,
        longitude: user.location?.longitude || 73.8567,
        address: addr,
      };
    }
  }
  return user;
};

export const findDemoUserById = (id: string): DemoUser | undefined => {
  const user = demoUsers.find((u) => u._id === id);
  if (user && (!user.location || !user.location.address)) {
    const addr = [user.village, user.district, user.state].filter(Boolean).join(', ');
    if (addr) {
      user.location = {
        latitude: user.location?.latitude || 18.5204,
        longitude: user.location?.longitude || 73.8567,
        address: addr,
      };
    }
  }
  return user;
};

export const addDemoUser = (user: Omit<DemoUser, '_id' | 'createdAt' | 'updatedAt'>): DemoUser => {
  const addr = user.location?.address || [user.village, user.district, user.state].filter(Boolean).join(', ');
  const newUser: DemoUser = {
    ...user,
    location: user.location?.address ? user.location : (addr ? {
      latitude: user.location?.latitude || 18.5204,
      longitude: user.location?.longitude || 73.8567,
      address: addr,
    } : user.location),
    _id: `demo-farmer-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  demoUsers.push(newUser);
  return newUser;
};

export const getDemoCropsForUser = (userId: string): DemoCrop[] => {
  return demoCrops.filter((c) => c.userId === userId);
};

export const getDemoScansForUser = (userId: string): DemoScan[] => {
  return demoScans.filter((s) => s.userId === userId);
};
