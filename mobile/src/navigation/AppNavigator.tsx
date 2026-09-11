/**
 * AgriRaksha AI — Main Navigation Configuration
 * 
 * Stack Navigator:
 * - Auth Flow: Splash, LanguageSelect, Onboarding, Login, Register
 * - Main Flow: MainTabs, AddCrop, CropDetail, DiagnosisResult
 * Bottom Tabs:
 * - Home, Scan (ScanScreen), My Crops, Alerts, More
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../context';
import { Colors, FontSizes } from '../constants';

// Screens
import {
  SplashScreen,
  WelcomeScreen,
  LanguageSelectScreen,
  OnboardingScreen,
  LoginScreen,
  OtpScreen,
  ProfileSetupScreen,
  HomeScreen,
  MyCropsScreen,
  AddCropScreen,
  CropDetailScreen,
  ScanScreen,
  DiagnosisResultScreen,
  AlertsScreen,
  MoreScreen,
} from '../screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon component with active green indicator
const TabIcon: React.FC<{ icon: string; focused: boolean }> = ({ icon, focused }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.65 }}>{icon}</Text>
    {focused && (
      <View
        style={{
          width: 24,
          height: 3,
          backgroundColor: '#1E5E2E',
          borderRadius: 2,
          marginTop: 2,
        }}
      />
    )}
  </View>
);

// Elevated center camera button matching reference design
const CenterScanButton: React.FC<{ focused: boolean }> = () => (
  <View
    style={{
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: '#1B4725',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -20,
      elevation: 8,
      shadowColor: '#0A2E12',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      borderWidth: 3.5,
      borderColor: '#FFFFFF',
    }}
  >
    <Text style={{ fontSize: 22 }}>📷</Text>
  </View>
);

// Bottom Tab Navigator
const MainTabs: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1E5E2E',
        tabBarInactiveTintColor: '#7A917C',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: -2,
        },
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(200, 230, 200, 0.7)',
          elevation: 20,
          shadowColor: '#0A2E12',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MyCropsTab"
        component={MyCropsScreen}
        options={{
          tabBarLabel: 'My Crops',
          tabBarIcon: ({ focused }) => <TabIcon icon="🌱" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ScanTab"
        component={ScanScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <CenterScanButton focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AlertsTab"
        component={AlertsScreen}
        options={{
          tabBarLabel: 'Advisory',
          tabBarIcon: ({ focused }) => <TabIcon icon="📑" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {isLoading ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : !isAuthenticated ? (
        // Auth flow: Splash → Welcome → LanguageSelect → Login → OTP → ProfileSetup
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Otp" component={OtpScreen} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </>
      ) : (
        // Authenticated screens
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
          <Stack.Screen name="AddCrop" component={AddCropScreen} />
          <Stack.Screen name="CropDetail" component={CropDetailScreen} />
          <Stack.Screen name="DiagnosisResult" component={DiagnosisResultScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
