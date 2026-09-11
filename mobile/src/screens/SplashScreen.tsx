/**
 * AgriRaksha AI — Splash Screen
 * 
 * Recreated faithfully from the reference design:
 * - Full-screen authentic Indian agricultural landscape with farmer, sunrise, and hills
 * - Prominent AgriRaksha logo, title & "Healthy Crops | Prosperous Farmers" tagline
 * - Elegant "Growing a Healthier Tomorrow" message
 * - Right-aligned feature highlights (Protect Crops, Support Farmers, Sustainable Agriculture)
 * - Modern progress loading bar with "Loading a greener tomorrow..."
 * - "🇮🇳 Built for Indian Farmers" footer branding
 * - Smooth fade-in & progress bar animations
 * - Responsive on both mobile screens and web browsers without any phone mockup frame
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Animated,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useAuth } from '../context';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  navigation: any;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { isAuthenticated, isLoading } = useAuth();

  const progressAnim = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const featuresFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Fade in branding & quote
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // 2. Fade in features slightly after
    Animated.timing(featuresFade, {
      toValue: 1,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // 3. Smooth progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: false,
    }).start();

    // 4. Navigate after progress completes
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Welcome');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, navigation, progressAnim, contentFade, featuresFade]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['12%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={require('../../assets/splash_farm_bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Inner Content Wrapper (centered on wider displays) */}
        <View style={styles.contentWrapper}>
          
          {/* Top Brand Group */}
          <Animated.View style={[styles.brandContainer, { opacity: contentFade }]}>
            <Image
              source={require('../../assets/agriraksha_logo_clean.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>Kisaan Suraksha</Text>
            <Text style={styles.brandTagline}>Healthy Crops | Prosperous Farmers</Text>

            {/* Main Message */}
            <View style={styles.quoteBox}>
              <Text style={styles.quoteLine1}>Growing a</Text>
              <View style={styles.quoteLine2Row}>
                <Text style={styles.quoteLine2}>Healthier Tomorrow</Text>
                <Text style={styles.leafIcon}>🍃</Text>
              </View>
            </View>
          </Animated.View>

          {/* Feature Highlights (Aligned to right over the landscape) */}
          <Animated.View style={[styles.featuresContainer, { opacity: featuresFade }]}>
            <View style={styles.featureItem}>
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeIcon}>🌱</Text>
              </View>
              <View style={styles.featureTextBox}>
                <Text style={styles.featureTitle}>Protect</Text>
                <Text style={styles.featureSub}>Crops</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeIcon}>👥</Text>
              </View>
              <View style={styles.featureTextBox}>
                <Text style={styles.featureTitle}>Support</Text>
                <Text style={styles.featureSub}>Farmers</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeIcon}>🍃</Text>
              </View>
              <View style={styles.featureTextBox}>
                <Text style={styles.featureTitle}>Sustainable</Text>
                <Text style={styles.featureSub}>Agriculture</Text>
              </View>
            </View>
          </Animated.View>

          {/* Lower Loading & Footer Section */}
          <View style={styles.bottomSection}>
            {/* Modern Progress Bar */}
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
            </View>

            {/* Loading Text */}
            <Text style={styles.loadingText}>Loading a greener tomorrow...</Text>

            {/* Indian Farmers Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>🇮🇳 Built for Indian Farmers</Text>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 44 : 54,
    paddingBottom: Platform.OS === 'web' ? 28 : 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoImage: {
    width: 82,
    height: 72,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#083318',
    letterSpacing: -0.8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  brandTagline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#164823',
    letterSpacing: 0.2,
    marginTop: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  quoteBox: {
    alignItems: 'center',
    marginTop: 22,
  },
  quoteLine1: {
    fontSize: 26,
    fontStyle: 'italic',
    fontWeight: '700',
    color: '#134D25',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  quoteLine2Row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  quoteLine2: {
    fontSize: 27,
    fontStyle: 'italic',
    fontWeight: '800',
    color: '#0D3D1C',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  leafIcon: {
    fontSize: 22,
    marginLeft: 6,
  },
  featuresContainer: {
    alignSelf: 'flex-end',
    width: '58%',
    marginRight: 6,
    gap: 14,
    marginVertical: 'auto',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  featureBadgeIcon: {
    fontSize: 20,
  },
  featureTextBox: {
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B3318',
    lineHeight: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featureSub: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B3318',
    lineHeight: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 6,
  },
  progressTrack: {
    width: '78%',
    maxWidth: 320,
    height: 8,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#48BB78',
    borderRadius: 5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  footerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 18,
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

export default SplashScreen;
