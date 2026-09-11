/**
 * AgriRaksha AI — Screen 3: Language Selection Screen
 * 
 * Recreated faithfully from the reference design:
 * - Full-screen authentic Indian agricultural landscape at sunrise (NO people/farmer)
 * - Top-right "Skip →" button
 * - AgriRaksha logo, title & "Healthy Crops | Prosperous Farmers" tagline
 * - Right-aligned motto: "Same Soil, Brighter Tomorrow 🍃"
 * - Main heading: "Select Your Language"
 * - Sub-heading: "Choose your preferred language to continue with AgriRaksha"
 * - 4 large rounded language cards in a 2x2 grid (English, मराठी, తెలుగు, हिंदी)
 * - Selected card highlighted with distinct green border & soft green background
 * - Solid rounded green CTA button: "Continue →"
 * - Device-storage privacy notice: "🔒 Your language preference is saved only on this device..."
 * - Bottom frosted pill card with 4 agricultural impact indicators
 * - Footer: "🇮🇳 | Built for Indian Farmers"
 * - Preserves existing i18n and AuthContext logic completely
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context';
import { Language } from '../types';

const { width } = Dimensions.get('window');

interface LanguageSelectScreenProps {
  navigation: any;
  route?: {
    params?: {
      fromSettings?: boolean;
    };
  };
}

interface LanguageCardItem {
  code: Language;
  title: string;
  badgeChar: string;
  badgeBg: string;
}

const LANGUAGE_CARDS: LanguageCardItem[] = [
  {
    code: 'en',
    title: 'English',
    badgeChar: 'A',
    badgeBg: '#1B5E20', // Forest Green
  },
  {
    code: 'mr',
    title: 'मराठी',
    badgeChar: 'अ',
    badgeBg: '#8E24AA', // Rich Purple
  },
  {
    code: 'te',
    title: 'తెలుగు',
    badgeChar: 'అ',
    badgeBg: '#1565C0', // Cobalt Blue
  },
  {
    code: 'hi',
    title: 'हिंदी',
    badgeChar: 'अ',
    badgeBg: '#E65100', // Terracotta Orange
  },
];

export const LanguageSelectScreen: React.FC<LanguageSelectScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { i18n } = useTranslation();
  const { language, setLanguage } = useAuth();
  const [selectedLang, setSelectedLang] = useState<Language>(language || 'en');
  const isFromSettings = route?.params?.fromSettings;

  const handleSelect = (code: Language) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
  };

  const handleContinue = async () => {
    await setLanguage(selectedLang);
    await i18n.changeLanguage(selectedLang);

    if (isFromSettings) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    if (isFromSettings) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={require('../../assets/language_farm_bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 8, Platform.OS === 'web' ? 24 : 44),
              paddingBottom: Math.max(insets.bottom + 12, Platform.OS === 'web' ? 20 : 28),
            },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.contentWrapper}>
            {/* Top Bar with Skip Action */}
            <View style={styles.topBar}>
              <View style={styles.topBarPlaceholder} />
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Skip →</Text>
              </TouchableOpacity>
            </View>

            {/* AgriRaksha Branding & Right Decorative Motto */}
            <View style={styles.brandRow}>
              <View style={styles.brandCenter}>
                <Image
                  source={require('../../assets/agriraksha_logo_clean.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.brandTitle}>Kisaan Suraksha</Text>
                <Text style={styles.brandTagline}>Healthy Crops | Prosperous Farmers</Text>
              </View>

              {/* Decorative handwritten motto */}
              <View style={styles.decorativeMotto}>
                <Text style={styles.mottoLine1}>Same Soil</Text>
                <Text style={styles.mottoLine2}>Brighter</Text>
                <View style={styles.mottoLine3Row}>
                  <Text style={styles.mottoLine3}>Tomorrow</Text>
                  <Text style={styles.leafIcon}>🍃</Text>
                </View>
              </View>
            </View>

            {/* Heading Section */}
            <View style={styles.headingSection}>
              <Text style={styles.mainHeading}>Select Your Language</Text>
              <Text style={styles.subHeading}>
                Choose your preferred language{'\n'}to continue with Kisaan Suraksha
              </Text>
            </View>

            {/* 2x2 Language Selection Grid */}
            <View style={styles.gridContainer}>
              {LANGUAGE_CARDS.map((item) => {
                const isSelected = selectedLang === item.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.langCard,
                      isSelected && styles.langCardSelected,
                    ]}
                    onPress={() => handleSelect(item.code)}
                    activeOpacity={0.8}
                  >
                    {/* Language Badge */}
                    <View
                      style={[
                        styles.badgeBox,
                        { backgroundColor: item.badgeBg },
                      ]}
                    >
                      <Text style={styles.badgeText}>{item.badgeChar}</Text>
                    </View>

                    {/* Language Name */}
                    <Text
                      style={[
                        styles.langTitle,
                        isSelected && styles.langTitleSelected,
                      ]}
                    >
                      {item.title}
                    </Text>

                    {/* Selected Indicator Pill */}
                    {isSelected && (
                      <View style={styles.selectedPill}>
                        <Text style={styles.selectedPillText}>✓ Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Primary Continue Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.continueButtonText}>Continue →</Text>
            </TouchableOpacity>

            {/* Device Security / Privacy Badge */}
            <View style={styles.securityRow}>
              <Text style={styles.lockIcon}>🔒</Text>
              <Text style={styles.securityText}>
                Your language preference is saved only on this device to provide a better experience.
              </Text>
            </View>

            {/* 4 Pillars Impact Card */}
            <View style={styles.impactCard}>
              <View style={styles.impactItem}>
                <Text style={styles.impactEmoji}>🌱</Text>
                <Text style={styles.impactTitle}>Better{'\n'}Guidance</Text>
              </View>
              <View style={styles.impactDivider} />
              <View style={styles.impactItem}>
                <Text style={styles.impactEmoji}>👥</Text>
                <Text style={styles.impactTitle}>Stronger{'\n'}Farmers</Text>
              </View>
              <View style={styles.impactDivider} />
              <View style={styles.impactItem}>
                <Text style={styles.impactEmoji}>🌿</Text>
                <Text style={styles.impactTitle}>Healthier{'\n'}Crops</Text>
              </View>
              <View style={styles.impactDivider} />
              <View style={styles.impactItem}>
                <Text style={styles.impactEmoji}>🌐</Text>
                <Text style={styles.impactTitle}>Greener{'\n'}India</Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerFlag}>🇮🇳</Text>
              <Text style={styles.footerDivider}>|</Text>
              <Text style={styles.footerText}>Built for Indian Farmers</Text>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F2E1B',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  topBarPlaceholder: {
    width: 60,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A3B1C',
    letterSpacing: 0.2,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 2,
  },
  brandCenter: {
    alignItems: 'center',
  },
  logoImage: {
    width: 64,
    height: 56,
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#083318',
    letterSpacing: -0.5,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  brandTagline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#164823',
    letterSpacing: 0.2,
    marginTop: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  decorativeMotto: {
    position: 'absolute',
    right: 0,
    top: 6,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  mottoLine1: {
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '800',
    color: '#0A3B1C',
    lineHeight: 14,
  },
  mottoLine2: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#072C15',
    lineHeight: 16,
  },
  mottoLine3Row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mottoLine3: {
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '800',
    color: '#0A3B1C',
    lineHeight: 14,
  },
  leafIcon: {
    fontSize: 11,
    marginLeft: 2,
  },
  headingSection: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 12,
  },
  mainHeading: {
    fontSize: 27,
    fontWeight: '900',
    color: '#083318',
    letterSpacing: -0.4,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#164823',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 19,
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
    gap: 12,
  },
  langCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2ECE2',
    elevation: 3,
    shadowColor: '#12431E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  langCardSelected: {
    borderColor: '#1B5E20',
    backgroundColor: '#E8F5E9',
    borderWidth: 2.5,
    elevation: 5,
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  badgeBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  langTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#28442A',
    textAlign: 'center',
  },
  langTitleSelected: {
    color: '#0E481D',
    fontWeight: '900',
  },
  selectedPill: {
    marginTop: 6,
    backgroundColor: '#1B5E20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  selectedPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#0F5F2C',
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2ECE2',
    gap: 8,
    marginBottom: 12,
  },
  lockIcon: {
    fontSize: 13,
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    color: '#2B4D31',
    fontWeight: '600',
    lineHeight: 14,
  },
  impactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2ECE2',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 10,
  },
  impactItem: {
    alignItems: 'center',
    flex: 1,
  },
  impactEmoji: {
    fontSize: 18,
    marginBottom: 3,
  },
  impactTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#164823',
    textAlign: 'center',
    lineHeight: 12,
  },
  impactDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#D7E7D8',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 8,
  },
  footerFlag: {
    fontSize: 13,
  },
  footerDivider: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '300',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export default LanguageSelectScreen;
