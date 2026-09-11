/**
 * Placeholder screens — will be fully built in later modules.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing } from '../constants';

// Generic placeholder component
const PlaceholderScreen: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>Coming soon</Text>
  </View>
);

export const MyCropsScreen = () => <PlaceholderScreen title="My Crops" icon="🌱" />;
export const ScanCropScreen = () => <PlaceholderScreen title="Scan Crop" icon="📷" />;
export const AlertsScreen = () => <PlaceholderScreen title="Alerts" icon="🚨" />;
export const MoreScreen = () => <PlaceholderScreen title="More" icon="👤" />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});
