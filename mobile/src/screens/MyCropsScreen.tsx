/**
 * AgriRaksha AI — Screen 6: My Crops Screen
 * 
 * Recreated faithfully from the reference design:
 * - Full-screen authentic Indian agricultural landscape background with green fields, sunrise, farmer, and rustic wooden sign
 * - Header: "🌱 My Crops" with subtitle: "0 registered crops • Active farm monitoring" (dynamic)
 * - Top-right: "+ Add Crop" button
 * - Filter pills: All (0), 🟢 Healthy (0), 🟡 At Risk (0) with dynamic counts
 * - Empty state: Glassmorphic sprout badge, "No crops found", descriptive guidance, and large white "+ Add Your First Crop" CTA
 * - Crop list: Responsive cards showing crop emoji badge, name, variety, area, status badge, growth stage, sowing age, disease warnings, and navigation to CropDetail
 * - Responsive on mobile, tablet, and desktop without any phone mockup frame
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
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import { Colors } from '../constants';

const { width } = Dimensions.get('window');

const CROP_ICONS: { [key: string]: string } = {
  tomato: '🍅',
  cotton: '🌿',
  soybean: '🌱',
  wheat: '🌾',
  rice: '🌾',
  paddy: '🌾',
  sugarcane: '🎋',
  chilli: '🌶️',
  onion: '🧅',
  potato: '🥔',
  maize: '🌽',
  default: '🍃',
};

const getCropIcon = (cropName?: string) => {
  if (!cropName) return CROP_ICONS.default;
  const key = cropName.toLowerCase().trim();
  return CROP_ICONS[key] || CROP_ICONS.default;
};

const STAGE_LABELS: { [key: string]: string } = {
  sowing: 'Sowing / पेरणी',
  vegetative: 'Vegetative / वाढ',
  flowering: 'Flowering / फुलधारणा',
  fruiting: 'Fruiting / फळधारणा',
  harvesting: 'Harvesting / काढणी',
};

interface MyCropsScreenProps {
  navigation: any;
}

export const MyCropsScreen: React.FC<MyCropsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [crops, setCrops] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'healthy' | 'at_risk'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCrops = useCallback(async () => {
    try {
      const response = await apiService.getCrops();
      setCrops(response.crops || []);
    } catch (error) {
      console.warn('[My Crops] Error fetching crops:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCrops();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCrops();
    });
    return unsubscribe;
  }, [fetchCrops, navigation]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchCrops();
  };

  const isCropHealthy = (crop: any) => {
    return (
      crop.healthStatus === 'healthy' ||
      crop.healthStatus === 'good' ||
      (!crop.healthStatus && crop.riskLevel !== 'high' && (!crop.activeDiseases || crop.activeDiseases.length === 0))
    );
  };

  const allCount = crops.length;
  const healthyCount = crops.filter((c) => isCropHealthy(c)).length;
  const atRiskCount = crops.filter((c) => !isCropHealthy(c)).length;

  const filteredCrops = crops.filter((item) => {
    if (filter === 'healthy') return isCropHealthy(item);
    if (filter === 'at_risk') return !isCropHealthy(item);
    return true;
  });

  const calculateDays = (dateStr?: string) => {
    if (!dateStr) return 30;
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    return Math.max(1, diff);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={require('../../assets/login_farm_bg.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <View style={styles.bgOverlay} />

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 8, Platform.OS === 'web' ? 16 : 36),
              paddingBottom: Math.max(insets.bottom + 90, 100),
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
              colors={['#1E5E2E']}
            />
          }
        >
          <View style={styles.contentWrapper}>
            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.headerTopRow}>
                <View style={styles.headerTitleGroup}>
                  <View style={styles.titleRow}>
                    <Text style={styles.headerIcon}>🌱</Text>
                    <Text style={styles.headerTitle}>My Crops</Text>
                  </View>
                  <Text style={styles.headerSub}>
                    {allCount} registered {allCount === 1 ? 'crop' : 'crops'} • Active farm monitoring
                  </Text>
                </View>

                {/* Top-Right Add Crop Button */}
                <TouchableOpacity
                  style={styles.addCropHeaderBtn}
                  onPress={() => navigation.navigate('AddCrop')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addCropHeaderBtnText}>＋ Add Crop</Text>
                </TouchableOpacity>
              </View>

              {/* Filter Pills Row */}
              <View style={styles.filtersRow}>
                <TouchableOpacity
                  style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
                  onPress={() => setFilter('all')}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      filter === 'all' && styles.filterPillTextActive,
                    ]}
                  >
                    All ({allCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterPill, filter === 'healthy' && styles.filterPillActive]}
                  onPress={() => setFilter('healthy')}
                  activeOpacity={0.75}
                >
                  <View style={styles.filterPillContent}>
                    <Text style={styles.pillDot}>🟢</Text>
                    <Text
                      style={[
                        styles.filterPillText,
                        filter === 'healthy' && styles.filterPillTextActive,
                      ]}
                    >
                      Healthy ({healthyCount})
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterPill, filter === 'at_risk' && styles.filterPillActive]}
                  onPress={() => setFilter('at_risk')}
                  activeOpacity={0.75}
                >
                  <View style={styles.filterPillContent}>
                    <Text style={styles.pillDot}>🟡</Text>
                    <Text
                      style={[
                        styles.filterPillText,
                        filter === 'at_risk' && styles.filterPillTextActive,
                      ]}
                    >
                      At Risk ({atRiskCount})
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Content Area: Loading / Empty State / Crop Cards */}
            {isLoading && crops.length === 0 ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>{t('common.loading', 'Loading your crops...')}</Text>
              </View>
            ) : filteredCrops.length === 0 ? (
              <View style={styles.emptyContainer}>
                {/* Sprout Icon in Circular Badge */}
                <View style={styles.emptyIconCircle}>
                  <Text style={styles.emptySproutEmoji}>🌱</Text>
                </View>

                <Text style={styles.emptyTitle}>No crops found</Text>
                <Text style={styles.emptySubtitle}>
                  Register your farm crops to receive tailored pest advisories and disease risk alerts.
                </Text>

                {/* Big Action CTA */}
                <TouchableOpacity
                  style={styles.emptyAddButton}
                  onPress={() => navigation.navigate('AddCrop')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyAddButtonText}>＋ Add Your First Crop</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cropsList}>
                {filteredCrops.map((crop) => {
                  const isHealthy = isCropHealthy(crop);
                  const days = calculateDays(crop.sowingDate);
                  const stageLabel = STAGE_LABELS[crop.stage] || crop.stage || 'Vegetative';

                  return (
                    <TouchableOpacity
                      key={crop._id}
                      style={styles.cropCard}
                      onPress={() => navigation.navigate('CropDetail', { cropId: crop._id })}
                      activeOpacity={0.85}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.cropIconBadge}>
                          <Text style={styles.cropEmoji}>{getCropIcon(crop.cropName)}</Text>
                        </View>

                        <View style={styles.cropMainInfo}>
                          <View style={styles.cropTitleRow}>
                            <Text style={styles.cropTitle}>{crop.cropName}</Text>
                            <View
                              style={[
                                styles.statusBadge,
                                { backgroundColor: isHealthy ? '#E8F5E9' : '#FFF3E0' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusText,
                                  { color: isHealthy ? '#1E5E2E' : '#E65100' },
                                ]}
                              >
                                {isHealthy ? '● Healthy' : '▲ At Risk'}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.varietyText}>
                            {crop.variety ? crop.variety : 'Standard Variety'}
                            {crop.area ? ` • ${crop.area}` : ''}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.cardDivider} />

                      <View style={styles.cardFooter}>
                        <View style={styles.stageCol}>
                          <Text style={styles.footerLabel}>Growth Stage</Text>
                          <Text style={styles.footerValue}>{stageLabel}</Text>
                        </View>

                        <View style={styles.ageCol}>
                          <Text style={styles.footerLabel}>Sown</Text>
                          <Text style={styles.footerValue}>{days} Days Ago</Text>
                        </View>

                        <Text style={styles.chevron}>→</Text>
                      </View>

                      {crop.activeDiseases && crop.activeDiseases.length > 0 && (
                        <View style={styles.diseaseWarningBanner}>
                          <Text style={styles.diseaseWarningIcon}>⚠️</Text>
                          <Text style={styles.diseaseWarningText}>
                            Attention: {crop.activeDiseases.join(', ')} detected
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
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
    backgroundColor: '#07240E',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bgOverlay: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: 'rgba(6, 24, 11, 0.38)',
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerTitleGroup: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 26,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  headerSub: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  addCropHeaderBtn: {
    backgroundColor: '#357A4A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  addCropHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: 'rgba(20, 55, 28, 0.72)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillDot: {
    fontSize: 10,
    marginRight: 6,
  },
  filterPillText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: '#0A3013',
    fontWeight: '900',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(32, 85, 45, 0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  emptySproutEmoji: {
    fontSize: 42,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  emptySubtitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 440,
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptyAddButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyAddButtonText: {
    color: '#0D441D',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  cropsList: {
    width: '100%',
    paddingTop: 4,
  },
  cropCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EDF7EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#D7EBD8',
  },
  cropEmoji: {
    fontSize: 28,
  },
  cropMainInfo: {
    flex: 1,
  },
  cropTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#083318',
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  varietyText: {
    fontSize: 12.5,
    color: '#3B6043',
    fontWeight: '600',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E8F0E8',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageCol: { flex: 1 },
  ageCol: { flex: 1 },
  footerLabel: {
    fontSize: 10.5,
    color: '#637A67',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D3E1A',
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: '#1E5E2E',
    fontWeight: '900',
    marginLeft: 8,
  },
  diseaseWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  diseaseWarningIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  diseaseWarningText: {
    fontSize: 11.5,
    color: '#E65100',
    fontWeight: '700',
    flex: 1,
  },
});

export default MyCropsScreen;
