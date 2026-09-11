/**
 * AgriRaksha AI — Screen 2: Welcome / Farmer Landing Screen
 * 
 * Recreated faithfully from the reference design:
 * - Full-screen authentic Indian farming landscape with smiling Indian farmer in lush crops
 * - Top-right "Skip →" button navigating to Login
 * - Bold headline: "Grow Better. Farm Smarter."
 * - Subtitle: "AI-powered crop guidance, disease detection and expert advice for a healthier tomorrow."
 * - 3 clean circular frosted badges: Protect Crops, Support Farmers, Sustainable Agriculture
 * - Decorative right-aligned message: "For Farmers, For a Greener India 🍃"
 * - Onboarding pagination dots: ● ○ ○
 * - Large rounded green CTA: "Get Started →" (navigates to Login)
 * - Footer: "🇮🇳 | Built for Indian Farmers"
 * - Responsive on both mobile and web without any phone mockup frame
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    navigation.navigate('LanguageSelect');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={require('../../assets/welcome_farmer_bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Responsive Content Container */}
        <View
          style={[
            styles.contentWrapper,
            {
              paddingTop: Math.max(insets.top + 8, Platform.OS === 'web' ? 24 : 44),
              paddingBottom: Math.max(insets.bottom + 12, Platform.OS === 'web' ? 20 : 28),
            },
          ]}
        >
          {/* Top Bar with Skip Button */}
          <View style={styles.topBar}>
            <View style={styles.brandPill}>
              <Text style={styles.brandPillText}>🌾 Kisaan Suraksha</Text>
            </View>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleGetStarted}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip →</Text>
            </TouchableOpacity>
          </View>

          {/* Upper Content Section */}
          <View style={styles.headerSection}>
            <Text style={styles.mainHeadline}>
              Grow Better.{'\n'}Farm Smarter.
            </Text>
            <Text style={styles.subHeadline}>
              AI-powered crop guidance, disease detection and expert advice for a healthier tomorrow.
            </Text>
          </View>

          {/* Middle Row: Left Benefits & Right Decorative Motto */}
          <View style={styles.middleRow}>
            {/* Left Column: 3 Benefit Badges */}
            <View style={styles.benefitsColumn}>
              {/* Benefit 1 */}
              <View style={styles.benefitItem}>
                <View style={styles.benefitBadge}>
                  <Text style={styles.benefitEmoji}>🌱</Text>
                </View>
                <View style={styles.benefitTextBox}>
                  <Text style={styles.benefitTitle}>Protect</Text>
                  <Text style={styles.benefitSub}>Crops</Text>
                </View>
              </View>

              {/* Benefit 2 */}
              <View style={styles.benefitItem}>
                <View style={styles.benefitBadge}>
                  <Text style={styles.benefitEmoji}>👥</Text>
                </View>
                <View style={styles.benefitTextBox}>
                  <Text style={styles.benefitTitle}>Support</Text>
                  <Text style={styles.benefitSub}>Farmers</Text>
                </View>
              </View>

              {/* Benefit 3 */}
              <View style={styles.benefitItem}>
                <View style={styles.benefitBadge}>
                  <Text style={styles.benefitEmoji}>🍃</Text>
                </View>
                <View style={styles.benefitTextBox}>
                  <Text style={styles.benefitTitle}>Sustainable</Text>
                  <Text style={styles.benefitSub}>Agriculture</Text>
                </View>
              </View>
            </View>

            {/* Right Column: Decorative Calligraphy Message */}
            <View style={styles.decorativeCard}>
              <Text style={styles.decorativeLine1}>For</Text>
              <Text style={styles.decorativeLine2}>Farmers</Text>
              <Text style={styles.decorativeLine3}>For a</Text>
              <View style={styles.decorativeLine4Row}>
                <Text style={styles.decorativeLine4}>Greener India</Text>
                <Text style={styles.leafIcon}>🍃</Text>
              </View>
            </View>
          </View>

          {/* Spacer to let the farmer portrait breathe */}
          <View style={styles.flexibleSpacer} />

          {/* Bottom Controls Section */}
          <View style={styles.bottomSection}>
            {/* Onboarding Pagination Dots */}
            <View style={styles.paginationRow}>
              <View style={styles.activeDot} />
              <View style={styles.inactiveDot} />
              <View style={styles.inactiveDot} />
            </View>

            {/* Primary CTA Button */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleGetStarted}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaButtonText}>Get Started →</Text>
            </TouchableOpacity>

            {/* Indian Farmers Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerFlag}>🇮🇳</Text>
              <Text style={styles.footerDivider}>|</Text>
              <Text style={styles.footerText}>Built for Indian Farmers</Text>
            </View>
          </View>
        </View>
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
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  brandPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A3B1C',
    letterSpacing: 0.3,
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
  headerSection: {
    marginTop: 6,
  },
  mainHeadline: {
    fontSize: 34,
    fontWeight: '900',
    color: '#083318',
    lineHeight: 40,
    letterSpacing: -0.6,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subHeadline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144622',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: '92%',
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 18,
  },
  benefitsColumn: {
    gap: 14,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitEmoji: {
    fontSize: 20,
  },
  benefitTextBox: {
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A3317',
    lineHeight: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  benefitSub: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A3317',
    lineHeight: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  decorativeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'flex-start',
    marginRight: 2,
    marginTop: 4,
  },
  decorativeLine1: {
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '700',
    color: '#0D4822',
    lineHeight: 19,
  },
  decorativeLine2: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#0A3B1B',
    lineHeight: 24,
  },
  decorativeLine3: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '700',
    color: '#0D4822',
    lineHeight: 17,
    marginTop: 2,
  },
  decorativeLine4Row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decorativeLine4: {
    fontSize: 17,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#083317',
    lineHeight: 21,
  },
  leafIcon: {
    fontSize: 15,
    marginLeft: 4,
  },
  flexibleSpacer: {
    flex: 1,
    minHeight: 40,
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  activeDot: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
  },
  inactiveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  ctaButton: {
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
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  footerFlag: {
    fontSize: 14,
  },
  footerDivider: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '300',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export default WelcomeScreen;
