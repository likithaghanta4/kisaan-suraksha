/**
 * AgriRaksha AI — App Theme & Design System
 * 
 * Farmer-friendly design: large text, high contrast, clear colors.
 */

export const Colors = {
  // Primary — earthy green for agriculture
  primary: '#2E7D32',
  primaryLight: '#4CAF50',
  primaryDark: '#1B5E20',
  primaryBg: '#E8F5E9',

  // Secondary — warm orange for CTAs
  secondary: '#F57C00',
  secondaryLight: '#FFB74D',
  secondaryDark: '#E65100',

  // Risk levels
  riskLow: '#4CAF50',
  riskModerate: '#FF9800',
  riskHigh: '#F44336',

  // Severity
  severityLow: '#66BB6A',
  severityModerate: '#FFA726',
  severitySevere: '#EF5350',

  // Status
  healthy: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  info: '#2196F3',

  // Confidence
  confidenceHigh: '#4CAF50',
  confidenceMedium: '#FF9800',
  confidenceLow: '#F44336',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E0E0E0',
  divider: '#EEEEEE',

  // Text
  textPrimary: '#212121',
  textSecondary: '#757575',
  textTertiary: '#9E9E9E',
  textLight: '#BDBDBD',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Overlay
  overlay: 'rgba(0,0,0,0.5)',
  shadow: 'rgba(0,0,0,0.1)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  title: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
