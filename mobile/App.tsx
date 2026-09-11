/**
 * AgriRaksha AI — Root Application Component
 *
 * Full-screen mobile app. No phone mockup. No desktop frame.
 * The app renders edge-to-edge on any device/browser.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './src/i18n';
import { AuthProvider } from './src/context';
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
