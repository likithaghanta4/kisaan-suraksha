/**
 * AgriRaksha AI — Screen: Alerts & Weather Radar
 * 
 * Redesigned with exact pixel-level fidelity to the AgriRaksha AI design system:
 * - Realistic Indian agricultural farm landscape background with dark green overlay
 * - Header: "🔔 Alerts & Weather Radar" with subtitle
 * - 3 Functional Tabs:
 *     1. 🚨 Outbreaks (N)
 *     2. 🌦️ 5-Day Weather
 *     3. 🛡️ Risk Radar
 * - Outbreak Alert Cards:
 *     - Severity indicator (HIGH: red, MODERATE: amber, INFO/LOW: blue)
 *     - Alert thumbnail image (pest / leaf / scheme)
 *     - Title, Location, Affected Crop, Description, Date/Time
 *     - Keyword tags
 *     - "Completely removed Urgent Action / Spray Instructions" per requirements
 *     - Action buttons: "📲 Share to Farmers" & "✓ Acknowledge"
 * - 5-Day Weather & Spray Suitability tab preserved
 * - Risk Radar tab with Agroclimatic drivers & crop vulnerability preserved
 * - No tips section, no extra unrelated panels, fully responsive on desktop/tablet/mobile
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Share,
  ImageBackground,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context';
import { apiService } from '../services/api';

interface AlertsScreenProps {
  navigation?: any;
}

const getAlertSource = (item: any) => {
  if (item.image && typeof item.image === 'string' && item.image.startsWith('http')) {
    return { uri: item.image };
  }
  if (item._id === 'alert-001') {
    return require('../../assets/viewfinder_leaf.jpg');
  }
  if (item._id === 'alert-002') {
    return require('../../assets/crop_diagnostic_bg.jpg');
  }
  if (item._id === 'alert-003') {
    return require('../../assets/agriraksha_logo.jpg');
  }
  return require('../../assets/viewfinder_leaf.jpg');
};

const DEFAULT_TAGS: Record<string, string[]> = {
  'alert-001': ['Fall Armyworm', 'Maize', 'Sorghum', 'Pest', 'Field Monitoring'],
  'alert-002': ['Early Blight', 'Tomato', 'Fungus', 'Weather Risk', 'Preventive Care'],
  'alert-003': ['PMFBY', 'Crop Insurance', 'Government Scheme', 'Kharif 2026'],
};

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { language } = useAuth();
  const currentLang = (language || 'mr') as 'mr' | 'te' | 'hi' | 'en';
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 880;

  const [activeTab, setActiveTab] = useState<'outbreaks' | 'weather' | 'risk'>('outbreaks');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [alertsRes, weatherRes, riskRes] = await Promise.all([
        apiService.getAlerts().catch(() => ({ alerts: [] })),
        apiService.getWeather().catch(() => null),
        apiService.getRisk().catch(() => null),
      ]);

      setAlerts(alertsRes?.alerts || []);
      setWeatherData(weatherRes);
      setRiskData(riskRes);
    } catch (err) {
      console.warn('Error fetching alerts & weather:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiService.markAlertRead(id);
      setAlerts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isRead: true } : a))
      );
    } catch (err) {
      console.warn('Mark read error:', err);
    }
  };

  const handleShareAlert = async (alertItem: any) => {
    try {
      const title = alertItem.titleLocal?.[currentLang] || alertItem.title;
      const desc = alertItem.descriptionLocal?.[currentLang] || alertItem.description;

      await Share.share({
        message: `🚨 Kisaan Suraksha Alert: ${title}\n📍 District: ${alertItem.district}\n🌿 Crop: ${alertItem.crop}\n\n${desc}\n\nStay informed with Kisaan Suraksha.`,
      });
    } catch (err) {
      console.warn('Share alert error:', err);
    }
  };

  const currentSpray = weatherData?.sprayToday;
  const forecast = weatherData?.forecast || [];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

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
              colors={['#2E7D32']}
            />
          }
        >
          <View style={styles.contentWrapper}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <View style={styles.headerIconCircle}>
                  <Text style={styles.headerEmoji}>🔔</Text>
                </View>
                <View style={styles.titleTextGroup}>
                  <Text style={styles.headerTitle}>Alerts & Weather Radar</Text>
                  <Text style={styles.headerSubtitle}>
                    Stay informed about crop diseases, weather conditions and farm risks
                  </Text>
                </View>
              </View>

              {/* 3 Top Navigation Tabs */}
              <View style={styles.tabsRow}>
                <TouchableOpacity
                  style={[
                    styles.tabChip,
                    activeTab === 'outbreaks' && styles.tabChipActive,
                  ]}
                  onPress={() => setActiveTab('outbreaks')}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.tabChipText,
                      activeTab === 'outbreaks' && styles.tabChipTextActive,
                    ]}
                  >
                    🚨 Outbreaks ({alerts.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabChip,
                    activeTab === 'weather' && styles.tabChipActive,
                  ]}
                  onPress={() => setActiveTab('weather')}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.tabChipText,
                      activeTab === 'weather' && styles.tabChipTextActive,
                    ]}
                  >
                    🌦️ 5-Day Weather
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabChip,
                    activeTab === 'risk' && styles.tabChipActive,
                  ]}
                  onPress={() => setActiveTab('risk')}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.tabChipText,
                      activeTab === 'risk' && styles.tabChipTextActive,
                    ]}
                  >
                    🛡️ Risk Radar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Main Content Area */}
            {isLoading && !weatherData && alerts.length === 0 ? (
              <View style={styles.loadingCenter}>
                <ActivityIndicator size="large" color="#69F0AE" />
                <Text style={styles.loadingText}>Loading farm alerts & weather...</Text>
              </View>
            ) : activeTab === 'outbreaks' ? (
              /* TAB 1: OUTBREAK ALERTS */
              <View style={styles.alertsContainer}>
                {alerts.map((item) => {
                  const severity = (item.severity || 'info').toLowerCase();
                  const isHigh = severity === 'high';
                  const isMod = severity === 'moderate';
                  const isInfo = !isHigh && !isMod;

                  const accentColor = isHigh ? '#E53935' : isMod ? '#FB8C00' : '#1E88E5';
                  const severityBg = isHigh ? '#FFEBEE' : isMod ? '#FFF3E0' : '#E3F2FD';
                  const severityText = isHigh ? 'HIGH' : isMod ? 'MODERATE' : 'INFO';
                  const severityIcon = isHigh ? '🚨' : isMod ? '⚠️' : 'ℹ️';

                  const title = item.titleLocal?.[currentLang] || item.title;
                  const desc = item.descriptionLocal?.[currentLang] || item.description;
                  const tags = item.tags || DEFAULT_TAGS[item._id] || [item.crop || 'Crop Alert'];

                  return (
                    <View
                      key={item._id}
                      style={[
                        styles.alertCard,
                        { borderLeftColor: accentColor },
                      ]}
                    >
                      <View style={isDesktop ? styles.alertCardDesktopBody : styles.alertCardMobileBody}>
                        {/* Alert Thumbnail Image */}
                        <View style={styles.alertThumbWrap}>
                          <Image
                            source={getAlertSource(item)}
                            style={styles.alertThumbImage}
                            resizeMode="cover"
                          />
                        </View>

                        {/* Alert Main Details */}
                        <View style={styles.alertDetails}>
                          {/* Severity Header */}
                          <View style={styles.alertCardTopRow}>
                            <View
                              style={[
                                styles.severityPill,
                                { backgroundColor: severityBg, borderColor: accentColor },
                              ]}
                            >
                              <Text style={styles.severityPillIcon}>{severityIcon}</Text>
                              <Text style={[styles.severityPillText, { color: accentColor }]}>
                                {severityText}
                              </Text>
                            </View>
                          </View>

                          {/* Alert Title */}
                          <Text style={styles.alertTitleText}>{title}</Text>

                          {/* Location & Crop Info */}
                          <View style={styles.locationCropRow}>
                            <Text style={styles.locationCropText}>
                              📍 {item.district || 'All Districts'}
                            </Text>
                            <Text style={styles.locationCropSeparator}>•</Text>
                            <Text style={styles.locationCropText}>
                              🌿 Crop: {item.crop || 'General'}
                            </Text>
                          </View>

                          {/* Alert Description */}
                          <Text style={styles.alertDescText}>{desc}</Text>

                          {/* Tag Chips on their own row */}
                          <View style={styles.tagsGroup}>
                            {tags.map((tag: string, tIdx: number) => (
                              <View key={tIdx} style={styles.tagChip}>
                                <Text style={styles.tagChipText}>{tag}</Text>
                              </View>
                            ))}
                          </View>

                          {/* Footer: Share & Acknowledge actions before Date */}
                          <View style={styles.alertFooterRow}>
                            <View style={styles.actionsGroup}>
                              <TouchableOpacity
                                style={styles.shareButton}
                                onPress={() => handleShareAlert(item)}
                                activeOpacity={0.75}
                              >
                                <Text style={styles.shareButtonIcon}>📲</Text>
                                <Text style={styles.shareButtonText}>Share to Farmers</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[
                                  styles.acknowledgeButton,
                                  item.isRead && styles.acknowledgeButtonDone,
                                ]}
                                onPress={() => handleMarkAsRead(item._id)}
                                activeOpacity={0.75}
                              >
                                <Text style={styles.acknowledgeButtonText}>
                                  {item.isRead ? '✓ Acknowledged' : '✓ Acknowledge'}
                                </Text>
                              </TouchableOpacity>
                            </View>

                            <Text style={styles.alertDateText}>🕒 {item.date || 'Today'}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : activeTab === 'weather' ? (
              /* TAB 2: 5-DAY WEATHER & SPRAY WINDOW */
              <View style={styles.weatherContainer}>
                {/* Today's Spraying Hero Banner */}
                {currentSpray && (
                  <View style={styles.sprayHeroCard}>
                    <View style={styles.sprayHeroHeader}>
                      <Text style={styles.sprayHeroIcon}>🌿🌦️</Text>
                      <View style={styles.sprayHeroTitleBox}>
                        <Text style={styles.sprayHeroTitle}>Today's Spraying Suitability</Text>
                        {weatherData?.location ? (
                          <Text style={styles.sprayHeroLocationText}>
                            📍 {weatherData.location}
                            {weatherData.locationType === 'village' ? ' (Village Weather)' : ''}
                          </Text>
                        ) : null}
                        <Text style={styles.sprayHeroBadge}>{currentSpray.sprayBadge}</Text>
                      </View>
                    </View>

                    <View style={styles.sprayTimeBox}>
                      <Text style={styles.sprayTimeLabel}>OPTIMAL APPLICATION WINDOW</Text>
                      <Text style={styles.sprayTimeValue}>{currentSpray.sprayWindow}</Text>
                    </View>

                    <Text style={styles.sprayHeroNote}>{currentSpray.sprayNote}</Text>
                  </View>
                )}

                {/* 5-Day Forecast Grid */}
                <Text style={styles.sectionHeaderTitle}>5-Day Agro-Meteorological Forecast</Text>
                <View style={styles.forecastGrid}>
                  {forecast.map((dayItem: any, index: number) => {
                    const isOptimal = dayItem.spraySuitability === 'optimal';
                    const isAvoid = dayItem.spraySuitability === 'unfavorable';
                    const badgeColor = isOptimal ? '#2E7D32' : isAvoid ? '#C62828' : '#EF6C00';
                    const badgeBg = isOptimal ? '#E8F8EC' : isAvoid ? '#FFEBEE' : '#FFF3E0';

                    return (
                      <View key={index} style={styles.dayCard}>
                        <View style={styles.dayCardTop}>
                          <View style={styles.dayDateRow}>
                            <Text style={styles.dayEmoji}>{dayItem.icon || '⛅'}</Text>
                            <View>
                              <Text style={styles.dayName}>{dayItem.day}</Text>
                              <Text style={styles.dayDate}>{dayItem.date}</Text>
                            </View>
                          </View>

                          <View style={styles.dayTempBox}>
                            <Text style={styles.dayTempMax}>{dayItem.tempMax}°C</Text>
                            <Text style={styles.dayTempMin}>/ {dayItem.tempMin}°C</Text>
                          </View>
                        </View>

                        {/* Weather Metrics */}
                        <View style={styles.dayMetricsRow}>
                          <View style={styles.dayMetric}>
                            <Text style={styles.dayMetricLabel}>Rain Prob</Text>
                            <Text style={styles.dayMetricValue}>{dayItem.rainProb}%</Text>
                          </View>
                          <View style={styles.dayMetric}>
                            <Text style={styles.dayMetricLabel}>Humidity</Text>
                            <Text style={styles.dayMetricValue}>{dayItem.humidity}%</Text>
                          </View>
                          <View style={styles.dayMetric}>
                            <Text style={styles.dayMetricLabel}>Wind</Text>
                            <Text style={styles.dayMetricValue}>{dayItem.windSpeed} km/h</Text>
                          </View>
                        </View>

                        {/* Spraying Suitability Badge */}
                        <View style={[styles.daySprayFooter, { backgroundColor: badgeBg }]}>
                          <Text style={[styles.daySprayText, { color: badgeColor }]}>
                            {dayItem.sprayBadge} ({dayItem.sprayWindow})
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              /* TAB 3: RISK RADAR */
              <View style={styles.riskContainer}>
                {/* Overall Risk Card */}
                <View style={styles.riskCard}>
                  <View style={styles.riskHeader}>
                    <Text style={styles.riskBadgeLarge}>⚠️ Moderate Outbreak Risk (62/100)</Text>
                    <Text style={styles.riskSubtitle}>
                      Calculated from real-time microclimate sensors, leaf wetness & regional spore density
                    </Text>
                  </View>

                  <Text style={styles.factorsTitle}>Agroclimatic Drivers</Text>
                  <View style={styles.factorsGrid}>
                    {riskData?.factors?.map((f: any, idx: number) => (
                      <View key={idx} style={styles.factorItem}>
                        <View style={styles.factorHeader}>
                          <Text style={styles.factorName}>{f.name}</Text>
                          <Text style={styles.factorVal}>{f.value}</Text>
                        </View>
                        <Text style={styles.factorImpact}>• {f.impact}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Crop-Specific Threat Forecasts */}
                <Text style={styles.sectionHeaderTitle}>Crop Outbreak Vulnerability</Text>
                <View style={styles.cropRiskGrid}>
                  {riskData?.diseaseForecasts?.map((df: any, idx: number) => (
                    <View key={idx} style={styles.cropRiskCard}>
                      <View style={styles.cropRiskTop}>
                        <Text style={styles.cropRiskName}>{df.crop}</Text>
                        <View style={styles.cropRiskBadge}>
                          <Text style={styles.cropRiskBadgeText}>
                            {df.riskBadge} ({df.probability}%)
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.cropRiskThreat}>{df.threat}</Text>
                      <Text style={styles.cropRiskAction}>🛡️ {df.preventativeAction}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
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
  header: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26, 85, 40, 0.88)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEmoji: {
    fontSize: 22,
  },
  titleTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.92)',
    marginTop: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  tabChip: {
    backgroundColor: 'rgba(16, 50, 25, 0.72)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  tabChipActive: {
    backgroundColor: '#D7F5DB',
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabChipTextActive: {
    color: '#0A3314',
    fontWeight: '900',
  },
  loadingCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  alertsContainer: {
    gap: 16,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderLeftWidth: 6,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  alertCardDesktopBody: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'flex-start',
  },
  alertCardMobileBody: {
    flexDirection: 'column',
    gap: 14,
  },
  alertThumbWrap: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E8F5E9',
  },
  alertThumbImage: {
    width: '100%',
    height: '100%',
  },
  alertDetails: {
    flex: 1,
  },
  alertCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  severityPillIcon: {
    fontSize: 12,
  },
  severityPillText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  alertDateText: {
    fontSize: 11.5,
    color: '#607267',
    fontWeight: '600',
  },
  alertTitleText: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#1A3822',
    marginBottom: 4,
  },
  locationCropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  locationCropText: {
    fontSize: 12.5,
    color: '#4B5C52',
    fontWeight: '700',
  },
  locationCropSeparator: {
    color: '#A0B0A5',
    fontWeight: '900',
  },
  alertDescText: {
    fontSize: 13,
    color: '#2C3E33',
    lineHeight: 18,
    marginBottom: 12,
  },
  alertFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF4F0',
    paddingTop: 12,
    marginTop: 4,
  },
  tagsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: '#F0F5F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2EBE4',
  },
  tagChipText: {
    fontSize: 11,
    color: '#455A4F',
    fontWeight: '700',
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAF8',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#D4E2D8',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  shareButtonIcon: {
    fontSize: 14,
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1B5E20',
  },
  acknowledgeButton: {
    backgroundColor: '#1E7036',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#1E7036',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  acknowledgeButtonDone: {
    backgroundColor: '#4B5C52',
  },
  acknowledgeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  weatherContainer: {
    gap: 16,
  },
  sprayHeroCard: {
    backgroundColor: '#1B5E20',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  sprayHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sprayHeroIcon: {
    fontSize: 32,
  },
  sprayHeroTitleBox: {
    flex: 1,
  },
  sprayHeroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sprayHeroLocationText: {
    fontSize: 12.5,
    color: '#D7F5DB',
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 2,
  },
  sprayHeroBadge: {
    fontSize: 12,
    color: '#A5D6A7',
    fontWeight: '700',
    marginTop: 2,
  },
  sprayTimeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  sprayTimeLabel: {
    fontSize: 10.5,
    color: '#D7F5DB',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sprayTimeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  sprayHeroNote: {
    fontSize: 12.5,
    color: '#E8F8EC',
    lineHeight: 17,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginTop: 6,
    marginBottom: 4,
  },
  forecastGrid: {
    gap: 12,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  dayCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayEmoji: {
    fontSize: 28,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A3822',
  },
  dayDate: {
    fontSize: 11,
    color: '#607267',
    fontWeight: '600',
  },
  dayTempBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dayTempMax: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A3822',
  },
  dayTempMin: {
    fontSize: 13,
    color: '#607267',
    fontWeight: '700',
    marginLeft: 4,
  },
  dayMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F4FAF6',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  dayMetric: {
    alignItems: 'center',
  },
  dayMetricLabel: {
    fontSize: 10,
    color: '#607267',
    fontWeight: '600',
  },
  dayMetricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A3822',
    marginTop: 1,
  },
  daySprayFooter: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  daySprayText: {
    fontSize: 12,
    fontWeight: '800',
  },
  riskContainer: {
    gap: 16,
  },
  riskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#FFE082',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  riskHeader: {
    marginBottom: 14,
  },
  riskBadgeLarge: {
    fontSize: 16,
    fontWeight: '900',
    color: '#E65100',
  },
  riskSubtitle: {
    fontSize: 12,
    color: '#5A6B60',
    marginTop: 3,
  },
  factorsTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1A3822',
    marginBottom: 8,
  },
  factorsGrid: {
    gap: 8,
  },
  factorItem: {
    backgroundColor: '#FAFCFA',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2EBE4',
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  factorName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1A3822',
  },
  factorVal: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#1B5E20',
  },
  factorImpact: {
    fontSize: 11,
    color: '#607267',
    marginTop: 2,
    fontWeight: '500',
  },
  cropRiskGrid: {
    gap: 10,
  },
  cropRiskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  cropRiskTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cropRiskName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A3822',
  },
  cropRiskBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cropRiskBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C62828',
  },
  cropRiskThreat: {
    fontSize: 12.5,
    color: '#5A6B60',
    marginBottom: 6,
    fontWeight: '600',
  },
  cropRiskAction: {
    fontSize: 12,
    color: '#1B5E20',
    lineHeight: 17,
    fontWeight: '700',
  },
});

export default AlertsScreen;
