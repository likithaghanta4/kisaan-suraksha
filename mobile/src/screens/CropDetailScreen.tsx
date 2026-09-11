/**
 * AgriRaksha AI — Crop Detail Screen
 * 
 * In-depth health profile for a specific registered crop:
 * - Growth stage progression tracker
 * - Health status & risk diagnosis history
 * - Direct AI scan launcher pre-tagged for this crop
 * - Tailored agronomic advisory & spray schedule
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import { Colors, FontSizes, Spacing } from '../constants';

interface CropDetailScreenProps {
  navigation?: any;
  route?: {
    params?: {
      cropId?: string;
    };
  };
}

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

const STAGES = [
  { key: 'sowing', label: 'Sowing', icon: '🌱' },
  { key: 'vegetative', label: 'Vegetative', icon: '🌿' },
  { key: 'flowering', label: 'Flowering', icon: '🌸' },
  { key: 'fruiting', label: 'Fruiting', icon: '🍅' },
  { key: 'harvesting', label: 'Harvesting', icon: '🌾' },
];

const CropDetailScreen: React.FC<CropDetailScreenProps> = ({ navigation, route }) => {
  const cropId = route?.params?.cropId || 'crop-001';
  const { t } = useTranslation();

  const [crop, setCrop] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadCrop = async () => {
      try {
        const data = await apiService.getCrop(cropId);
        setCrop(data.crop);
        setScans(data.scans || []);
      } catch (err) {
        console.warn('Error loading crop details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCrop();
  }, [cropId]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiService.deleteCrop(cropId);
      navigation.goBack();
    } catch (err) {
      console.warn('Delete error:', err);
      navigation.goBack();
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!crop) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.notFoundText}>Crop not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isHealthy = crop.healthStatus === 'healthy';
  const daysSinceSowing = Math.max(
    1,
    Math.floor((Date.now() - new Date(crop.sowingDate || Date.now()).getTime()) / 86400000)
  );

  const currentStageIndex = STAGES.findIndex((s) => s.key === crop.stage);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.headerBackText}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteHeaderBtn}
            onPress={handleDelete}
            disabled={isDeleting}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteHeaderText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroProfile}>
          <View style={styles.iconCircle}>
            <Text style={styles.heroEmoji}>{getCropIcon(crop.cropName)}</Text>
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroCropName}>{crop.cropName}</Text>
            <Text style={styles.heroVariety}>{crop.variety || 'Standard Variety'}</Text>
            <Text style={styles.heroArea}>
              📍 {crop.area || '1 Acre'} • Sown {daysSinceSowing} days ago
            </Text>
          </View>
        </View>

        {/* Health status badge */}
        <View
          style={[
            styles.healthBanner,
            { backgroundColor: isHealthy ? '#E8F5E9' : '#FFF3E0' },
          ]}
        >
          <Text style={styles.healthDot}>{isHealthy ? '🟢' : '🟡'}</Text>
          <Text
            style={[
              styles.healthText,
              { color: isHealthy ? Colors.primaryDark : '#E65100' },
            ]}
          >
            {isHealthy
              ? 'Crop is in Healthy condition (पीक निरोगी आहे)'
              : 'At Risk: Preventative spray recommended (खबरदारीची गरज)'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Primary CTA: Scan This Crop */}
        <TouchableOpacity
          style={styles.scanCtaButton}
          onPress={() => navigation.navigate('ScanTab', { cropName: crop.cropName, cropId: crop._id })}
          activeOpacity={0.85}
        >
          <Text style={styles.scanCtaIcon}>📷</Text>
          <View style={styles.scanCtaTextContainer}>
            <Text style={styles.scanCtaTitle}>Scan This {crop.cropName} Now</Text>
            <Text style={styles.scanCtaSub}>AI leaf inspection for pests and blight</Text>
          </View>
          <Text style={styles.scanCtaArrow}>→</Text>
        </TouchableOpacity>

        {/* Growth Stage Tracker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Growth Stage Tracker (पीक वाढीचा टप्पा)</Text>
          <View style={styles.timelineRow}>
            {STAGES.map((stg, index) => {
              const isPastOrCurrent = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;
              return (
                <View key={stg.key} style={styles.stageStep}>
                  <View
                    style={[
                      styles.stageCircle,
                      isPastOrCurrent && styles.stageCircleActive,
                      isCurrent && styles.stageCircleCurrent,
                    ]}
                  >
                    <Text style={styles.stageEmoji}>{stg.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.stageStepLabel,
                      isCurrent && styles.stageStepLabelCurrent,
                    ]}
                  >
                    {stg.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Seasonal Advisory for this Stage */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌾 Agronomic Advisory for Current Stage</Text>
          <View style={styles.tipRow}>
            <Text style={styles.tipIcon}>💧</Text>
            <Text style={styles.tipText}>
              Maintain light irrigation every 4-5 days. Avoid water-logging during root aerification.
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipIcon}>🧪</Text>
            <Text style={styles.tipText}>
              Foliar application: Spray micronutrient mixture (Zinc + Boron) @ 2g/L for optimal flower set.
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipIcon}>🛡️</Text>
            <Text style={styles.tipText}>
              Preventative biological control: Spray Neem seed kernel extract (NSKE 5%) against sucking pests.
            </Text>
          </View>
        </View>

        {/* Scan History for this crop */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>🔍 Diagnostic Scan History</Text>
            <Text style={styles.scanCountBadge}>{scans.length} Scans</Text>
          </View>

          {scans.length === 0 ? (
            <View style={styles.emptyScans}>
              <Text style={styles.emptyScansText}>
                No scans recorded yet for this {crop.cropName}. Take your first photo to monitor health!
              </Text>
            </View>
          ) : (
            scans.map((scan) => (
              <View key={scan._id} style={styles.scanRow}>
                <View style={styles.scanRowLeft}>
                  <Text style={styles.scanDiseaseTitle}>{scan.diseaseName}</Text>
                  <Text style={styles.scanDate}>
                    Confidence: {Math.round(scan.confidence * 100)}% • Severity: {scan.severity}
                  </Text>
                </View>
                <View
                  style={[
                    styles.severityBadge,
                    {
                      backgroundColor:
                        scan.severity === 'severe'
                          ? '#FFCDD2'
                          : scan.severity === 'moderate'
                          ? '#FFE082'
                          : '#C8E6C9',
                    },
                  ]}
                >
                  <Text style={styles.severityText}>{scan.severity}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  notFoundText: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  backBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerBackBtn: {
    paddingVertical: 4,
  },
  headerBackText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  deleteHeaderBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  deleteHeaderText: {
    color: '#FFCDD2',
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
  },
  heroProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  heroEmoji: {
    fontSize: 34,
  },
  heroText: {
    flex: 1,
  },
  heroCropName: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.white,
  },
  heroVariety: {
    fontSize: FontSizes.sm,
    color: Colors.primaryBg,
    marginTop: 1,
  },
  heroArea: {
    fontSize: FontSizes.xs,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  healthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    marginTop: Spacing.md,
  },
  healthDot: {
    fontSize: 14,
    marginRight: 6,
  },
  healthText: {
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
  },
  scrollContent: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    paddingBottom: 40,
  },
  scanCtaButton: {
    backgroundColor: '#1E6823',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  scanCtaIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  scanCtaTextContainer: {
    flex: 1,
  },
  scanCtaTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.white,
  },
  scanCtaSub: {
    fontSize: 11,
    color: '#D4EED8',
    marginTop: 2,
  },
  scanCtaArrow: {
    fontSize: FontSizes.xl,
    color: Colors.white,
    fontWeight: 'bold',
    marginLeft: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSizes.sm + 1,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  scanCountBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  stageStep: {
    alignItems: 'center',
    flex: 1,
  },
  stageCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stageCircleActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  stageCircleCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  stageEmoji: {
    fontSize: 16,
  },
  stageStepLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stageStepLabelCurrent: {
    fontWeight: 'bold',
    color: Colors.primaryDark,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs + 2,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  emptyScans: {
    paddingVertical: Spacing.md,
  },
  emptyScansText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  scanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  scanRowLeft: {
    flex: 1,
  },
  scanDiseaseTitle: {
    fontSize: FontSizes.xs + 1,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  scanDate: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default CropDetailScreen;
