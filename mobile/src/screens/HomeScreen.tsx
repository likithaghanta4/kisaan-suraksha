/**
 * AgriRaksha AI — Screen: Home Dashboard
 * 
 * Consistent with the AgriRaksha AI design system and navigation:
 * - Unified realistic Indian agricultural landscape background with dark green overlay
 * - Standard React Navigation bottom navigation (Home, My Crops, Scan, Advisory, Profile)
 * - Header with AgriRaksha AI branding, Language selector, Notification bell, and Farmer Profile pill
 * - Farmer Greeting & Location row
 * - Real-time Weather Summary card (Temp, Condition, Humidity, Wind, Spray Status)
 * - Main Agricultural Banner: "Healthy Crops, Stronger Farmers — AI-powered crop protection"
 * - 4 Quick Actions (My Crops, Scan & Diagnose, Weather, Advisory)
 * - 6 Farm Tools (My Crops, Scan & Diagnose, Weather, Farm Risk, KVK Expert, Govt Schemes)
 * - No extra unrelated sections, fully responsive on desktop & mobile
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ImageBackground,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context';
import { apiService } from '../services/api';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 880;

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await apiService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.warn('Dashboard fetch error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const unsubscribe = navigation?.addListener
      ? navigation.addListener('focus', () => {
          fetchDashboard();
        })
      : undefined;
    return unsubscribe;
  }, [fetchDashboard, navigation]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboard();
  };

  const farmerName = user?.name || 'Likitha';
  const userAddress =
    user?.location?.address ||
    [user?.village, user?.district, user?.state].filter(Boolean).join(', ') ||
    [user?.district, user?.state].filter(Boolean).join(', ') ||
    'kamavarapukota, Eluru, Andhra Pradesh';

  const userInitials = (farmerName || 'LK')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const currentLangLabel =
    i18n.language === 'hi'
      ? 'English'
      : i18n.language === 'mr'
      ? 'मराठी'
      : i18n.language === 'te'
      ? 'తెలుగు'
      : 'English';

  const temp = dashboardData?.weather?.temp !== undefined ? dashboardData.weather.temp : 28;
  const condition = dashboardData?.weather?.condition || 'Partly Cloudy';
  const weatherIcon = dashboardData?.weather?.icon || '⛅';
  const humidity = dashboardData?.weather?.humidity !== undefined ? dashboardData.weather.humidity : 62;
  const wind = dashboardData?.weather?.windSpeed !== undefined ? dashboardData.weather.windSpeed : (dashboardData?.weather?.wind || '--');
  const isSpraySafe = dashboardData?.weather?.sprayAdvisory?.isSafe !== false;
  const sprayBadge = isSpraySafe ? 'Safe Window' : 'Avoid Spray';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Realistic Indian Agricultural Background */}
      <ImageBackground
        source={require('../../assets/crop_diagnostic_bg.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <View style={styles.bgOverlay} />

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 10, Platform.OS === 'web' ? 16 : 36),
              paddingBottom: Math.max(insets.bottom + 85, 95),
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#69F0AE"
              colors={['#2E7D32']}
            />
          }
        >
          <View style={styles.contentWrapper}>
            {/* 1. TOP HEADER BAR */}
            <View style={styles.headerBar}>
              {/* Branding */}
              <View style={styles.brandGroup}>
                <Image
                  source={require('../../assets/agriraksha_logo_clean.png')}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
                <View style={styles.brandTextBox}>
                  <Text style={styles.brandTitle}>Kisaan Suraksha</Text>
                  <Text style={styles.brandSubtitle}>Healthy Crops | Prosperous Farmers</Text>
                </View>
              </View>

              {/* Header Right Controls */}
              <View style={styles.headerRightControls}>
                {/* Language Dropdown */}
                <TouchableOpacity
                  style={styles.headerPillBtn}
                  onPress={() => navigation.navigate('LanguageSelect', { fromSettings: true })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.headerPillText}>{currentLangLabel} ▼</Text>
                </TouchableOpacity>

                {/* Notifications Bell */}
                <TouchableOpacity
                  style={styles.bellBtn}
                  onPress={() => navigation.navigate('AlertsTab')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.bellIcon}>🔔</Text>
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>1</Text>
                  </View>
                </TouchableOpacity>

                {/* Profile Pill */}
                <TouchableOpacity
                  style={styles.profilePill}
                  onPress={() => navigation.navigate('MoreTab')}
                  activeOpacity={0.8}
                >
                  <View style={styles.profileInitialsCircle}>
                    <Text style={styles.profileInitialsText}>{userInitials}</Text>
                  </View>
                  <Text style={styles.profileNameText} numberOfLines={1}>
                    {farmerName} ▼
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. GREETING & LOCATION ROW */}
            <View style={styles.greetingRow}>
              <View style={styles.farmerGreetingCard}>
                <View style={styles.farmerAvatarCircle}>
                  <Text style={styles.farmerAvatarEmoji}>🧑‍🌾</Text>
                </View>
                <View style={styles.greetingInfo}>
                  <Text style={styles.greetingTitle}>Hello, {farmerName}! 👋</Text>
                  <View style={styles.locationPill}>
                    <Text style={styles.locationPin}>📍</Text>
                    <Text style={styles.locationAddressText} numberOfLines={1}>
                      {userAddress}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 3. WEATHER SUMMARY CARD */}
            <View style={styles.weatherCard}>
              <View style={styles.weatherTempSection}>
                <Text style={styles.weatherSunIcon}>{weatherIcon}</Text>
                <View style={styles.weatherTempTextBox}>
                  <Text style={styles.weatherTempText}>{temp}°C</Text>
                  <Text style={styles.weatherConditionText}>{condition}</Text>
                </View>
              </View>

              <View style={styles.weatherDivider} />

              <View style={styles.weatherMetricBox}>
                <Text style={styles.metricIcon}>💧</Text>
                <View style={styles.metricTextColumn}>
                  <Text style={styles.metricLabel}>Humidity</Text>
                  <Text style={styles.metricValue}>{humidity}%</Text>
                </View>
              </View>

              <View style={styles.weatherDivider} />

              <View style={styles.weatherMetricBox}>
                <Text style={styles.metricIcon}>💨</Text>
                <View style={styles.metricTextColumn}>
                  <Text style={styles.metricLabel}>Wind</Text>
                  <Text style={styles.metricValue}>{wind} km/h</Text>
                </View>
              </View>

              <View style={styles.weatherDivider} />

              <View style={styles.weatherMetricBox}>
                <Text style={styles.metricIcon}>🌱</Text>
                <View style={styles.metricTextColumn}>
                  <Text style={styles.metricLabel}>Spray Status</Text>
                  <Text style={isSpraySafe ? styles.metricValueSafe : styles.metricValueAvoid}>
                    {sprayBadge}
                  </Text>
                </View>
              </View>
            </View>

            {/* 4. MAIN AGRICULTURAL HERO BANNER */}
            <View style={styles.heroBanner}>
              <View style={styles.heroBannerContent}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeIcon}>🌿</Text>
                  <Text style={styles.heroBadgeText}>AI-Powered Crop Protection</Text>
                </View>
                <Text style={styles.heroTitle}>Healthy Crops, Stronger Farmers</Text>
                <Text style={styles.heroSubtitle}>
                  Real-time pest detection, 5-day weather radar & personalized scientist advice for your farm.
                </Text>
              </View>
            </View>

            {/* 5. QUICK ACTIONS SECTION */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>

            <View style={isDesktop ? styles.quickActionsGridDesktop : styles.quickActionsGridMobile}>
              {/* Action 1: My Crops */}
              <TouchableOpacity
                style={[styles.quickActionCard, { backgroundColor: '#E8F8EC' }]}
                onPress={() => navigation.navigate('MyCropsTab')}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconBadge, { backgroundColor: '#C8E6C9' }]}>
                  <Text style={styles.actionEmoji}>🌱</Text>
                </View>
                <View style={styles.actionTextColumn}>
                  <Text style={styles.actionTitle}>My Crops</Text>
                  <Text style={styles.actionSubtitle}>View and manage registered crops</Text>
                </View>
                <View style={[styles.actionArrowCircle, { backgroundColor: '#2E7D32' }]}>
                  <Text style={styles.actionArrowText}>→</Text>
                </View>
              </TouchableOpacity>

              {/* Action 2: Scan & Diagnose */}
              <TouchableOpacity
                style={[styles.quickActionCard, { backgroundColor: '#FFF8E1' }]}
                onPress={() => navigation.navigate('ScanTab')}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconBadge, { backgroundColor: '#FFE082' }]}>
                  <Text style={styles.actionEmoji}>📷</Text>
                </View>
                <View style={styles.actionTextColumn}>
                  <Text style={styles.actionTitle}>Scan & Diagnose</Text>
                  <Text style={styles.actionSubtitle}>Identify pests & diseases with AI</Text>
                </View>
                <View style={[styles.actionArrowCircle, { backgroundColor: '#F57F17' }]}>
                  <Text style={styles.actionArrowText}>→</Text>
                </View>
              </TouchableOpacity>

              {/* Action 3: Weather */}
              <TouchableOpacity
                style={[styles.quickActionCard, { backgroundColor: '#E1F5FE' }]}
                onPress={() => navigation.navigate('AlertsTab')}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconBadge, { backgroundColor: '#B3E5FC' }]}>
                  <Text style={styles.actionEmoji}>🌦️</Text>
                </View>
                <View style={styles.actionTextColumn}>
                  <Text style={styles.actionTitle}>Weather</Text>
                  <Text style={styles.actionSubtitle}>5-day forecast & spray suitability</Text>
                </View>
                <View style={[styles.actionArrowCircle, { backgroundColor: '#0288D1' }]}>
                  <Text style={styles.actionArrowText}>→</Text>
                </View>
              </TouchableOpacity>

              {/* Action 4: Advisory */}
              <TouchableOpacity
                style={[styles.quickActionCard, { backgroundColor: '#F3E5F5' }]}
                onPress={() => navigation.navigate('AlertsTab')}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconBadge, { backgroundColor: '#E1BEE7' }]}>
                  <Text style={styles.actionEmoji}>📄</Text>
                </View>
                <View style={styles.actionTextColumn}>
                  <Text style={styles.actionTitle}>Advisory</Text>
                  <Text style={styles.actionSubtitle}>Outbreak alerts & risk radar</Text>
                </View>
                <View style={[styles.actionArrowCircle, { backgroundColor: '#7B1FA2' }]}>
                  <Text style={styles.actionArrowText}>→</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#05180C',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bgOverlay: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: 'rgba(5, 24, 11, 0.45)',
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1220,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImg: {
    width: 42,
    height: 42,
    marginRight: 10,
  },
  brandTextBox: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A5D6A7',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerPillBtn: {
    backgroundColor: 'rgba(16, 50, 25, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(16, 50, 25, 0.85)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 16,
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 50, 25, 0.85)',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  profileInitialsCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitialsText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  farmerGreetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  farmerAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F8EC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  farmerAvatarEmoji: {
    fontSize: 26,
  },
  greetingInfo: {
    justifyContent: 'center',
  },
  greetingTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
    marginBottom: 3,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 50, 25, 0.85)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
  },
  locationPin: {
    fontSize: 10,
    marginRight: 4,
  },
  locationAddressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D7F5DB',
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    flexWrap: 'wrap',
    gap: 12,
  },
  weatherTempSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherSunIcon: {
    fontSize: 32,
  },
  weatherTempTextBox: {
    justifyContent: 'center',
  },
  weatherTempText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A3822',
    lineHeight: 25,
  },
  weatherConditionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  weatherDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2EBE4',
  },
  weatherMetricBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricIcon: {
    fontSize: 20,
  },
  metricTextColumn: {
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#607267',
  },
  metricValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1A3822',
  },
  metricValueSafe: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#1B5E20',
  },
  metricValueAvoid: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#C62828',
  },
  heroBanner: {
    backgroundColor: '#10461C',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroBannerContent: {
    width: '100%',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
    gap: 6,
  },
  heroBadgeIcon: {
    fontSize: 12,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D7F5DB',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: '#E8F8EC',
    lineHeight: 18,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  quickActionsGridDesktop: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  quickActionsGridMobile: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  quickActionCard: {
    flex: 1,
    minWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.2,
    borderColor: '#E2EBE4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    gap: 12,
  },
  actionIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionTextColumn: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#1A3822',
  },
  actionSubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#4B5C52',
    marginTop: 2,
  },
  actionArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionArrowText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});

export default HomeScreen;
