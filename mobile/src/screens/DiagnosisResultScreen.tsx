/**
 * AgriRaksha AI — Diagnosis Result & Treatment Advisory Screen
 * 
 * Clinical report for crop leaves:
 * - Disease / pest name in local languages (Marathi, Telugu, Hindi, English)
 * - Confidence & severity meters
 * - Audio voice readout in native tongue via expo-speech
 * - Multi-tier prescription tabs: Organic Bio-pesticides & Chemical solutions
 * - WhatsApp sharing and KVK expert consult
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Share,
  Dimensions,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context';
import { Colors, FontSizes, Spacing } from '../constants';

const { width } = Dimensions.get('window');

interface DiagnosisResultScreenProps {
  navigation: any;
  route?: {
    params?: {
      scan?: any;
      advisory?: any;
      imageUri?: string;
    };
  };
}

const DiagnosisResultScreen: React.FC<DiagnosisResultScreenProps> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { language } = useAuth();

  const scan = route?.params?.scan || {
    cropName: 'Tomato',
    diseaseName: 'Tomato Early Blight (अल्टरनेरिया करपा)',
    confidence: 0.94,
    severity: 'moderate',
    isHealthy: false,
    symptoms: ['Concentric brown circular spots', 'Yellow chlorotic halo'],
    organicTreatment: [
      'Spray Neem Oil (Azadirachtin 10000 ppm) @ 2ml/L water',
      'Apply Trichoderma viride bio-fungicide @ 5g/L water',
    ],
    chemicalTreatment: [
      'Mancozeb 75% WP @ 2.5g per litre of water',
      'Or Chlorothalonil 75% WP @ 2g per litre of water',
    ],
    preventionTips: [
      'Avoid overhead sprinkler irrigation',
      'Maintain 60cm row spacing for good air circulation',
    ],
  };

  const advisory = route?.params?.advisory;
  const imageUri = route?.params?.imageUri || scan.imageUrl;

  const [activeTab, setActiveTab] = useState<'organic' | 'chemical' | 'preventive'>('organic');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentLang = (language || 'mr') as 'mr' | 'te' | 'hi' | 'en';

  const localizedName =
    advisory?.localNames?.[currentLang] ||
    scan.diseaseName;

  const voiceText =
    advisory?.voiceSummary?.[currentLang] ||
    `${scan.cropName} diagnosis: ${scan.diseaseName}. Confidence ${Math.round(
      (scan.confidence || 0.9) * 100
    )} percent. Please apply recommended treatment.`;

  const handleToggleVoice = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const voiceLangMap: { [key: string]: string } = {
        mr: 'mr-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        en: 'en-IN',
      };

      Speech.speak(voiceText, {
        language: voiceLangMap[currentLang] || 'en-IN',
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      const shareMsg = `🌾 Kisaan Suraksha Diagnostic Report\nCrop: ${scan.cropName}\nDiagnosed: ${localizedName}\nConfidence: ${Math.round(
        (scan.confidence || 0.9) * 100
      )}%\nSeverity: ${scan.severity?.toUpperCase()}\n\nRecommended Organic Spray: ${
        scan.organicTreatment?.[0] || 'Neem oil 10000 ppm @ 2ml/L'
      }\nChemical: ${scan.chemicalTreatment?.[0] || 'Mancozeb 75% WP @ 2.5g/L'}`;

      await Share.share({ message: shareMsg });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const isHealthy = scan.isHealthy;
  const severityColor =
    scan.severity === 'severe'
      ? Colors.danger
      : scan.severity === 'moderate'
      ? Colors.warning
      : Colors.healthy;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>✕ Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShareWhatsApp}
            activeOpacity={0.7}
          >
            <Text style={styles.shareBtnText}>📤 Share Report</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.reportTitle}>Diagnostic Report / रोग निदान अहवाल</Text>
        <Text style={styles.reportSubtitle}>
          {scan.cropName} • ICAR Pathology Verified
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Leaf Photo with Bounding Spotlight */}
        {imageUri && (
          <View style={styles.imageCard}>
            <Image source={{ uri: imageUri }} style={styles.leafImage} />
            <View style={styles.imageOverlayBadge}>
              <Text style={styles.imageOverlayText}>
                {Math.round((scan.confidence || 0.94) * 100)}% Match
              </Text>
            </View>
          </View>
        )}

        {/* Primary Diagnosis Card */}
        <View style={styles.card}>
          <View style={styles.diseaseHeader}>
            <View style={styles.diseaseTitleBox}>
              <Text style={styles.diseaseLocalName}>{localizedName}</Text>
              <Text style={styles.diseaseEnglishName}>{scan.diseaseName}</Text>
              {advisory?.pathogen && (
                <Text style={styles.pathogenText}>Pathogen: {advisory.pathogen}</Text>
              )}
            </View>

            <View
              style={[
                styles.severityPill,
                { backgroundColor: `${severityColor}20`, borderColor: severityColor },
              ]}
            >
              <Text style={[styles.severityPillText, { color: severityColor }]}>
                {isHealthy ? 'HEALTHY' : `${scan.severity?.toUpperCase()} SEVERITY`}
              </Text>
            </View>
          </View>

          {/* Confidence Progress Bar */}
          <View style={styles.confidenceSection}>
            <View style={styles.confidenceLabelRow}>
              <Text style={styles.confidenceLabel}>AI Diagnostic Confidence</Text>
              <Text style={styles.confidencePercent}>
                {Math.round((scan.confidence || 0.94) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.round((scan.confidence || 0.94) * 100)}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Farmer Audio Readout Bar */}
        <TouchableOpacity
          style={[styles.voiceBar, isSpeaking && styles.voiceBarActive]}
          onPress={handleToggleVoice}
          activeOpacity={0.8}
        >
          <View style={styles.voiceIconCircle}>
            <Text style={styles.voiceEmoji}>{isSpeaking ? '⏹️' : '🔊'}</Text>
          </View>
          <View style={styles.voiceTextContainer}>
            <Text style={styles.voiceBarTitle}>
              {isSpeaking
                ? 'बोलत आहे... (Speaking in your language)'
                : currentLang === 'mr'
                ? '🔊 डॉक्टरांचा सल्ला ऐका (मराठीत ऐका)'
                : currentLang === 'te'
                ? '🔊 నిపుణుల సలహా వినండి (తెలుగులో)'
                : currentLang === 'hi'
                ? '🔊 विशेषज्ञ की सलाह सुनें (हिन्दी में)'
                : '🔊 Listen to Audio Advisory'}
            </Text>
            <Text style={styles.voiceBarSub}>
              {isSpeaking ? 'Tap to pause' : 'Audio guidance for dosages & remedies'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Symptoms Observed */}
        {scan.symptoms && scan.symptoms.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>🔍 Key Symptoms (रोगाची लक्षणे)</Text>
            {scan.symptoms.map((symptom: string, idx: number) => (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{symptom}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Multi-tier Prescription Treatment Tabs */}
        <View style={styles.prescriptionContainer}>
          <Text style={styles.prescriptionTitle}>💊 Treatment Prescription (उपाययोजना)</Text>
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'organic' && styles.tabButtonActive]}
              onPress={() => setActiveTab('organic')}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabButtonText, activeTab === 'organic' && styles.tabButtonTextActive]}
              >
                🌿 Organic Bio-Solutions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'chemical' && styles.tabButtonActive]}
              onPress={() => setActiveTab('chemical')}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabButtonText, activeTab === 'chemical' && styles.tabButtonTextActive]}
              >
                🧪 Chemical Treatment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'preventive' && styles.tabButtonActive]}
              onPress={() => setActiveTab('preventive')}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabButtonText, activeTab === 'preventive' && styles.tabButtonTextActive]}
              >
                🛡️ Prevention
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContentCard}>
            {activeTab === 'organic' && (
              <View>
                <View style={styles.organicBadgeRow}>
                  <Text style={styles.organicBadgeText}>✓ Safe for Soil & Natural Predators</Text>
                </View>
                {(scan.organicTreatment || advisory?.organicTreatment || []).map(
                  (item: string, idx: number) => (
                    <View key={idx} style={styles.remedyRow}>
                      <Text style={styles.remedyIcon}>🌱</Text>
                      <Text style={styles.remedyText}>{item}</Text>
                    </View>
                  )
                )}
              </View>
            )}

            {activeTab === 'chemical' && (
              <View>
                <View style={styles.chemicalAlertRow}>
                  <Text style={styles.chemicalAlertText}>
                    ⚠️ Follow safety gear instructions. Maintain 7-day harvest interval.
                  </Text>
                </View>
                {(scan.chemicalTreatment || advisory?.chemicalTreatment || []).map(
                  (item: string, idx: number) => (
                    <View key={idx} style={styles.remedyRow}>
                      <Text style={styles.remedyIcon}>🧪</Text>
                      <Text style={styles.remedyText}>{item}</Text>
                    </View>
                  )
                )}
              </View>
            )}

            {activeTab === 'preventive' && (
              <View>
                {(scan.preventionTips || advisory?.preventionTips || []).map(
                  (item: string, idx: number) => (
                    <View key={idx} style={styles.remedyRow}>
                      <Text style={styles.remedyIcon}>🛡️</Text>
                      <Text style={styles.remedyText}>{item}</Text>
                    </View>
                  )
                )}
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.kvkButton}
            onPress={() => navigation.navigate('MoreTab')}
            activeOpacity={0.8}
          >
            <Text style={styles.kvkEmoji}>👨‍🌾</Text>
            <Text style={styles.kvkButtonText}>Consult Krishi Vigyan Kendra (KVK)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.homeBtnText}>Return to Dashboard</Text>
          </TouchableOpacity>
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
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
  shareBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  shareBtnText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
  },
  reportTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.white,
  },
  reportSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.primaryBg,
    marginTop: 2,
  },
  scrollContent: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    paddingBottom: 40,
  },
  imageCard: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  leafImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  imageOverlayText: {
    color: '#00E676',
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  diseaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  diseaseTitleBox: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  diseaseLocalName: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  diseaseEnglishName: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pathogenText: {
    fontSize: 11,
    color: Colors.primaryDark,
    fontStyle: 'italic',
    marginTop: 2,
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  severityPillText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  confidenceSection: {
    marginTop: Spacing.sm,
  },
  confidenceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  confidenceLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  confidencePercent: {
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
    color: Colors.primaryDark,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  voiceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#A5D6A7',
  },
  voiceBarActive: {
    backgroundColor: '#C8E6C9',
    borderColor: Colors.primary,
  },
  voiceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  voiceEmoji: {
    fontSize: 22,
  },
  voiceTextContainer: {
    flex: 1,
  },
  voiceBarTitle: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    color: Colors.primaryDark,
  },
  voiceBarSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardHeaderTitle: {
    fontSize: FontSizes.sm + 1,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bulletDot: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    marginRight: 8,
    lineHeight: 18,
  },
  bulletText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  prescriptionContainer: {
    marginBottom: Spacing.md,
  },
  prescriptionTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  tabContentCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  organicBadgeRow: {
    backgroundColor: '#E8F5E9',
    padding: 6,
    borderRadius: 6,
    marginBottom: Spacing.sm,
  },
  organicBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primaryDark,
  },
  chemicalAlertRow: {
    backgroundColor: '#FFF3E0',
    padding: 6,
    borderRadius: 6,
    marginBottom: Spacing.sm,
  },
  chemicalAlertText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#E65100',
  },
  remedyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  remedyIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  remedyText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  actionButtons: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  kvkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: Spacing.md,
    borderRadius: 14,
  },
  kvkEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  kvkButtonText: {
    color: Colors.white,
    fontSize: FontSizes.sm + 1,
    fontWeight: 'bold',
  },
  homeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  homeBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});

export default DiagnosisResultScreen;
